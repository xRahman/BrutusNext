/*
  Part of BrutusNEXT

  Client side data describing a world map.
*/

'use strict';

export class MapData
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private rooms = new Map<string, MapData.RoomData>();
  private exits = new Map<string, MapData.ExitData>();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public addRoom(room: MapData.RoomData)
  {
    // Make sure that added 'room' will be flagged as 'explored'.
    room.explored = true;

    let existingRoom = this.rooms.get(room.id);
    let isUnexplored = existingRoom && existingRoom.explored === false;

    if (!existingRoom || isUnexplored)
      this.rooms.set(room.id, room);

    this.AddDestRooms(room);

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
    // (This piece of black magic obtains array of hashmap values.
    //  Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    return [...this.rooms.values()];
  }

  // -> Returns array of MapData.ExitData objects.
  public getExitsData()
  {
    // (This piece of black magic obtains array of hashmap values.
    //  Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    return [...this.exits.values()];
  }

  public getRoomById(id: string)
  {
    return this.rooms.get(id);
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // Adds rooms reachable by exits from 'room' to 'this.rooms' hashmap.
  private AddDestRooms(room: MapData.RoomData)
  {
    for (let exitName in room.exits)
    {
      let exit = room.exits[exitName];

      /// TODO

      /*
      if (!this.rooms.get(targetRoomId))
      {
        /// Hmm, tohle asi nepůjde...
        let unexploredRoom = new MapData.RoomData();

        unexploredRoom.id = targetRoomId;
        unexploredRoom.explored = false;
        unexploredRoom.coords exit.destCoords;
      
        this.rooms.set(targetRoomId, unexploredRoom);
      }
      */

    }
  }

  // Adds exits of 'room' to 'this.exits' hashmap.
  private addRoomExits(room: MapData.RoomData)
  {
    let roomId = room.id;

    // Go through all properties of roome.exits object.
    for (let exitName in room.exits)
    {
      let destRoomId = room.exits[exitName].target;
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

    /*
    let exits = [];

    if (room.exits['north'])
      exits.push({ id: room.exits['north'], opacity: 0.3 });
    if (room.exits['east'])
      exits.push({ id: room.exits['east'], opacity: 0.3 });
    if (room.exits['south'])
      exits.push({ id: room.exits['south'], opacity: 0.3 });
    if (room.exits['west'])
      exits.push({ id: room.exits['west'], opacity: 0.3 });
    if (room.exits['up'])
      exits.push({ id: room.exits['up'], opacity: 0.3 });
    if (room.exits['down'])
      exits.push({ id: room.exits['down'], opacity: 0.3 });
    */

    /*
    if (room.exits['northeast'])
      exits.push({ id: room.exits['northeast'], opacity: 0.1 });
    if (room.exits['northwest'])
      exits.push({ id: room.exits['northwest'], opacity: 0.1 });
    if (room.exits['southeast'])
      exits.push({ id: room.exits['southeast'], opacity: 0.1 });
    if (room.exits['southwest'])
      exits.push({ id: room.exits['southwest'], opacity: 0.1 });
    */

    /*
    for (let exit of exits)
    {
      if (exit)
      {
        let exitId = this.composeExitId(roomId, exit.id);

        if (this.exits.get(exitId) === undefined)
        {
          this.exits.set
          (
            exitId,
            /// TODO: Casem sem pridat info o tom, co je to za exit
            /// (jednosmerny, obousmerny, atd.).
            /// TODO: opacita by se primo predavat nemela, ta by se mela
            /// priradit az pri vykreslovani podle prislusne vlastnosti.
            {
              id: exitId,
              from: roomId,
              to: exit.id,
              opacity: exit.opacity
            }
          );
        }
      }
    }
    */
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
  interface ExitDescription
  {
    // Id of target room.
    target: string,
    // Mud coordinates of target room
    // (this is used to draw exit line to correct location
    //  when target room is not mapped yet).
    destCoords:
    {
      x: number,
      y: number,
      z: number
    },
    directionality: ExitDirectionality
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
    // (Rxit is not an entity and so doesn't have an id on the server).
    id: string,
    // 'entity id' of source room.
    from: string,
    // 'entity id' of destination room.
    to: string,
    // ONE_WAY or TWO_WAY.
    directionality: ExitDirectionality
  }
}