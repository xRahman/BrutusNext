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
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY() { return "./data/realms/"; }

  // ---------------- Public methods --------------------

  public addNewArea(areaName: string): Id
  {
    let newArea = new Area();

    newArea.name = areaName;

    let newAreaId = Game.areaList.addEntityUnderNewId(newArea);

    // Add new area id to the list of entities contained in this realm.
    this.insertEntity(newAreaId);

    return newAreaId;
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}