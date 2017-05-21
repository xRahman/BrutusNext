/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/

'use strict';

import {Entity} from '../../../shared/lib/entity/Entity';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
///import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
///import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
///import {ServerApp} from '../../../server/lib/Server';
import {Game} from '../../../server/game/Game';
import {ServerGameEntity} from '../../../server/game/entity/ServerGameEntity';
import {Realm} from '../../../server/game/world/Realm';
import {Area} from '../../../server/game/world/Area';
import {Room} from '../../../server/game/world/Room';
import {Classes} from '../../../shared/lib/class/Classes';

export class World extends ServerGameEntity
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
    // Get prototype named 'Realm' from Prototypes
    // (we us the name of the class so it will work
    //  even if someone renames it).
    let prototype = Prototypes.get(World.name);

    this.systemRealm = await ServerEntities.createInstance
    (
      Realm,      // Typecast.
      Realm.name, // Prototype name.
      'System Realm',
      Entity.NameCathegory.WORLD
    );

    // Even though we keep direct reference to systemRealm, we stil
    // need to add it to our contents so it's correctly saved, etc.
    this.insertEntity(this.systemRealm);

    // --- System Area ---

    this.systemArea = await ServerEntities.createInstance
    (
      Area,      // Typecast.
      Area.name, // Prototype name.
      'System Area',
      Entity.NameCathegory.WORLD
    );

    // Add System Area to contents of System Realm.
    this.systemRealm.insertEntity(this.systemArea);

    // --- System Room ---

    this.systemRoom = await ServerEntities.createInstance
    (
      Room,      // Typecast.
      Room.name, // Prototype name.
      'System Room',
      Entity.NameCathegory.WORLD
    );

    // Add System Room to contents of System Area.
    this.systemArea.insertEntity(this.systemRoom);

    // --- Tutorial Room ---

    this.tutorialRoom = await ServerEntities.createInstance
    (
      Room,      // Typecast.
      Room.name, // Prototype name.
      'Tutorial Room',
      Entity.NameCathegory.WORLD
    );

    // Add Tutorial Room to contents of System Area.
    this.systemArea.insertEntity(this.tutorialRoom);
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Entity.addToNameLists().
  protected addToNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.addToAbbrevLists().
  protected addToAbbrevLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromNameLists().
  protected removeFromNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromAbbrevLists().
  protected removeFromAbbrevLists()
  {
    /// TODO
  }

  /*
  // What file is the world saved to.
  protected getSaveFileName(): string
  {
    return "world.json";
  }
  */

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(World);