/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

/// DEBUG:
const util = require('util');

import {ERROR} from '../shared/error/ERROR';
import {EntityManager} from '../shared/entity/EntityManager';
import {SaveableObject} from '../shared/fs/SaveableObject';
import {PrototypeManager} from '../shared/prototype/PrototypeManager';
import {Message} from '../server/message/Message';
import {Server} from '../server/Server';
import {AdminLevel} from '../server/AdminLevel';
import {GameEntity} from '../game/GameEntity';
import {CharacterList} from '../game/character/CharacterList';
import {World} from '../game/world/World';
import {Room} from '../game/world/Room';
import {RoomFlags} from '../game/world/RoomFlags';
import {AbbrevSearchList} from '../game/AbbrevSearchList';

/// Asi docasne:
import {Area} from '../game/world/Area';
import {Realm} from '../game/world/Realm';

// TEST:
import {Script} from '../shared/prototype/Script';

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
    // Create a new world prototype.
    this.prototypeManager.createPrototype('BrutusWorld', 'World');

    if (this.world !== null)
    {
      ERROR("Attempt to create new world when there"
        + " already is a world. There can only be one"
        + " world per game. World is not created");
      return;
    }

    // Create world 'BrutusNext World' based on this prototype.
    this.world = EntityManager.createNamedEntity
    (
      'BrutusNext World',
      'BrutusWorld',
      World
    );

    // Create system realm.
    this.world.createSystemRealm();

    // Save all prototypes we have just created.
// DEBUG:
///    this.prototypeManager.save();
    console.log("Game.createDefaultWorld()");

    // Save the world we have just created.
    this.world.save();

    ////////////////-------------------------------------
    // TEST

    /*
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
    */
  }

  // Loads initial state of the game from disk.
  public async load()
  {
    // Load prototype data for all prototypes.
    await this.prototypeManager.load();

    // Create javascript classes from prototype data (all game entities will
    // be instantiated from these dynamically created prototype classes).
    this.prototypeManager.createClasses();

    // 'entityManager.get()' will return invalid entity reference,
    // because entity 'world' is not in entityManager yet. This invalid
    // entity reference can, however, be used to load an entity from disk,
    // which is exactly what we need to do.
    //   Second parameter is a prototype class
    // (class that will be instantiated).
    this.world = Server.entityManager.get(null, 'BrutusWorld');

    // Load current state of world from file.
    await this.world.load();
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

  // Dynamically creates classes from which game entities are inherited.
  protected prototypeManager = new PrototypeManager();

  // --- Direct references ---

  // There is only one world in the game (at the moment).
  protected world = null;

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}