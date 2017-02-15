/*
  Part of BrutusNEXT

  Client side data describing a world map.
*/

'use strict';

///import {ERROR} from '../../../client/lib/error/ERROR';
import {Coords} from '../../../shared/type/Coords';
import {Array3d} from '../../../shared/type/Array3d';
import {RoomData} from '../../../client/gui/mapper/RoomData';
import {RoomRenderData} from '../../../client/gui/mapper/RoomRenderData';
import {ExitData} from '../../../client/gui/mapper/ExitData';
import {ExitRenderInfo} from '../../../client/gui/mapper/ExitRenderInfo';
import {ExitRenderData} from '../../../client/gui/mapper/ExitRenderData';

export class MapData
{
  constructor()
  {
    /// TEST:
    this.initWold();
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private roomGrid = new Array3d<RoomData>();

  private roomRenderData = new RoomRenderData();
  private exitRenderData = new ExitRenderData();

  /* TO BE DEPRECATED */
  private rooms = new Map<string, MapData.RoomData>();
  /* TO BE DEPRECATED */
  private exits = new Map<string, MapData.ExitData>();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public setRoom(room: RoomData)
  {
    // Create a unique room id based on it's coordinates
    // (something like '[5,12,37]').
    if (!room.initId())
      // Room is not set if id couldn't be created.
      return;

    // Make sure that added 'room' will be flagged as 'explored'.
    room.explored = true;

    // Set the room to the grid.
    this.roomGrid.set(room, room.coords);

    // Update it in render data.
    this.addToRenderData(room);
  }

  /* TO BE DEPRECATED */
  public addRoom(room: MapData.RoomData)
  {
    // Make sure that added 'room' will be flagged as 'explored'.
    room.explored = true;

    let existingRoom = this.rooms.get(room.id);
    let isUnexplored = existingRoom && existingRoom.explored === false;

    if (!existingRoom || isUnexplored)
      this.rooms.set(room.id, room);

    this.addConnectedRooms(room);

    // Add exits of this room to this.exits.
    this.addRoomExits(room);
  }

  // Creates exitId by concatenating ids of connected rooms in
  // alphabetical order (this deduplicates bidirectional exits).
  // -> Returns client-specific exit id.
  public composeExitId(fromId: string, toId: string)
  {
    // Note: Id must not begin with number because
    // it's also used as an element id. So we prefix
    // it with 'exit_' to make sure of it.
    if (fromId < toId)
      return 'exit_' + fromId + '_' + toId;
    else
      return 'exit_' + toId + '_' + fromId;
  }

  // -> Returns array of MapData.RoomData objects.
  public getRoomsData()
  {
    // This piece of black magic obtains array of hashmap values
    // (Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    ///return [...this.rooms.values()];

    return this.roomRenderData.getRenderArray();
  }

  // -> Returns array of MapData.ExitData objects.
  public getExitsData()
  {
    // This piece of black magic obtains array of hashmap values
    // (Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    return [...this.exits.values()];
  }

  // -> Returns 'undefined' if requested room isn't present in MapData.
  public getRoomDataById(id: string)
  {
    return this.rooms.get(id);
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  /// TODO: Hodit to do Coords nebo do Exit (spíš Coords).
  /// Možná nakonec RoomData
  /// - protože Exit neví nic o koordinátech
  /// - Coords vědí o svých koordinátech, ale nevědí, jestli exit
  ///   náhodou není teleport.
  /// - rooma se zas blbě dostane na exit, to už je lepší dát ho
  ///   jako parametr...
  /// Takže by to přece jen byla metoda Coords a dostávala by parametr 'exit',
  /// kterého by se zeptala jestli je teleport (pak by vrátila teleportační
  /// coords) a když ne, tak na jméno (a podle něj určila směr?)
  private getCoordsInExitDirection
  (
    room: RoomData,
    exitName: string,
    exit: ExitData
  )
  {
    switch (exitName)
    {
      case 'north':
      case 'northwest':
      case 'west':
      case 'southwest':
      case 'south':
      case 'southeast':
      case 'east':
      case 'northeast':
      case 'northup':
      case 'northwestup':
      case 'westup':
      case 'southwestup':
      case 'southup':
      case 'southeastup':
      case 'eastup':
      case 'northeastup':
      case 'northdown':
      case 'northwestdown':
      case 'westdown':
      case 'southwestdown':
      case 'southdown':
      case 'southeastdown':
      case 'eastdown':
      case 'northeastdown':
      case 'up':
      case 'down':
        /// TODO:
        break;
    }
  }

  private initExitRenderData(room: RoomData, exitName: string, exit: ExitData)
  {
    let exitRenderData = new ExitRenderInfo();

    exitRenderData.from = room.coords;
    exitRenderData.to = null; /// TODO
    exitRenderData.id = null; /// TODO
    exitRenderData.oneWay = false; /// TODO

    return exitRenderData;
  }

  private addToRenderData(room: RoomData)
  { 
    // Add the room to room render data.
    this.roomRenderData.add(room);

    /// Pozn. Není třeba přidávat okolní roomy jako unexplored,
    /// protože jsou teď v gridu, takže jejich souřadnice znám.

    // Add room exits to exit render data.
    for (var [exitName, exit] of room.exits)
    {
      let exitRenderData = this.initExitRenderData(room, exitName, exit);

      this.exitRenderData.add(exitRenderData);
    }
  }

  /* TO BE DEPRECATED */
  // Adds rooms reachable by exits from 'room' to 'this.rooms' hashmap.
  private addConnectedRooms(room: MapData.RoomData)
  {
    for (let exitName in room.exits)
    {
      let exit = room.exits[exitName];
      let targetRoomId = exit.targetRoomId;

      // If target room isn't in 'this.rooms' hashmap yet,
      // ad it as an unexplored room.
      if (!this.rooms.get(targetRoomId))
      {
        let targetRoom: MapData.RoomData =
        {
          id: targetRoomId,
          name: 'Unexplored Room',
          explored: false,
          coords: exit.destCoords,
          // Target room probably has some exits, but we
          // don't know them yet.
          exits: {}
        };

        this.rooms.set(targetRoomId, targetRoom);
      }
    }
  }

  // Adds exits of 'room' to 'this.exits' hashmap.
  private addRoomExits(room: MapData.RoomData)
  {
    let roomId = room.id;

    // Go through all properties of room.exits object.
    for (let exitName in room.exits)
    {
      /*
      if
      (
        exitName === 'northwest'
        || exitName === 'northeast'
        || exitName === 'southwest'
        || exitName === 'southeast'
      )
      continue;
      */

      let destRoomId = room.exits[exitName].targetRoomId;
      let exitId = this.composeExitId(roomId, destRoomId);
      let directionality = room.exits[exitName].directionality;

      // Check if exit already exists in 'this.exits' hashmap
      // (this prevents adding two-way exits more than once).
      if (!this.exits.get(exitId))
      {
        this.exits.set
        (
          exitId,
          {
            id: exitId,
            from: roomId,
            to: destRoomId,
            directionality: directionality
          }
        );
      }
    }
  }

  // ------- Test ------

  private initWold()
  {
    let roomRange =
    {
      fromX: -5,
      toX: 5,
      fromY: -5,
      toY: 5,
      fromZ: 0,
      toZ: 0,
    };

    for (let x = roomRange.fromX; x <= roomRange.toX; x++)
    {
      for (let y = roomRange.fromY; y <= roomRange.toY; y++)
      {
        for (let z = roomRange.fromZ; z <= roomRange.toZ; z++)
        {
          let roomData = new RoomData();

          roomData.coords = new Coords(x, y, z);

          this.setRoom(roomData);
        }
      }
    }
  }

  // ---------------- Event handlers --------------------

}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module MapData
{
  export enum ExitDirectionality
  {
    ONE_WAY,
    TWO_WAY,
  }

  // Variables of this type describe sever-side room exit
  // (which is always one-directional).
  export interface ExitDescription
  {
    // Id of target room.
    targetRoomId: string,
    // ONE_WAY or TWO_WAY.
    directionality: ExitDirectionality,
    // Mud coordinates of target room
    // (this is used to draw exit line to correct location
    //  when target room is not mapped yet).
    destCoords:
    {
      x: number,
      y: number,
      z: number
    }
  }

  export interface RoomData
  {
    id: string,
    name: string,
    // When a room is added to this.mapData, it is added
    // as 'explored = true' and all rooms reachable by it'says
    // exits are added as 'explored = false'.
    explored: boolean,
    coords:
    {
      x: number,
      y: number,
      z: number
    },
    exits:
    {
      // Any number of properties with type ExitDescription.
      [exitName: string]: ExitDescription
    }
  }

  // Variables of this type are used by client to set attributes
  // of svg elements bound to these variables.
  export interface ExitData
  {
    // 'id' of an exit - this is composed in the client from destination
    // and source room ids (see MapData.addRoomExits() for details).
    // (Exit is not an entity and so doesn't have an id on the server).
    id: string,
    // 'entity id' of source room.
    from: string,
    // 'entity id' of destination room.
    to: string,
    // ONE_WAY or TWO_WAY.
    directionality: ExitDirectionality
  }
}