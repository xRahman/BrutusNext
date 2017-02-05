/*
  Part of BrutusNEXT

  Generates flat zone.
*/

///  Nakonec to asi nepoužiju, data budou v generickém objektu.

'use strict';

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
    
    /*
    let r =
    {
      fromX: -5,
      toX: 5,
      fromY: -5,
      toY: 5,
      fromZ: 0,
      toZ: 3,
    }

    */

    let zone = [];
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
        let target = zoneGrid[x - 1][y][z];

        room.exits['west'] = target.id;

        if (room.coords.y > roomRange.fromY)
        {
          let target = zoneGrid[x - 1][y - 1][z];

          room.exits['southwest'] = target.id;
        }

        if (room.coords.y < roomRange.toY)
        {
          let target = zoneGrid[x - 1][y + 1][z];

          room.exits['northwest'] = target.id;
        }
      }

      if (room.coords.x < roomRange.toX)
      {
        let target = zoneGrid[x + 1][y][z];

        room.exits['east'] = target.id;

        if (room.coords.y > roomRange.fromY)
        {
          let target = zoneGrid[x + 1][y - 1][z];

          room.exits['southeast'] = target.id;
        }

        if (room.coords.y < roomRange.toY)
        {
          let target = zoneGrid[x + 1][y + 1][z];

          room.exits['northeast'] = target.id;
        }
      }

      if (room.coords.y > roomRange.fromY)
      {
        let target = zoneGrid[x][y - 1][z];

        room.exits['south'] = target.id;
      }

      if (room.coords.y < roomRange.toY)
      {
        let target = zoneGrid[x][y + 1][z];

        room.exits['north'] = target.id;
      }

      if (room.coords.z > roomRange.fromZ)
      {
        let target = zoneGrid[x][y][z - 1];

        room.exits['down'] = target.id;
      }

      if (room.coords.z < roomRange.toZ)
      {
        let target = zoneGrid[x][y][z + 1];

        room.exits['up'] = target.id;
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