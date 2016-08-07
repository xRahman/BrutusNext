/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT';
import {SaveableObject} from '../../shared/SaveableObject';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {EntityId} from '../../shared/EntityId';
import {Realm} from '../../game/world/Realm';

export class World extends GameEntity
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

  protected static get SAVE_DIRECTORY() { return "./data/"; }

  // ---------------- Public class data -----------------

  public systemRoomId: EntityId = null;
  public systemAreaId: EntityId = null;
  public systemRealmId: EntityId = null;

  // The room newly created player characters spawn to.
  public tutorialRoomId: EntityId = null;

  // ---------------- Public methods --------------------

  public createRealm(param: { name: string, prototype: string }): EntityId
  {
    let newRealmId = this.createEntity
    (
      {
        name: param.name,
        prototype: param.prototype,
        idList: Game.realms
      }
    );

    // Add new realm id to the list of entities contained in the world.
    this.insertEntity(newRealmId);

    return newRealmId;
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file is the world saved to.
  protected getSaveFileName(): string
  {
    return "world.json";
  }

  // ---------------- Private methods -------------------
}