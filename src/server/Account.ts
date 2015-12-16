/*
  Part of BrutusNEXT

  Player account.
*/

'use strict';

import {Id} from '../shared/Id';
import {SaveableContainer} from '../shared/SaveableContainer';
import {AccountData} from '../server/AccountData';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends SaveableContainer
{
  // Account name is not saved to the file. Filename represents account name.
  constructor(protected myAccountName: string,
              protected myPlayerConnectionId: Id)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  static get SAVE_DIRECTORY() { return "./data/accounts/"; }

  // ----------------- Public data ----------------------

  public get playerConnection()
  {
    return Server.playerConnectionManager
      .getPlayerConnection(this.myPlayerConnectionId);
  }

  public get accountName() { return this.myAccountName; }

  // ---------------- Public methods --------------------

  public save()
  {
    this.saveToFile(Account.SAVE_DIRECTORY + this.myAccountName + ".json");
  }

  public load()
  {
    this.loadFromFile(Account.SAVE_DIRECTORY + this.myAccountName + ".json");
  }

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

  // -------------- Protected class data ----------------

  public myData = new AccountData();

  // --------------- Protected methods ------------------

  protected md5hash(input: string)
  {
    let hashFacility = crypto.createHash('md5');

    hashFacility.update(input.trim());

    return hashFacility.digest('hex');
  }
}