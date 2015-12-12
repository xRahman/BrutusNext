/*
  Part of BrutusNEXT

  Player account.
*/

import {Id} from '../shared/Id';
import {SaveableContainer} from '../shared/SaveableContainer';
import {AccountData} from '../server/AccountData';
import {SocketDescriptor} from '../server/SocketDescriptor';
import {GameServer} from '../server/GameServer';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends SaveableContainer
{
  // Account name is not saved to the file. Filename represents account name.
  constructor(protected myAccountName: string,
              protected mySocketDescriptorId: Id)
  {
    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    super({ version: 0 });
  }

  static get SAVE_DIRECTORY() { return "./data/accounts/"; }

  // ---------------- Public methods --------------------

  public get accountName() { return this.myAccountName; }

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

  public processCommand(command: string)
  {
    /// TODO
  }

  public checkPassword(password: string): boolean
  {
    return this.myData.password === this.md5hash(password);
  }

  public isInGame(): boolean
  {
    let descriptorManager =
      GameServer.getInstance().descriptorManager;

    let socketDescriptor =
      descriptorManager.getSocketDescriptor(this.mySocketDescriptorId);

    return socketDescriptor.isInGame();
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