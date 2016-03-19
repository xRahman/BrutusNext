/*
  Part of BrutusNEXT

  Relm (a set of Areas).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Id} from '../../shared/Id';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Area} from '../../game/world/Area';

export class Realm extends GameEntity
{
  constructor(name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  static get SAVE_DIRECTORY() { return "./data/instances/realms/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public addNewArea(areaName: string): Id
  {
    let newArea = new Area(areaName);
    let newAreaId = Game.areaManager.addNewEntity(newArea);

    // Add new area id to the list of entities contained in this realm.
    this.addEntity(newAreaId);

    return newAreaId;
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file will this area be saved to.
  protected getSavePath(): string
  {
    return Realm.SAVE_DIRECTORY + this.name + ".json";
  }

  // ---------------- Private methods -------------------
}