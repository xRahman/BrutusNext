/*
  Part of BrutusNEXT

  Relm (a set of Areas).
*/

'use strict';

import {GameEntity} from '../../game/GameEntity';
import {RealmData} from '../../game/world/RealmData';

export class Realm extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.myData = new RealmData(name);
  }

  static get SAVE_DIRECTORY() { return "./data/instances/realms/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file will this area be saved to.
  protected myGetSavePath(): string
  {
    return Realm.SAVE_DIRECTORY + this.name + ".json";
  }

  // ---------------- Private methods -------------------
}