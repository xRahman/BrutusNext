/*
  Part of BrutusNEXT

  Generates flat zone.
*/

///  Nakonec to asi nepoužiju, data budou v generickém objektu.

'use strict';

import {MapData} from '../../../client/gui/mapper/MapData';

export class ZoneGenerator
{
  // -------------- Static class data -------------------

  public static lastId = 0;

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  name: string;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public generateZone(/*width: number, length: number, height: number*/)
  {
    let roomRange =
    {
      fromX: -5,
      toX: 5,
      fromY: -5,
      toY: 5,
      fromZ: 0,
      toZ: 0,
    }

    //let zone = [];
    let zone = new Array<MapData.RoomData>();
    let zoneGrid = [];

    for (let i = 0, x = roomRange.fromX; x <= roomRange.toX; i++, x++)
    {
      zoneGrid.push([]);
      for (let j = 0, y = roomRange.fromY; y <= roomRange.toY; j++, y++)
      {
        zoneGrid[i].push([]);
        for (let z = roomRange.fromZ; z <= roomRange.toZ; z++)
        {

          let id = this.generateId();

          let room =
          {
            id: id,
            name: 'Room #' + id,
            explored: true,
            coords:
            {
              x: x,
              y: y,
              z: z
            },
            exits: {}
          };

          zone.push(room);
          zoneGrid[i][j].push(room);
        }
      }
    }

    this.generateExits(zone, zoneGrid, roomRange);

    return zone;
  }

  private createExitDesc(targetRoom)
  {
    let exitDescription: MapData.ExitDescription =
    {
      targetRoomId: targetRoom.id,
      // All generated exits are two-way.
      directionality: MapData.ExitDirectionality.TWO_WAY,
      destCoords: targetRoom.coords
    };

    return exitDescription;
  }

  private generateExits(zone, zoneGrid, roomRange)
  {
    for (let room of zone)
    {
      let x = room.coords.x - roomRange.fromX;
      let y = room.coords.y - roomRange.fromY;
      let z = room.coords.z - roomRange.fromZ;

      ///console.log('x: ' + x + ' y: ' + y + ' z: ' + z);

      if (room.coords.x > roomRange.fromX)
      {
        let targetRoom = zoneGrid[x - 1][y][z];

        room.exits['west'] = this.createExitDesc(targetRoom);

        if (room.coords.y > roomRange.fromY)
        {
          let target = zoneGrid[x - 1][y - 1][z];

          room.exits['southwest'] = this.createExitDesc(targetRoom);
        }

        if (room.coords.y < roomRange.toY)
        {
          let target = zoneGrid[x - 1][y + 1][z];

          room.exits['northwest'] = this.createExitDesc(targetRoom);
        }
      }

      if (room.coords.x < roomRange.toX)
      {
        let targetRoom = zoneGrid[x + 1][y][z];

        room.exits['east'] = this.createExitDesc(targetRoom);

        if (room.coords.y > roomRange.fromY)
        {
          let target = zoneGrid[x + 1][y - 1][z];

          room.exits['southeast'] = this.createExitDesc(targetRoom);
        }

        if (room.coords.y < roomRange.toY)
        {
          let target = zoneGrid[x + 1][y + 1][z];

          room.exits['northeast'] = this.createExitDesc(targetRoom);
        }
      }

      if (room.coords.y > roomRange.fromY)
      {
        let targetRoom = zoneGrid[x][y - 1][z];

        room.exits['south'] = this.createExitDesc(targetRoom);
      }

      if (room.coords.y < roomRange.toY)
      {
        let targetRoom = zoneGrid[x][y + 1][z];

        room.exits['north'] = this.createExitDesc(targetRoom);
      }

      if (room.coords.z > roomRange.fromZ)
      {
        let targetRoom = zoneGrid[x][y][z - 1];

        room.exits['down'] = this.createExitDesc(targetRoom);
      }

      if (room.coords.z < roomRange.toZ)
      {
        let targetRoom = zoneGrid[x][y][z + 1];

        room.exits['up'] = this.createExitDesc(targetRoom);
      }
    }
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private generateId()
  {
    let id = "" + ZoneGenerator.lastId;

    ZoneGenerator.lastId++;

    return id;
  }

  // ---------------- Event handlers --------------------

}