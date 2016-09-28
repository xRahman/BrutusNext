/*
  Part of BrutusNEXT

  Player account.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FileSystem} from '../../shared/fs/FileSystem';
import {AdminLevel} from '../../server/AdminLevel';
import {Syslog} from '../../server/Syslog';
import {Message} from '../../server/message/Message';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {Connection} from '../../server/connection/Connection';
import {Server} from '../../server/Server';
import {Game} from '../../game/Game';
import {Character} from '../../game/character/Character';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends NamedEntity
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
    // Account names are unique.
    this.isNameUnique = true;
  }

  public static get SAVE_DIRECTORY() { return "./data/accounts/"; }

  // ----------------- Public data ----------------------

  /*
  public get connection()
  {
    return this.connectionId.getEntity({ typeCast: Connection });
  }
  */

  // List of character names this account has access to.
  public characters: Array<string> = [];

  // timeOfCreation initializes to current time, but for existing
  // accounts will be overwritten when loading from file. 
  public timeOfCreation = new Date();

  // ---------------- Public methods --------------------

  // Overrides Entity.getSaveSubDirectory().
  protected static getSaveSubDirectory()
  {
    // Note:
    //   Because we are in a static method, 'this' is actualy the class
    // constructor and it's properties are static properties of the
    // class.
    return this.className + "/";
  }

  public getLastLoginAddress() { return this.lastLoginAddress; }
  public getLastLoginDate()
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
    }

    return this.lastLoginDate;
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

  public createCharacter(characterName: string): Character
  {
    let characterList = Game.characters;

    if (characterList.exists(characterName))
    {
      // Handle error messages.
      this.reportCharacterAlreadyExists(characterName);

      return null;
    }

    let character = characterList.createUniqueCharacter
    (
      characterName,
      this.connection
    );

    // (Also handles error messages)
    if (!this.characterCreatedSuccessfuly(character, characterName))
      return null;

    this.addCharacter(characterName);
    this.logCharacterCreation(this.name, characterName);

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

      this.connection.sendAsBlock
      (
        "&wAn error occured while creating"
        + " your character. Please contact implementors."
      );

      return false;
    }

    return true;
  }

  public getNumberOfCharacters(): number
  {
    return this.characters.length;
  }

  public getCharacterName(charNumber: number): string
  {
    if (charNumber < 0 || charNumber >= this.getNumberOfCharacters())
    {
      ERROR("Attempt to get name of character"
        + " number " + charNumber + " from account"
        + " " + this.name + " which only has "
        + " " + this.getNumberOfCharacters()
        + " characters");
      return null;
    }

    return this.characters[charNumber];
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
        + " accout " + this.name + " because this.connection"
        + " is null");
    }

    // Creating a new Date object initializes it to current date and time.
    this.lastLoginDate = new Date();
  }

  public logout(action: string)
  {
    let accountName = this.name;
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
      // Mark it as implementor account.
      this.adminLevel = AdminLevels.CREATOR;
    }
  }
  */

  // -------------- Protected class data ----------------

  protected lastLoginAddress = "";
  protected lastLoginDate = new Date(0);

  // --------------- Protected methods ------------------

  protected md5hash(input: string)
  {
    let hashFacility = crypto.createHash('md5');

    hashFacility.update(input.trim());

    return hashFacility.digest('hex');
  }

  // What file will this account be saved to.
  protected getSaveFileName(): string
  {
    return this.name + ".json";
  }

  // What path will this account be saved to.
  protected getSaveDirectory(): string
  {
    return Account.SAVE_DIRECTORY;
  }

  // -------------- Private class data ----------------

  private passwordHash = "";

  // ---------------- Private methods --------------------

  private addCharacter(characterName: string)
  {
    if (characterName === "")
    {
      ERROR("Attempt to add new character with empty name to"
        + " account " + this.name + ". Character is not added");
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

    this.characters.push(characterName);

    // This doesn't need to be synchronous.
    this.save();
  }

  private reportCharacterAlreadyExists(characterName: string)
  {
    ERROR("Attempt to create character '" + characterName + "'"
      + " that already exists");

    // Notify the player what went wrong.
    if (this.connection)
    {
      this.connection.sendAsBlock
      (
        "Something is wrong, character named '" + characterName + "'"
        + " already exists. Please contact implementors and ask them to"
        + "resolve this issue."
      );
    }
  }

  private logCharacterCreation(accountName: string, characterName: string)
  {
    Syslog.log
    (
      "Player " + this.name + " has created a new character: "
      + characterName,
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }
}