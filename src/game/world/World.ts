/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/

'use strict';

import {EntityManager} from '../../shared/entity/EntityManager';
import {SaveableObject} from '../../shared/fs/SaveableObject';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {Server} from '../../server/Server';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Realm} from '../../game/world/Realm';
import {Area} from '../../game/world/Area';
import {Room} from '../../game/world/Room';

export class World extends GameEntity
{
  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  ///protected static get SAVE_DIRECTORY() { return "./data/"; }

  //------------------ Public data ----------------------

  public systemRealm = null;
  public systemArea = null;
  public systemRoom = null;
  // The room newly created player characters spawn to.
  public tutorialRoom = null;

  //----------------- Protected data --------------------

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // ---------------- Public methods --------------------

  public async createSystemRealm()
  {
    // Create a new realm prototype.
    Game.prototypeManager.createPrototype('SystemRealm', 'Realm');
    this.systemRealm = await Server.entityManager.createEntity
    (
      'System Realm',
      Realm,
      NamedEntity.NameCathegory.world
    );

    // Even though we keep direct reference to systemRealm, we stil
    // need to add it to our contents so it's correctly saved, etc.
    this.insertEntity(this.systemRealm);

    // --- System Area ---

    // Create a new area prototype.
    Game.prototypeManager.createPrototype('SystemArea', 'Area');
    this.systemArea = await Server.entityManager.createEntity
    (
      'System Area',
      Area,
      NamedEntity.NameCathegory.world
    );

    // Add System Area to contents of System Realm.
    this.systemRealm.insertEntity(this.systemArea);

    // --- System Room ---

    // Create a new room prototype.
    Game.prototypeManager.createPrototype('SystemRoom', 'Room');
    this.systemRoom = Server.entityManager.createEntity
    (
      'System Room',
      Room
    );
    ///this.systemRoom.setName("System Room");

    // Add System Room to contents of System Area.
    this.systemArea.insertEntity(this.systemRoom);

    // --- Tutorial Room ---

    // Create a new room prototype.
    Game.prototypeManager.createPrototype('TutorialRoom', 'Room');
    this.tutorialRoom = Server.entityManager.createEntity
    (
      'Tutorial Room',
      Room
    );
    ///this.tutorialRoom.setName("Tutorial Room");

    // Add Tutorial Room to contents of System Area.
    this.systemArea.insertEntity(this.tutorialRoom);
  }

  // --------------- Protected methods ------------------

  /*
  // What file is the world saved to.
  protected getSaveFileName(): string
  {
    return "world.json";
  }
  */

  // ---------------- Private methods -------------------
}