/*
  Part of BrutusNEXT

  Room (a graph node that game world consists of).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Id} from '../../shared/Id';
import {GameEntity} from '../../game/GameEntity';
import {Game} from '../../game/Game';
import {RoomInfo} from '../../game/world/RoomInfo';
import {Exits} from '../../game/world/Exits';

export class Room extends GameEntity
{
  /*
  /// TEST
  protected static testStaticVariable = "RoomEntityStaticVariable";

  //public test() { console.log("Room::" + this.className + ", super: "); super.test(); }
  public test()
  {
    console.log(this.getPropertyAttributes(this, 'testStaticVariable'));
    
    //console.log(super.constructor['testStaticVariable']);
    //console.log("Room::" + this.constructor['testStaticVariable'] + ", super: ");
    //super.test();

    console.log(this.getPropertyAttributes(this, 'gameEntityTestStaticVariable'));
  }
  */

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // --------------- Public accessors -------------------

  public getRoomInfo()
  {
    if (this.roomInfo === null)
    {
      if (!ASSERT(this.prototypeId !== null,
        "Attempt to access roomInfo of " + this.getErrorIdString()
        + "which has neither roomInfo, nor a prototype."
        + " Creating default roomInfo"))
      {
        // Create roomInfo with default values.
        this.roomInfo = new RoomInfo();

        return this.roomInfo;
      }

      let prototypeRoom = <Room>this.prototypeId.getEntity();

      return prototypeRoom.getRoomInfo();
    }

    return this.roomInfo;
  }

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY() { return "./data/rooms/"; }

  // ---------------- Public methods --------------------

  // Entity adds itself to approptiate manager
  // (so it can be searched by name, etc.)
  public addToManager()
  {
    Game.roomList.addEntityUnderExistingId(this);
  }

  // Creates a formatted string describing room contents.
  protected printContents(): string
  {
    let contents = "&R" + this.name;
    contents += "\n";
    /*
    contents += "&w" + this.getRoomInfo().description;
    */

    /* --- TEST --- */
    let roomPrototype = Room.prototype; // tohle znamena, ze si muzu prototyp
                                        // ulozit do promenne.

    roomPrototype.description = "Description set to prototype";
    contents += "&w" + this.description;
    /* --- TEST --- */
    


    // TODO: Exity, mobove, objekty...
    
    return contents;
  }

  // -------------- Protected class data ----------------

  // Description, extra descriptions, room flags, terrain type, etc.
  // If this is null, values from prototype are used.
  protected roomInfo: RoomInfo = null;

  /* --- TEST --- */
  public description: string;
  /* --- TEST --- */

  // List of exits to other entities (usually rooms).
  protected exits = new Exits();

  // --------------- Protected methods ------------------

  // This is called when a new prototype is created.
  protected initializePrototypeData()
  {
    // Create roomInfo with default values.
    this.roomInfo = new RoomInfo();
  }

  // ---------------- Private methods -------------------
}