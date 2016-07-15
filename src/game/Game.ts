/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {PrototypeManager} from '../game/PrototypeManager';
import {GameEntity} from '../game/GameEntity';
import {PlayerCharacterManager} from '../game/PlayerCharacterManager';
import {IdableObjectContainer} from '../shared/IdableObjectContainer';
import {World} from '../game/world/World';
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

  // ---------------- Public methods --------------------

  // Creates and saves a new world.
  // (this method sould only be used if you don't have 'data' directory at all)
  public async createNewWorld()
  {
    // Create world 'BrutusNext World'.

    // World doesn't have a prototype, class World is used directly.
    let world = new World();
    world.name = "BrutusNext World";
    let worldId = Server.idProvider.generateId(world);
    world.setId(worldId);

    // Create realm 'Prototype Realm'.

    let newRealmId = world.addNewRealm("Prototype Realm");
    let newRealm = <Realm>this.entities.getItem(newRealmId);

    this.prototypeManager.addNewPrototype
    (
      { name: "SystemArea", ancestor: "Area" }
    );

    let newAreaId = newRealm.addNewArea
    (
      { name: "System Area", prototype: "SystemArea" }
    );

    let newArea = <Area>this.entities.getItem(newAreaId);
    // TODO: Zmenit na:
    //let newArea = newAreaId.getEntity();

    let newRoomId = newArea.addNewRoom("System Room");

    // Create realm 'Shattered Lands'.

    newRealmId = world.addNewRealm("Shattered Lands");
    newRealm = <Realm>Game.entities.getItem(newRealmId);

    newAreaId = newRealm.addNewArea({ name: "Base Camp", prototype: "TODO" });
    newArea = <Area>Game.entities.getItem(newAreaId);

    newRoomId = newArea.addNewRoom("Landing Site");

    world.save();
  }

  // Loads initial state of the game from disk.
  public async load()
  {
    /*
    /// TEST

    let testRoom = new Room();
    testRoom.test();
    */


    await this.prototypeManager.load();
    this.prototypeManager.createClasses();

    /// Tohle tu asi bude finalne:
    let world = <World>GameEntity.createInstance('World');

    // Load entity from file.
    await world.load();
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
  protected prototypeManager = new PrototypeManager();

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

}