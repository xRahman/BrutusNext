/*
  Part of BrutusNEXT

  Player account.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdableSaveableContainer} from '../shared/IdableSaveableContainer';
import {AccountData} from '../server/AccountData';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends IdableSaveableContainer
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

    this.myData.accountName = accountName;
  }

  static get SAVE_DIRECTORY() { return "./data/accounts/"; }

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

  public get accountName() { return this.myData.accountName; }
  public set accountName(value: string) { this.myData.accountName = value; }

  // ---------------- Public methods --------------------

  // Only hash of the password is stored
  public set password(value: string)
  {
    this.myData.password = this.md5hash(value);
  }

  public checkPassword(password: string): boolean
  {
    return this.myData.password === this.md5hash(password);
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

    this.myData.characters.push(characterName);

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

    /*
    if (!ASSERT(characterId && characterId.notNull(),
      "Attempt to add new character with invalid id"))
      return;

    this.myData.characters.push(characterId);
    */

    // This doesn't need to be synchronous.
    this.save();
  }

  public getNumberOfCharacters(): number
  {
    return this.myData.characters.length;
  }

  public getCharacterName(charNumber: number): string
  {
    ASSERT_FATAL(charNumber >= 0 && charNumber < this.getNumberOfCharacters(),
      "Attempt to get name of character number " + charNumber
      + " from account " + this.accountName + " which only has "
      + this.getNumberOfCharacters() + " characters.");

    return this.myData.characters[charNumber];
  }

  // -------------- Protected class data ----------------

  public myData = new AccountData();

  // --------------- Protected methods ------------------

  protected md5hash(input: string)
  {
    let hashFacility = crypto.createHash('md5');

    hashFacility.update(input.trim());

    return hashFacility.digest('hex');
  }

  // What file will this object be saved to.
  protected myGetSavePath(): string
  {
    return Account.SAVE_DIRECTORY + this.accountName + ".json";
  }
}