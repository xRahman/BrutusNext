/*
  Part of BrutusNEXT

  Player account.
*/

'use strict';

import {Settings} from '../../Settings';
import {ERROR} from '../../shared/error/ERROR';
import {Utils} from '../../shared/Utils';
import {FileSystem} from '../../shared/fs/FileSystem';
import {AdminLevel} from '../../server/AdminLevel';
import {Syslog} from '../../server/Syslog';
import {Message} from '../../server/message/Message';
import {ScriptableEntity} from '../../shared/entity/ScriptableEntity';
import {Connection} from '../../server/connection/Connection';
import {Server} from '../../server/Server';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Character} from '../../game/character/Character';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends ScriptableEntity
{
  public connection: Connection = null;
  // Do not save and load property 'connection'.
  private static connection = { isSaved: false };

  /// TODO: Accounty se vyrábí stejně jako ostatní entity,
  /// takže asi nebude průchozí předávat jim parametry v konstruktoru.
  /// - i když, možná to přece jen nakonec půjde, zatím to tu nechám
  ///constructor(name: string, connection: Connection)
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    /// TODO: Accounty se vyrábí stejně jako ostatní entity,
    /// takže asi nebude průchozí předávat jim parametry v konstruktoru.
    /// - i když, možná to přece jen nakonec půjde, zatím to tu nechám
    /*
    this.connection = connection;

    this.name = name;
    */

    /// Tohle už takhle jednoduše nastavit nejde, na setování this.name je
    /// třeba použít:
    /// this.setUniqueName(name, NamedEntity.UniqueNameCathegory.accounts);
    /*
    // Account names are unique.
    this.isNameUnique = true;
    */
  }

  ///public static get SAVE_DIRECTORY() { return "./data/accounts/"; }

  // ----------------- Public data ----------------------

  /*
  public get connection()
  {
    return this.connectionId.getEntity({ typeCast: Connection });
  }
  */

  // List of character names this account has access to.
  public characterNames: Array<string> = [];

  // 'timeOfCreation' initializes to current time, but for existing
  // accounts will be overwritten when loading from file. 
  public timeOfCreation = new Date();

  // ---------------- Public methods --------------------

  // -> Returns full name of the character matching to 'abbrev'.
  // -> Returns 'null' if no match is found.
  public getCharacterNameByAbbrev(abbrev: string): string
  {
    for (let characterName of this.characterNames)
    {
      if (Utils.isAbbrev(abbrev, characterName))
        return characterName;
    }

    return null;
  }
  
  public getLastLoginAddress()
  {
    if (this.lastLoginAddress === null)
      return "<unknown ip address>";

    return this.lastLoginAddress;
  }
  
  public getLastLoginDate(): string
  {
    if (typeof this.lastLoginDate === 'string')
    {
      // Date objects are saved as string in JSON so there must be
      // a conversion when date is loaded from file. If you try to
      // load a date variable with value 'null', however, SaveableObject
      // has no way to know what type is it supposed to load into, because
      // null value doesn't know it's type. So the string which is saved
      // in JSON is assigned directly, without a conversion to Date object.
      ERROR("Wrong type of date object encountered in Account. This probably"
        + " means that you have initialized a Date object with <null> value"
        + " or assigned <null> to it prior to loading from file. You must not"
        + " not assign <null> to properties of type Date.");

      return "<invalid date>";
    }

    if (this.lastLoginDate !== null)
    {
      /// Pozn: Pres telnet samozrejme nezjistim, jaky ma player nastaveny
      /// locale, takze to bude nejspis locale serveru, nebo tak neco.
      /// (Asi by se muselo nastavovat rucne v menu jaky chci mit format
      ///  data a casu)
      /// BTW toLocaleString('cs-CZ') nefunguje, porad je to anglicky format.
      return this.lastLoginDate.toLocaleString();
    }
    else
    {
      ERROR("Attempt to request last login date of account"
        + " " + this.getName() + " which doesn't have it"
        + " initialized yet");

      return "<unknown date>";
    }
  }

  // Only hash of the password is stored
  public setPasswordHash(password: string)
  {
    this.passwordHash = this.md5hash(password);
  }

  public checkPassword(password: string): boolean
  {
    return this.passwordHash === this.md5hash(password);
  }

  public isInGame(): boolean
  {
    return this.connection.isInGame();
  }

  public async createCharacter(name: string): Promise<Character>
  {
    let characterList = Game.characters;

    if (characterList === null)
    {
      ERROR("Invalid character list");
      return;
    }

    /*
    if (await characterList.exists(name))
    {
      // Handle error messages.
      this.reportCharacterAlreadyExists(name);

      return null;
    }
    */

    let character = await characterList.createUniqueCharacter
    (
      name,
      this.connection
    );

    // (Also handles error messages)
    if (!this.characterCreatedSuccessfuly(character, name))
      return null;

    this.addCharacter(name);
    this.logCharacterCreation(this.getName(), name);

    return character;
  }

  private characterCreatedSuccessfuly
  (
    character: Character,
    characterName: string
  )
  : boolean
  {
    if (character === null)
    {
      ERROR("Failed to create new character (" + characterName + ")");

      /// This should be send from top-level command handler in
      /// chargen processor, not here. 
      /*
      this.sendAuthError("An error occured while creating"
        + " your character. Please contact admins.");
      */

      return false;
    }

    return true;
  }

  public getNumberOfCharacters(): number
  {
    return this.characterNames.length;
  }

  public getCharacterName(charNumber: number): string
  {
    if (charNumber < 0 || charNumber >= this.getNumberOfCharacters())
    {
      ERROR("Attempt to get name of character"
        + " number " + charNumber + " from account"
        + " " + this.getName() + " which only has "
        + " " + this.getNumberOfCharacters()
        + " characters");
      return null;
    }

    return this.characterNames[charNumber];
  }

  public updateLastLoginInfo()
  {
    if (this.connection !== null)
    {
      this.lastLoginAddress = this.connection.ipAddress;
    }
    else
    {
      ERROR("Unable to update ip adress of last login info of"
        + " accout " + this.getName() + " because this.connection"
        + " is null");
    }

    // Creating a new Date object initializes it to current date and time.
    this.lastLoginDate = new Date();
  }

  public logout(action: string)
  {
    let accountName = this.getName();
    let ipAddress = this.connection.ipAddress;

    /*
    /// Tohle je nakonec ok - kdyz player shodi linku ze hry,
    /// tam mu tam zustane viset ld character, ale account se odloguje.
    if (!ASSERT(!this.isInGame(),
      "Attempt to logout a player who is still in game"))
      return;
    */

    Syslog.log
    (
      accountName + " [" + ipAddress + "] " + action,
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    Server.accounts.dropAccount(this);
  }

  /*
  // Set this.adminLevel to 5 if there are no other accounts on the disk.
  public firstAccountCheck()
  {
    if (FileSystem.isEmpty(Account.SAVE_DIRECTORY))
    {
      // We are creating the first account on this mud installation.
      // Mark it as creator account.
      this.adminLevel = AdminLevels.CREATOR;
    }
  }
  */

  //----------------- Protected data --------------------

  protected lastLoginAddress = null;
  protected lastLoginDate = new Date(0);

  // --------------- Protected methods ------------------

  protected md5hash(input: string)
  {
    let hashFacility = crypto.createHash('md5');

    hashFacility.update(input.trim());

    return hashFacility.digest('hex');
  }

  /*
  // What file will this account be saved to.
  protected getSaveFileName(): string
  {
    return this.name + ".json";
  }
  */

  /*
  // What path will this account be saved to.
  protected getSaveDirectory(): string
  {
    return Account.SAVE_DIRECTORY;
  }
  */

  //------------------ Private data ---------------------

  private passwordHash = "";

  // ---------------- Private methods --------------------

  /*
  private sendAuthError(text: string)
  {
    Message.sendToConnection
    (
      text,
      Message.Type.CONNECTION_ERROR,
      this.connection
    );
  }
  */

  private addCharacter(characterName: string)
  {
    if (characterName === "")
    {
      ERROR("Attempt to add new character with empty name to"
        + " account " + this.getName() + ". Character is not added");
      return;
    }

    /// Zpet k odkazovani postav jmeny.
    ///     Duvod pro ukladani postav v souboru podle jmena postavy je,
    ///   ze stat file <charName> by nemel jak najit spravny soubor, kdyz
    ///   by byl pojmenovany hodnotou idcka.
    ///     Kdyz budou soubory pojmenovane jmenem charu, tak zas nepujde najit
    ///   soubor podle idcka, coz pri vstupu hrace do hry potrebuju.
    /// Reseni tedy je, pojmenovavat player character savy jmenem charu
    /// a seznam charu v accountu ukladat taky pres jmeno charu.
    /// (ukladat entity s unikatnimi jmeny pod jmenem entity ma navic tu
    /// vyhodu, ze si nemusim nekde stranou drzet seznam existujicich jmen,
    /// muzu proste checknout, jestli existuje soubor daneho jmena.

    this.characterNames.push(characterName);

    // This doesn't need to be synchronous.
    this.save();
  }

  private reportCharacterAlreadyExists(characterName: string)
  {
    ERROR("Attempt to create character '" + characterName + "'"
      + " that already exists");
  }

  private logCharacterCreation(accountName: string, characterName: string)
  {
    Syslog.log
    (
      "Player " + this.getName() + " has created a new character: "
      + characterName,
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }
}