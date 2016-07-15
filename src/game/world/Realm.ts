/*
  Part of BrutusNEXT

  Relm (a set of Areas).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Id} from '../../shared/Id';
import {SaveableObject} from '../../shared/SaveableObject';
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

  public addNewArea(param: { name: string, prototype: string }): Id
  {
    ///let newArea = new Area();
    // Dynamic creation of a new instance by calling a constructor saved
    // in 'global' object.
    let newArea = <Area>SaveableObject.createInstance(param.prototype);

    newArea.name = param.name;

    let newAreaId = Game.areaList.addEntityUnderNewId(newArea);

    // Add new area id to the list of entities contained in this realm.
    this.insertEntity(newAreaId);

    return newAreaId;
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}