/*
  Part of BrutusNEXT

  Player account.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {FileSystem} from '../shared/fs/FileSystem';
import {AdminLevels} from '../server/AdminLevels';
import {Mudlog} from '../server/Mudlog';
import {Id} from '../shared/Id';
import {IdableSaveableObject} from '../shared/IdableSaveableObject';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends IdableSaveableObject
{
  // Flag saying that playerConnectionId is not to be saved to JSON.
  private static playerConnectionId = { isSaved: false };

  constructor(public name: string, public playerConnectionId: Id)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  static get SAVE_DIRECTORY() { return "./data/accounts/"; }

  // ----------------- Public data ----------------------

  public getAdminLevel() { return this.adminLevel; }

  public get playerConnection()
  {
    return Server.playerConnectionManager.getItem(this.playerConnectionId);
  }

  // List of character names this account has access to.
  public characters: Array<string> = [];

  // timeOfCreation initializes to current time, but for existing
  // accounts will be overwritten when loading from file. 
  public timeOfCreation = new Date();

  // ---------------- Public methods --------------------

  public getLastLoginAddress() { return this.lastLoginAddress; }
  public getLastLoginDate()
  {
    ASSERT(typeof this.lastLoginDate !== 'string',
      "Wrong type of date object encountered in Account. This probably"
      + " means that you have initialized a Date object with <null> value"
      + " or assigned <null> to it prior to loading from file. You must not"
      + " not assign <null> to properties of type Date.");

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
    return this.playerConnection.isInGame();
  }

  public addNewCharacter(characterName: string)
  {
    if (!ASSERT(characterName !== "",
      "Attempt to add new character with empty name"))
      return;

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

  public getNumberOfCharacters(): number
  {
    return this.characters.length;
  }

  public getCharacterName(charNumber: number): string
  {
    ASSERT_FATAL(charNumber >= 0 && charNumber < this.getNumberOfCharacters(),
      "Attempt to get name of character number " + charNumber
      + " from account " + this.name + " which only has "
      + this.getNumberOfCharacters() + " characters.");

    return this.characters[charNumber];
  }

  public updateLastLoginInfo()
  {
    this.lastLoginAddress = this.playerConnection.ipAddress;

    // Creating a new Date object initializes it to current date and time.
    this.lastLoginDate = new Date();
  }

  public logout(action: string)
  {
    let accountName = this.name;
    let ipAddress = this.playerConnection.ipAddress;

    /*
    /// Tohle je nakonec ok - kdyz player shodi linku ze hry,
    /// tam mu tam zustane viset ld character, ale account se odloguje.
    if (!ASSERT(!this.isInGame(),
      "Attempt to logout a player who is still in game"))
      return;
    */

    Mudlog.log
    (
      accountName + " [" + ipAddress + "] " + action,
      Mudlog.msgType.SYSTEM_INFO,
      AdminLevels.IMMORTAL
    );

    Server.accountManager.dropAccount(this.getId());
  }

  // Set this.adminLevel to 5 if there are no other accounts on the disk.
  public firstAccountCheck()
  {
    if (FileSystem.isEmpty(Account.SAVE_DIRECTORY))
    {
      // We are creating the first account on this mud installation.
      // Mark it as implementor account.
      this.adminLevel = AdminLevels.IMPLEMENTOR;
    }
  }

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
  private adminLevel = AdminLevels.IMMORTAL;
}