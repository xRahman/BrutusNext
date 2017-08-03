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
import {Connection} from '../../../server/lib/connection/Connection';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {Game} from '../../game/Game';
import {Character} from '../../../server/game/character/Character';
import {Classes} from '../../../shared/lib/class/Classes';
import {AccountData} from '../../../shared/lib/account/AccountData';
import {Accounts} from '../../../server/lib/account/Accounts';

export class Account extends ServerEntity
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public data = new AccountData(this);
    private static data: Attributes =
    {
      saved: true,
      edited: true,
      sentToClient: true,
      sentToServer: true
    };

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

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
      // Password hash is saved to name lock file.
      saved: false,
      edited: false,
      sentToClient: false,
      sentToServer: false
    };

  private timeOfCreation: Time = null;

  private lastLoginAddress: string = null;
  private lastLoginTime: Time = null;

  // --------------- Public accessors -------------------

  // -> Returns string in format: email (url [ip]).
  public getUserInfo()
  {
    if (this.connection)
      return this.connection.getUserInfo();

    return this.getEmail();
  }

  public getConnection()
  {
    return this.connection;
  }

  public getEmail()
  {
    // Email address is used as account name
    // (It means that to change the email address,
    // you would have to use setName()).
    return this.getName();
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

  // Probably to be deleted.
  // // -> Returns full name of the character matching to 'abbrev'.
  // // -> Returns 'null' if no match is found.
  // public getCharacterNameByAbbrev(abbrev: string): string
  // {
  //   for (let characterName of this.characterNames)
  //   {
  //     if (Utils.isAbbrev(abbrev, characterName))
  //       return characterName;
  //   }

  //   return null;
  // }
  
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

  public setPasswordHash(passwordHash: string)
  {
    this.passwordHash = passwordHash;
  }

  public validatePassword(passwordHash: string): boolean
  {
    return this.passwordHash === passwordHash;
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

    // Save the character to the disk.
    await ServerEntities.save(character);

    await this.addCharacter(character);

    return character;
  }

  /// Probably to be deleted.
  // public getNumberOfCharacters(): number
  // {
  //   return this.characterNames.length;
  // }

  /// Probably to be deleted.
  // public getCharacterName(charNumber: number): string
  // {
  //   if (charNumber < 0 || charNumber >= this.getNumberOfCharacters())
  //   {
  //     ERROR("Attempt to get name of character"
  //       + " number " + charNumber + " from account"
  //       + " " + this.getName() + " which only has "
  //       + " " + this.getNumberOfCharacters()
  //       + " characters");
  //     return null;
  //   }

  //   return this.characterNames[charNumber];
  // }

  public updateLastLoginInfo()
  {
    if (this.connection !== null)
    {
      this.lastLoginAddress = this.connection.getIpAddress();
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

  public logout()
  {
    let accountName = this.getName();
    let ipAddress = this.connection.getIpAddress();

    /*
    /// Tohle je nakonec ok - kdyz player shodi linku ze hry,
    /// tam mu tam zustane viset ld character, ale account se odloguje.
    if (!ASSERT(!this.isInGame(),
      "Attempt to logout a player who is still in game"))
      return;
    */

    Syslog.log
    (
      "Releasing account " + accountName + " [" + ipAddress + "]",
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

  private async addCharacter(character: Character)
  {
    if (!character.getName())
    {
      ERROR("Attempt to add new character with empty or invalid name"
        + " to account " + this.getName() + ". Character is not added");
      return;
    }

    if (this.data.characters.has(character.getId()))
    {
      ERROR("Attempt to add character " + character.getErrorIdString()
        + " to account " + this.getErrorIdString() + " which is already"
        + " there. Character is not added");
      return;
    }

    console.log('Adding character ' + character.getName());

    this.data.characters.set(character.getId(), character);

    await Entities.save(this);
  }

  private reportCharacterAlreadyExists(characterName: string)
  {
    ERROR("Attempt to create character '" + characterName + "'"
      + " that already exists");
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