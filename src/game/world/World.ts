/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT';
///import {EntityId} from '../../shared/EntityId';
import {SaveableObject} from '../../shared/SaveableObject';
import {Server} from '../../server/Server';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Realm} from '../../game/world/Realm';

export class World extends GameEntity
{
  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  protected static get SAVE_DIRECTORY() { return "./data/"; }

  // ---------------- Public class data -----------------

  public systemRealm = null;
  public systemArea = null;
  public systemRoom = null;
  // The room newly created player characters spawn to.
  public tutorialRoom = null;

  // -------------- Protected class data ----------------

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // ---------------- Public methods --------------------

  /*
  public createRealm(name: string, prototype: string ): Realm
  {

    let realm = Server.entityManager.createEntity(prototype);

    if (!ASSERT_FATAL(this.world !== null, "Failed to create world"))
      return;

    this.world.name = param.name;

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
  */

  public createSystemRealm()
  {
    // Create a new realm prototype.
    Game.prototypeManager.createPrototype('SystemRealm', 'Realm');
    this.systemRealm = Game.createEntity('System Realm', 'SystemRealm');

    // --- System Area ---

    // Create a new area prototype.
    Game.prototypeManager.createPrototype('SystemArea', 'Area');
    this.systemArea = Game.createEntity('System Area', 'SystemArea');

    // --- System Room ---

    // Create a new room prototype.
    Game.prototypeManager.createPrototype('SystemRoom', 'Room');
    this.systemRoom = Game.createEntity('System Room', 'SystemRoom');

    // --- Tutorial Room ---

    // Create a new room prototype.
    Game.prototypeManager.createPrototype('TutorialRoom', 'Room');
    this.systemRoom = Game.createEntity('Tutorial Room', 'TutorialRoom');
  }

  // --------------- Protected methods ------------------

  // What file is the world saved to.
  protected getSaveFileName(): string
  {
    return "world.json";
  }

  // ---------------- Private methods -------------------
}