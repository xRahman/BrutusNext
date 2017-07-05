/*
  Part of BrutusNEXT

  Server-side player account.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Settings} from '../../../server/ServerSettings';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Time} from '../../../shared/lib/utils/Time';
import {Attributes} from '../../../shared/lib/class/Attributes';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {ServerEntity} from '../../../server/lib/entity/ServerEntity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Connection} from '../../../server/lib/net/Connection';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {Game} from '../../game/Game';
import {Character} from '../../../server/game/character/Character';
import {Classes} from '../../../shared/lib/class/Classes';
import {AccountData} from '../../../shared/lib/account/AccountData';
import {Accounts} from '../../../server/lib/account/Accounts';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends ServerEntity
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public data = new AccountData();

  // List of character names this account has access to.
  public characterNames: Array<string> = [];

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private connection: Connection = null;
    private static connection: Attributes =
    {
      saved: false,
      edited: false,
      sentToClient: false,
      sentToServer: false
    };

  private passwordHash = "";
    private static passwordHash: Attributes =
    {
      saved: true,
      edited: false,
      sentToClient: false,
      sentToServer: false
    };

  private timeOfCreation: Time = null;

  private lastLoginAddress: string = null;
  private lastLoginTime: Time = null;

  // --------------- Public accessors -------------------

  public getConnection()
  {
    return this.connection;
  }

  // ---------------- Public methods --------------------

  public attachConnection(connection: Connection)
  {
    if (!connection)
    {
      ERROR("Attempt to attach invalid connection to account"
        + " " + this.getErrorIdString() + ". Connection is not"
        + " attached");
      return;
    }

    connection.account = this;
    this.connection = connection;
  }

  public detachConnection()
  {
    let connection = this.connection;

    if (!connection)
    {
      ERROR("Attempt to detach connection from account"
        + " " + this.getErrorIdString() + " which has"
        + " no connection attached");
      return null;
    }

    connection.account = null;
    this.connection = null;

    return connection;
  }

  public getEmail(): string
  {
    // Email address is used directly as account name,
    // but it is encoded so it can also be used as file name.
    // So to get original email address, we need to decode
    // it back.
    return Utils.decodeEmail(this.getName());
  }

  public getTimeOfCreation(): string
  {
    if (this.timeOfCreation === null)
    {
      ERROR("Time of creation has not been inicialized"
        + " on account " + this.getErrorIdString());
      return Time.UNKNOWN_TIME_STRING;
    }

    return this.timeOfCreation.toLocaleString();
  }

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
  
  public getLastLoginAddress(): string
  {
    if (this.lastLoginAddress === null)
    {
      ERROR("Last login address has not been inicialized"
        + " on account " + this.getErrorIdString());
      return "<unknown ip address>";
    }

    return this.lastLoginAddress;
  }
  
  public getLastLoginTime(): string
  {
    if (this.lastLoginTime === null)
    {
      ERROR("Attempt to read last login time of account"
        + " " + this.getErrorIdString() + " which doesn't"
        + " have it initialized yet");

      return Time.UNKNOWN_TIME_STRING;
    }

    /// Pozn: Pres telnet samozrejme nezjistim, jaky ma player nastaveny
    /// locale, takze to bude nejspis locale serveru, nebo tak neco.
    /// (Asi by se muselo nastavovat rucne v menu jaky chci mit format
    ///  data a casu)
    /// BTW toLocaleString('cs-CZ') nefunguje, porad je to anglicky format.
    return this.lastLoginTime.toLocaleString();
  }

  // Only hash of the password is stored
  public setPasswordHash(password: string)
  {
    this.passwordHash = this.md5hash(password);
  }

  public validatePassword(password: string): boolean
  {
    return this.passwordHash === this.md5hash(password);
  }

  /*
  public isInGame(): boolean
  {
    return this.connection.isInGame();
  }
  */

  public async createCharacter(name: string): Promise<Character>
  {
    let character = await ServerEntities.createInstanceEntity
    (
      Character,
      Character.name,
      name,
      Entity.NameCathegory.CHARACTER
    );

    if (!Entity.isValid(character))
    {
      ERROR("Failed to create character '" + name + "'");
      return null;
    }

    character.atachConnection(this.connection);
    character.addToLists();

    await this.addCharacter(name);
    this.logCharacterCreation(this.getName(), name);

    // Save the character to the disk.
    await ServerEntities.save(character);

    return character;
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

    // Creating a new Time object initializes it to current date and time.
    this.lastLoginTime = new Time();
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
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    // Release 'this' from memory
    // (this will also remove it from all lists).
    Entities.release(this);
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

  // --------------- Protected methods ------------------

  // ~ Overrides Entity.addToNameLists().
  protected addToNameLists()
  {
    Accounts.add(this);
  }

  // ~ Overrides Entity.addToAbbrevLists().
  protected addToAbbrevLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromNameLists().
  protected removeFromNameLists()
  {
    Accounts.remove(this);
  }

  // ~ Overrides Entity.removeFromAbbrevLists().
  protected removeFromAbbrevLists()
  {
    /// TODO
  }

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

  private async addCharacter(characterName: string)
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

    await Entities.save(this);
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
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }

  // ---------------- Event Handlers -------------------

  // Triggers when an entity is instantiated.
  protected onLoad()
  {
    // Calling Time() without parameters initializes it to current time.
    this.timeOfCreation = new Time();
  }
}

Classes.registerEntityClass(Account);