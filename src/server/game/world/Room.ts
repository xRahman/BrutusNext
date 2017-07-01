/*
  Part of BrutusNEXT

  Server-side room (a graph node that game world consists of).
*/

/*
  Pozn: Look description není na exitu, ale v roomě, do které se kouká.
    Tj. je to "incomming" look description.
  - Může být na jednotlivých směrech (třeba když koukám na místnost
    ze severu (tj. z jiné roomy jižním exitem) a může být i na roomě jako
    takové. Description na roomě je default, takže když daný směr nemá
    specifický look desc, použije se look desc roomy.
  
  Pozn: Dveře budou fungovat obdobně - budou mít vlastní
    jméno a description, ale obojí půjde to přetížit
    z roomu.
  - Důvod je, že se může stát, že z jedné strany budou dveře vypadat
    jinak než z druhé (z jedné strany 'bookshelf', ze druhé 'secret door').
  - Další důvod je napojování tilesů: Nebylo by jasné, komu exit "patří",
    takže na rozhraní dvou tilesů nutně musí mít obě strany popisek
    dveří. (A když dveře má jen jedna strana, tak to pořád půjde napojit,
    prostě se z obou stran použije "defaultní" popisek a jméno).
*/

'use strict';

import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {GameEntity} from '../../../server/game/GameEntity';
import {Game} from '../../game/Game';
///import {RoomFlags} from '../../game/world/RoomFlags';
///import {Exits} from '../../game/world/Exits';
import {Classes} from '../../../shared/lib/class/Classes';
import {RoomData} from '../../../shared/game/world/RoomData';

export class Room extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  public data = new RoomData();

  // --------------- Public accessors -------------------

  /*
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

      let prototypeRoom = this.prototypeId.getEntity({ typeCast: Room });

      return prototypeRoom.getRoomInfo();
    }

    return this.roomInfo;
  }
  */

  // -------------- Protected accessors -----------------

  ///protected static get SAVE_DIRECTORY() { return "./data/rooms/"; }

  // ---------------- Public methods --------------------

  public hasExit(exitName: string)
  {
    return this.data.exits.has(exitName);
  }

  // Creates a formatted string describing room contents.
  protected printContents(): string
  {
    let contents = "&R" + this.getName();
    contents += "\n";
    /*
    contents += "&w" + this.getRoomInfo().description;
    */

    /* --- TEST --- */
    /*
    let roomPrototype = Room.prototype; // tohle znamena, ze si muzu prototyp
                                        // ulozit do promenne.

    roomPrototype.description = "Description set to prototype";
    contents += "&w" + this.description;
    */
    /* --- TEST --- */
    


    // TODO: Exity, mobove, objekty...
    
    return contents;
  }

  //----------------- Protected data --------------------

  /// TODO: Tohle asi bude moct bejt rovnou tady, prototypy funguji
  /// jinak (lepe)
  /*
  // Description, extra descriptions, room flags, terrain type, etc.
  // If this is null, values from prototype are used.
  protected roomInfo: RoomInfo = null;
  */

/// Probably to be deprecated or moved to /shared.
  // List of exits to other entities (usually rooms).
  ///protected exits = new Exits();

  // --------------- Protected methods ------------------

  // ~ Overrides Entity.addToNameLists().
  protected addToNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.addToAbbrevLists().
  protected addToAbbrevLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromNameLists().
  protected removeFromNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromAbbrevLists().
  protected removeFromAbbrevLists()
  {
    /// TODO
  }

  /*
  // This is called when a new prototype is created.
  protected initializePrototypeData()
  {
    // Create roomInfo with default values.
    this.roomInfo = new RoomInfo();
  }
  */

  // ---------------- Private methods -------------------

  // ---------------- Event Handlers -------------------

  /// TEST
  // protected onLoad() { console.log('Room.onLoad() ' + this.getId()); }
}

Classes.registerEntityClass(Room);