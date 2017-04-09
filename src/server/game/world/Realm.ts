/*
  Part of BrutusNEXT

  Relm (a set of Areas).
*/

'use strict';

import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
import {Game} from '../../game/Game';
import {GameEntity} from '../../../server/game/entity/GameEntity';
import {Area} from '../../game/world/Area';
import {ClassFactory} from '../../../shared/lib/ClassFactory';

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

  ///protected static get SAVE_DIRECTORY() { return "./data/realms/"; }

  // ---------------- Public methods --------------------

  /// Momentálně se to nikde nevolá, tak to nebudu řešit.
  /*
  public createArea(param: { name: string, prototype: string }): EntityId
  {
    let newAreaId = this.createEntity
    (
      {
        name: param.name,
        prototype: param.prototype,
        idList: Game.areas
      }
    );

    // Add new area id to the list of entities contained in this realm.
    this.insertEntity(newAreaId);

    return newAreaId;
  }
  */

  //----------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

ClassFactory.registerClass(Realm);