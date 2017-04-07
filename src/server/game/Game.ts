/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {EntityManager} from '../../server/lib/entity/EntityManager';
import {NamedEntity} from '../../server/lib/entity/NamedEntity';
import {NameSearchList} from '../../server/lib/entity/NameSearchList';
import {SaveableObject} from '../../server/lib/fs/SaveableObject';
import {Message} from '../../server/lib/message/Message';
import {Server} from '../../server/lib/Server';
import {AdminLevel} from '../../server/lib/admin/AdminLevel';
import {GameEntity} from '../../server/game/entity/GameEntity';
import {CharacterList} from '../../server/game/character/CharacterList';
import {World} from '../../server/game/world/World';
import {Room} from '../../server/game/world/Room';
import {RoomFlags} from '../../server/game/world/RoomFlags';
import {AbbrevSearchList} from '../../server/game/search/AbbrevSearchList';

/// Asi docasne:
import {Area} from '../game/world/Area';
import {Realm} from '../game/world/Realm';

// TEST:
import {Script} from '../../server/lib/prototype/Script';

export class Game
{
  public static get characters()
  {
    return Server.game.characters;
  }

  public static get rooms()
  {
    return Server.game.rooms;
  }

  public static get areas()
  {
    return Server.game.areas;
  }

  public static get realms()
  {
    return Server.game.realms;
  }

  public static get world()
  {
    return Server.game.world;
  }

  public static get prototypeManager()
  {
    return Server.game.prototypeManager;
  }

  // ---------------- Public methods --------------------

  // Creates and saves a new default world.
  // (this method sould only be used if you don't have 'data' directory yet)
  public async createDefaultWorld()
  {
    /*
    // Create a new world prototype.
    this.prototypeManager.createPrototype('BrutusWorld', 'World');
    */

    if (this.world !== null)
    {
      ERROR("Attempt to create default world when there"
        + " already is a world. There can only be one"
        + " world per game. World is not created");
      return;
    }

    // Create world 'BrutusNext World' based on prototype World.
    this.world = await Server.entityManager.createUniqueEntity
    (
      'Brutus World',
      World,
      NamedEntity.NameCathegory.world
    );

    if (this.world === null)
    {
      ERROR("Failed to create default world");
      return;
    }

    // Create system realm.
    await this.world.createSystemRealm();

    /*
    // Save all prototypes we have just created.
    this.prototypeManager.save();
    */

    // Save the world we have just created.
    await this.world.save();
  }

  // Loads initial state of the game from disk.
  public async load()
  {
    ///await this.prototypeManager.load();
   
    /*
    // Create javascript classes from prototype data (all game entities will
    // be instantiated from these dynamically created prototype classes).
    this.prototypeManager.createClasses();
    */

    /*
    // 'entityManager.createReference()' will return invalid entity reference,
    // because entity 'world' is not in entityManager yet. This invalid
    // entity reference can, however, be used to load an entity from disk,
    // which is exactly what we need to do.
    //   Second parameter is a prototype class
    // (class that will be instantiated).
    this.world = Server.entityManager.createReference(null, World);

    // Load current state of world from file.
    await this.world.load();
    */
    this.world = await Server.entityManager.loadNamedEntity
    (
      'Brutus World',
      NamedEntity.NameCathegory.world
    );
  }

  //----------------- Protected data --------------------

  // -------- idLists ---------
  // IdLists only contain entity id's (instances of
  // all entities are owned by Server.idProvider).

  // List of ids of all characters in game.
  // (Also handles creating of new characters).
  protected characters = new CharacterList();

  // List of ids of all rooms in game.
  protected rooms = new AbbrevSearchList();

  // List of ids of all areas in game.
  protected areas = new AbbrevSearchList();

  // List of ids of all realms in game.
  protected realms = new AbbrevSearchList();

  // -------- managers --------
  // Unlike idLists, managers store actual instances, not just entity ids.

  /*
  // Dynamically creates classes from which game entities are inherited.
  protected prototypeManager = new PrototypeManager();
  */

  // --- Direct references ---

  // There is only one world in the game (at the moment).
  protected world = null;

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}