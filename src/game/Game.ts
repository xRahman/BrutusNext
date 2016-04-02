/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {Server} from '../server/Server';
import {Id} from '../shared/Id';
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

  // Loads initial state of the game from disk.
  public async load()
  {
    /*
    /// Provizorvni prvni vytvoreni instance sveta:

    let world = new World();
    world.name = "BrutusNext World";
    let worldId = Server.idProvider.generateId('World');

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

///    /*
    /// Tohle tu asi bude finalne:
    let world = <World>GameEntity.createInstance('World');

    // Load entity from file.
    await world.load();
///    */
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
  protected playerCharacterManager = new PlayerCharacterManager(this.characterList);

  // There is only one world in the game (at the moment).
  protected worldId = null;

  // --------------- Protected methods ------------------
}