/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {GameEntity} from '../game/GameEntity';
import {CharacterManager} from '../game/CharacterManager';
import {IdContainer} from '../shared/IdContainer';
import {World} from '../game/world/World';
import {RoomManager} from '../game/RoomManager';
import {AreaManager} from '../game/AreaManager';
import {RealmManager} from '../game/RealmManager';

/// Asi docasne:
import {Area} from '../game/world/Area';
import {Realm} from '../game/world/Realm';

export class Game
{
  public static get entities()
  {
    return Server.game.myEntities;
  }

  public static get characterManager()
  {
    return Server.game.myCharacterManager;
  }

  public static get roomManager()
  {
    return Server.game.myRoomManager;
  }

  public static get areaManager()
  {
    return Server.game.myAreaManager;
  }

  public static get realmManager()
  {
    return Server.game.myRealmManager;
  }

  // ---------------- Public methods --------------------

  // Loads initial state of the game from disk.
  public async load()
  {
    /*
    /// Provizorvni prvni vytvoreni instance sveta:

    let world = new World("Brutus Next World");
    let worldId = new Id(World.WORLD_ENTITY_ID, world.className);

    world.id = worldId;

    /// create realm Prototype Realm

    let newRealmId = world.addNewRealm("Prototype Realm");
    let newRealm = <Realm>Game.entities.getItem(newRealmId);

    let newAreaId = newRealm.addNewArea("Prototype Area");
    let newArea = <Area>Game.entities.getItem(newAreaId);

    let newRoomId = newArea.addNewRoom("Prototype Room");

    /// create realm Shattered Lands

    newRealmId = world.addNewRealm("Shattered Lands");
    newRealm = <Realm>Game.entities.getItem(newRealmId);

    newAreaId = newRealm.addNewArea("Base Camp");
    newArea = <Area>Game.entities.getItem(newAreaId);

    newRoomId = newArea.addNewRoom("Landing Site");

    world.save();
    */

    /// Tohle tu asi bude finalne:
    /*
    let world = new World();
    let worldId = new Id(World.WORLD_ENTITY_ID, world.className);

    world.id = worldId;

    // Load entity from file.
    await world.load();
    */
  }

  // -------------- Protected class data ----------------

  // Game entities (characters, rooms, objects, etc.) are all stored in
  // this container, not in their respective managers. This allows access to
  // any game entity by it's id without knowing what kind of entity it is.
  protected myEntities = new IdContainer<GameEntity>();

  // Character mananger stores a list of ids of all characters in game.
  protected myCharacterManager = new CharacterManager();

  // Room manager stores a list of ids of all rooms in game.
  protected myRoomManager = new RoomManager();

  // Area manager stores a list of ids of all areas in game.
  protected myAreaManager = new AreaManager();

  // Room manager stores a list of ids of all rooms in game.
  protected myRealmManager = new RealmManager();

  // There is only one world in the game (at the moment).
  protected myWorldId = Id.NULL;

  // --------------- Protected methods ------------------
}