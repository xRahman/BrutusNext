/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';
import {PrototypeDataManager} from '../shared/PrototypeDataManager';
import {GameEntity} from '../game/GameEntity';
import {EntityId} from '../game/EntityId';
import {PlayerCharacterManager} from '../game/PlayerCharacterManager';
import {IdableObjectContainer} from '../shared/IdableObjectContainer';
import {World} from '../game/world/World';
import {Room} from '../game/world/Room';
import {RoomFlags} from '../game/world/RoomFlags';
import {IdList} from '../game/IdList'

/// Asi docasne:
import {Area} from '../game/world/Area';
import {Realm} from '../game/world/Realm';

// Unlike "import {SomeClass} from ''", "require()" ensures that required
// module _will_ be loaded here. This is necessary for using dynamic classes,
// because their constructors need to be added to 'global' object in order
// to be dynamically invoked.
// Note:
//  This cannot be done in SaveableObject from some reason (it probably causes
//  cyclic module dependance) even though it would make much more sense there.
require('../game/DynamicClasses');

export class Game
{
  public static get entities()
  {
    return Server.game.entities;
  }

  public static get playerCharacterManager()
  {
    return Server.game.playerCharacterManager;
  }

  public static get characterList()
  {
    return Server.game.characterList;
  }

  public static get roomList()
  {
    return Server.game.roomList;
  }

  public static get areaList()
  {
    return Server.game.areaList;
  }

  public static get realmList()
  {
    return Server.game.realmList;
  }

  public static get worldId()
  {
    return Server.game.worldId;
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
    // --- World ---

    // Create a new world prototype.
    this.prototypeManager.createPrototype
      ({ name: "BrutusWorld", ancestor: "World" });

    // Create world 'BrutusNext World' based on this prototype.
    this.createWorld
      ({ name: "BrutusNext World", prototype: "BrutusWorld" });

    let world = this.worldId.getEntity({ typeCast: World });

    // --- System Realm ---

    // Create a new realm prototype.
    this.prototypeManager.createPrototype
      ({ name: "SystemRealm", ancestor: "Realm" });

    // Create realm 'System Realm' based on this prototype and add it to the
    // world.
    let systemRealmId = world.createRealm
      ({ name: "System Realm", prototype: "SystemRealm" });

    let systemRealm = systemRealmId.getEntity({ typeCast: Realm });

    // Remember system realm id for future easy access.
    world.systemRealmId = systemRealmId;

    // --- System Area ---
    
    // Create a new area prototype.
    this.prototypeManager.createPrototype
      ({ name: "SystemArea", ancestor: "Area" });

    // Create area 'System Area' based on this prototype and add it to the
    // realm.
    let systemAreaId = systemRealm.createArea
      ({ name: "System Area", prototype: "SystemArea" });

    let systemArea = systemAreaId.getEntity({ typeCast: Area });

    // Remember system area id for future easy access.
    world.systemAreamId = systemAreaId;

    // --- System Room ---

    // Create a new room prototype.
    this.prototypeManager.createPrototype
      ({ name: "SystemRoom", ancestor: "Room" });

    // Create room 'System Room' based on this prototype and add it to the
    // area.
    let systemRoomId = systemArea.createRoom
      ({ name: "System Room", prototype: "SystemRoom" });

    // Remember system room id for future easy access.
    world.systemRoomId = systemRoomId;

    systemRoomId.getEntity({ typeCast: Room }).roomFlags.set(RoomFlags.SYSTEM);

    // --- Tutorial Room ---

    // Create a new room prototype.
    this.prototypeManager.createPrototype
      ({ name: "TutorialRoom", ancestor: "Room" });

    // Create room 'Tutorial Room' based on this prototype and add it to the
    // area.
    let tutorialRoomId = systemArea.createRoom
      ({ name: "Tutorial Room", prototype: "TutorialRoom" });

    // Remember system room id for future easy access.
    // (Newly created player characters spawn to this room.)
    world.tutorialRoomId = tutorialRoomId;

    // ---------------------

    // Save all prototypes we have just created.
    this.prototypeManager.save();

    // Save the world we have just created.
    world.save();
  }

  // Loads initial state of the game from disk.
  public async load()
  {
    // Load prototype data for all prototypes.
    await this.prototypeManager.load();
    // Create javascript classes from prototype data (all game entities will
    // be instantiated from these dynamically created prototype classes).
    this.prototypeManager.createClasses();

    // 'BrutusWorld' is a prototype for world
    // (it is created by createDefaultWorld()).
    let world = GameEntity.createInstance
      ({ className: 'BrutusWorld', typeCast: World });

    // Load entity from file.
    await world.load();

    this.worldId = world.getId();
  }

  // -------------- Protected class data ----------------

  // Game entities (characters, rooms, objects, etc.) are all stored in
  // this container, not in their respective managers. This allows access to
  // any game entity by it's id without knowing what kind of entity it is.
  protected entities = new IdableObjectContainer<GameEntity>();

  // List of ids of all characters in game.
  protected characterList = new IdList();

  // List of ids of all rooms in game.
  protected roomList = new IdList();

  // List of ids of all areas in game.
  protected areaList = new IdList();

  // List of ids of all realms in game.
  protected realmList = new IdList();

  // Handles creating of new characters
  protected playerCharacterManager =
    new PlayerCharacterManager(this.characterList);

  // There is only one world in the game (at the moment).
  protected worldId = null;

  // Prototype manager creates classes for all game entities.
  protected prototypeManager = new PrototypeDataManager();

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createWorld(param: { name: string, prototype: string })
  {
    if (!ASSERT(this.worldId === null,
        "Attempt to add new world when there is already a world. There can"
        + " only be one world per game at the moment. World is not added"))
      return;

    // Dynamic creation of a new instance.
    let world = SaveableObject.createInstance
      ({ className: param.prototype, typeCast: World });

    if (!ASSERT_FATAL(world !== null, "Failed to create world"))
      return;

    world.name = param.name;
    this.worldId = Server.idProvider.generateId(world);
  }
}