/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {Entity} from '../../shared/lib/entity/Entity';
import {ServerEntities} from '../../server/lib/entity/ServerEntities';
import {Prototypes} from '../../shared/lib/entity/Prototypes';
///import {NamedEntity} from '../../server/lib/entity/NamedEntity';
import {NameList} from '../../shared/lib/entity/NameList';
///import {SaveableObject} from '../../server/lib/fs/SaveableObject';
import {Message} from '../../server/lib/message/Message';
import {ServerApp} from '../../server/lib/app/ServerApp';
import {AdminLevel} from '../../shared/lib/admin/AdminLevel';
import {ServerGameEntity} from '../../server/game/entity/ServerGameEntity';
import {Characters} from '../../server/game/character/Characters';
import {World} from '../../server/game/world/World';
import {Room} from '../../server/game/world/Room';
///import {RoomFlags} from '../../server/game/world/RoomFlags';
import {AbbrevList} from '../../server/game/search/AbbrevList';

/// Asi docasne:
import {Area} from '../game/world/Area';
import {Realm} from '../game/world/Realm';

// TEST:
///import {Script} from '../../server/lib/prototype/Script';

export class Game
{
  public static get DEFAULT_WORLD_NAME() { return 'BrutusNext World'; }

  public static getCharacters()
  {
    return ServerApp.getGame().characters;
  }

  public static getRooms()
  {
    return ServerApp.getGame().rooms;
  }

  public static getAreas()
  {
    return ServerApp.getGame().areas;
  }

  public static getRealms()
  {
    return ServerApp.getGame().realms;
  }

  public static getWorld()
  {
    return ServerApp.getGame().world;
  }

  /// Tohle je blbost, jde použít rovnou Prototypes.
  /*
  public static get prototypes()
  {
    return ServerApp.getPrototypes();
  }
  */

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
    
    this.world = await ServerEntities.createInstance
    (
      World,      // Typecast.
      World.name, // Prototype name.
      Game.DEFAULT_WORLD_NAME,
      Entity.NameCathegory.WORLD
    );

    if (this.world === null)
    {
      ERROR("Failed to create default world");
      return;
    }

    // Create system realm (and it's contents).
    await this.world.createSystemRealm();

    // Save the world we have just created.
    await ServerEntities.save(this.world);
  }

  // Loads initial state of the game from disk.
  public async load()
  {
    // Load current state of world from file.
    this.world = await ServerEntities.loadEntityByName
    (
      World, // Dynamic typecast.
      Game.DEFAULT_WORLD_NAME,
      Entity.NameCathegory.WORLD
    );
  }

  //----------------- Protected data --------------------

  // -------- idLists ---------
  // IdLists only contain entity id's (instances of
  // all entities are owned by Server.idProvider).

  // List of ids of all characters in game.
  // (Also handles creating of new characters).
  protected characters = new Characters();

  // List of ids of all rooms in game.
  protected rooms = new AbbrevList();

  // List of ids of all areas in game.
  protected areas = new AbbrevList();

  // List of ids of all realms in game.
  protected realms = new AbbrevList();

  // --- Direct references ---

  // There is only one world in the game (at the moment).
  protected world: World = null;

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}