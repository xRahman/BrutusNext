/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Server} from '../server/Server';
import {EntityId} from '../shared/EntityId';
import {SaveableObject} from '../shared/SaveableObject';
import {PrototypeManager} from '../shared/PrototypeManager';
import {CharacterList} from '../game/CharacterList';
import {IdProvider} from '../shared/IdProvider';
import {World} from '../game/world/World';
import {Room} from '../game/world/Room';
import {RoomFlags} from '../game/world/RoomFlags';
import {AbbrevSearchList} from '../game/AbbrevSearchList';

/// Asi docasne:
import {Area} from '../game/world/Area';
import {Realm} from '../game/world/Realm';

// Unlike "import {SomeClass} from 'SomeClass'", "require()" ensures that
// required module _will_ be loaded here. This is necessary for using dynamic
// classes because their constructors need to be added to 'global' object in
// order to be dynamically invoked.
// Note:
//  This cannot be done in SaveableObject from some reason (it probably causes
//  cyclic module dependance) even though it would make much more sense there.
require('../game/DynamicClasses');

// TEST:
import {Script} from '../shared/Script';

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

  public static get worldId()
  {
    return Server.game.worldId;
  }

  public static get prototypeManager()
  {
    return Server.game.prototypeManager;
  }

  // ---------------- Public methods --------------------

  /*
  public async createDefaultGame()
  {
    // Save prototypeManager (so it's empty save file exists).
    await this.prototypeManager.save();

    await this.createDefaultWorld();
  }
  */

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
    world.systemAreaId = systemAreaId;

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

    ////////////////-------------------------------------
    // TEST

    ///*
    // test savu skriptu
    let scriptCode1 =
      //        "'use strict';\n"
      //      + "this.result = async function onLoad()\n"
      //      + "{\n"
      "  while(true)\n"
      + "  {\n"
      + "    console.log('Launching " + '"onload()"' + " script!');\n"
      + "    console.log('This.test: ' + this.test);\n"
      + "    this.test = 'Test uspesny';\n"
      + "    await delay(1000);\n"
      + "    console.log('onLoad() script awakens from sleep()!');\n"
      + "  }\n";
    //      + "}\n";


    let scriptCode2 =
      "  while(true)\n"
      + "  {\n"
      + "    console.log('Launching " + '"onDeath()"' + " script!');\n"
      + "    console.log('This.test: ' + this.test);\n"
      + "    this.test = 'Druhy test uspesny';\n"
      + "    await delay(1000);\n"
      + "    console.log('onDeath() script awakens from sleep()!');\n"
      + "  }\n";


    let proto = this.prototypeManager.getPrototype("TutorialRoom");
    let script1 = proto.createScript("onLoad");
    script1.code = scriptCode1;
    script1.compile();

    //let script2 = proto.createScript("onDeath");
    //script2.code = scriptCode2;
    //script2.compile();


    this.prototypeManager.save();


    let tutorialRoom =
      world.tutorialRoomId.getEntity({ typeCast: Room });

    tutorialRoom.test = "Test thisu 1";
    tutorialRoom.onLoad = script1.run;
    tutorialRoom.onLoad();

    /// Recompile test
    script1.code = scriptCode2;
    script1.compile();
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
    let world = SaveableObject.createInstance
      ({ className: 'BrutusWorld', typeCast: World });

    // Load current state of world from file.
    await world.load();

    // Remember worldId that we just loaded from file.
    this.worldId = world.getId();
  }

  // -------------- Protected class data ----------------

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

  // Dynamically creates classes from which game entities are inherited.
  protected prototypeManager = new PrototypeManager();

  // --- Direct links (ids) ---

  // There is only one world in the game (at the moment).
  protected worldId = null;

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

    this.worldId = Server.idProvider.createId(world);
  }
}