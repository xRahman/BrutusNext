/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/

'use strict';

import {EntityManager} from '../../../server/lib/entity/EntityManager';
import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
import {ServerApp} from '../../../server/lib/Server';
import {Game} from '../../../server/game/Game';
import {GameEntity} from '../../../server/game/entity/GameEntity';
import {Realm} from '../../../server/game/world/Realm';
import {Area} from '../../../server/game/world/Area';
import {Room} from '../../../server/game/world/Room';
import {ClassFactory} from '../../../shared/lib/ClassFactory';

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
    /*
    // Create a new realm prototype.
    Game.prototypeManager.createPrototype('SystemRealm', 'Realm');
    */

    this.systemRealm = await ServerApp.entityManager.createUniqueEntity
    (
      'System Realm',
      Realm,
      NamedEntity.NameCathegory.world
    );

    // Even though we keep direct reference to systemRealm, we stil
    // need to add it to our contents so it's correctly saved, etc.
    this.insertEntity(this.systemRealm);

    // --- System Area ---

    /*
    // Create a new area prototype.
    Game.prototypeManager.createPrototype('SystemArea', 'Area');
    */

    this.systemArea = await ServerApp.entityManager.createUniqueEntity
    (
      'System Area',
      Area,
      NamedEntity.NameCathegory.world
    );

    // Add System Area to contents of System Realm.
    this.systemRealm.insertEntity(this.systemArea);

    // --- System Room ---

    /*
    // Create a new room prototype.
    Game.prototypeManager.createPrototype('SystemRoom', 'Room');
    */

    this.systemRoom = await ServerApp.entityManager.createNamedEntity
    (
      'System Room',
      Room
    );
    ///this.systemRoom.setName("System Room");

    // Add System Room to contents of System Area.
    this.systemArea.insertEntity(this.systemRoom);

    // --- Tutorial Room ---

    /*
    // Create a new room prototype.
    Game.prototypeManager.createPrototype('TutorialRoom', 'Room');
    */
    
    this.tutorialRoom = await ServerApp.entityManager.createNamedEntity
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

ClassFactory.registerPrototypeClass(World);