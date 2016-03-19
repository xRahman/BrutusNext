/*
  Part of BrutusNEXT

  Player account.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdableSaveableObject} from '../shared/IdableSaveableObject';
import {AccountData} from '../server/AccountData';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends IdableSaveableObject
{
  // Account name is not saved to the file. Filename represents account name.
  constructor(accountName: string,
              protected myPlayerConnectionId: Id)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.accountName = accountName;
  }

  static get SAVE_DIRECTORY() { return "./data/instances/accounts/"; }

  // ----------------- Public data ----------------------

  public get playerConnection()
  {
    return Server.playerConnectionManager
      .getPlayerConnection(this.myPlayerConnectionId);
  }

  public set playerConnectionId(value: Id)
  {
    this.myPlayerConnectionId = value;
  }

  // List of character names this account has access to.
  public characters: Array<string> = [];

  // timeOfCreation initializes to current time, but for existing
  // accounts will be overwritten when loading from file. 
  public timeOfCreation = new Date();

  public accountName = "";

  // ---------------- Public methods --------------------

  // Only hash of the password is stored
  public setPasswordHash(password: string)
  {
    this.myPasswordHash = this.md5hash(password);
  }

  public checkPassword(password: string): boolean
  {
    return this.myPasswordHash === this.md5hash(password);
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
      + " from account " + this.accountName + " which only has "
      + this.getNumberOfCharacters() + " characters.");

    return this.characters[charNumber];
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  protected md5hash(input: string)
  {
    let hashFacility = crypto.createHash('md5');

    hashFacility.update(input.trim());

    return hashFacility.digest('hex');
  }

  // What file will this object be saved to.
  protected getSavePath(): string
  {
    return Account.SAVE_DIRECTORY + this.accountName + ".json";
  }

  // -------------- Private class data ----------------

  private myPasswordHash = "";
}