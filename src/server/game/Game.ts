/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {Entity} from '../../shared/lib/entity/Entity';
import {EntityManager} from '../../shared/lib/entity/EntityManager';
import {PrototypeManager} from '../../shared/lib/entity/PrototypeManager';
///import {NamedEntity} from '../../server/lib/entity/NamedEntity';
import {NameSearchList} from '../../server/lib/entity/NameSearchList';
///import {SaveableObject} from '../../server/lib/fs/SaveableObject';
import {Message} from '../../server/lib/message/Message';
import {ServerApp} from '../../server/lib/app/ServerApp';
import {AdminLevel} from '../../shared/lib/admin/AdminLevel';
import {ServerGameEntity} from '../../server/game/entity/ServerGameEntity';
import {CharacterList} from '../../server/game/character/CharacterList';
import {World} from '../../server/game/world/World';
import {Room} from '../../server/game/world/Room';
import {RoomFlags} from '../../server/game/world/RoomFlags';
import {AbbrevSearchList} from '../../server/game/search/AbbrevSearchList';

/// Asi docasne:
import {Area} from '../game/world/Area';
import {Realm} from '../game/world/Realm';

// TEST:
///import {Script} from '../../server/lib/prototype/Script';

export class Game
{
  public static get DEFAULT_WORLD_NAME() { return 'BrutusNext World'; }

  public static get characters()
  {
    return ServerApp.game.characters;
  }

  public static get rooms()
  {
    return ServerApp.game.rooms;
  }

  public static get areas()
  {
    return ServerApp.game.areas;
  }

  public static get realms()
  {
    return ServerApp.game.realms;
  }

  public static get world()
  {
    return ServerApp.game.world;
  }

  public static get prototypeManager()
  {
    return ServerApp.getPrototypeManager();
  }

  // ---------------- Public methods --------------------

  // Creates and saves a new default world.
  // (this method sould only be used if you don't have 'data' directory yet)
  public async createDefaultWorld()
  {
    if (this.world !== null)
    {
      ERROR("World already exists");
      return;
    }

    // Get prototype named 'World' from PrototypeManager
    // (we us the name of the class World so it will work
    //  even if someone renames the class).
    let prototype = PrototypeManager.get(World.name);

    this.world = await EntityManager.createNewInstanceEntity
    (
      prototype,
      Game.DEFAULT_WORLD_NAME,
      Entity.NameCathegory.WORLD,
      World // Dynamic typecast.
    );

    if (this.world === null)
    {
      ERROR("Failed to create default world");
      return;
    }

    // Create system realm.
    await this.world.createSystemRealm();

    // Save the world we have just created.
    await this.world.save();
  }

  // Loads initial state of the game from disk.
  public async load()
  {
    // Load current state of world from file.
    this.world = await EntityManager.loadEntityByName
    (
      Game.DEFAULT_WORLD_NAME,
      Entity.NameCathegory.WORLD,
      World // Dynamic typecast.
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

  // --- Direct references ---

  // There is only one world in the game (at the moment).
  protected world: World = null;

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}