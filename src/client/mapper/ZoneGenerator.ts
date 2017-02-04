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
    let r =
    {
      fromX: -3,
      toX: 3,
      fromY: -3,
      toY: 3,
      fromZ: 0,
      toZ: 1,
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

    for (let i = 0, x = r.fromX; x <= r.toX; i++, x++)
    {
      zoneGrid.push([]);
      for (let j = 0, y = r.fromY; y <= r.toY; j++, y++)
      {
        zoneGrid[i].push([]);
        for (let z = r.fromZ; z <= r.toZ; z++)
        {

          let id = this.generateId();

          let room =
          {
            id: id,
            name: 'Room #' + id,
            coords: [x, y, z],
            exits: {}
          };

          zone.push(room);
          zoneGrid[i][j].push(room);
        }
      }
    }

    this.generateExits(zone, zoneGrid, r);

    return zone;
  }

  private generateExits(zone, zoneGrid, r)
  {
    for (let room of zone)
    {
      let x = room.coords[0] - r.fromX;
      let y = room.coords[1] - r.fromY;
      let z = room.coords[2] - r.fromZ;

      ///console.log('x: ' + x + ' y: ' + y + ' z: ' + z);

      if (room.coords[0] > r.fromX)
      {
        let target = zoneGrid[x - 1][y][z];

        room.exits['west'] = target.id;
      }

      if (room.coords[0] < r.toX)
      {
        let target = zoneGrid[x + 1][y][z];

        room.exits['east'] = target.id;
      }

      if (room.coords[1] > r.fromY)
      {
        let target = zoneGrid[x][y - 1][z];

        room.exits['south'] = target.id;
      }

      if (room.coords[1] < r.toY)
      {
        let target = zoneGrid[x][y + 1][z];

        room.exits['north'] = target.id;
      }

      if (room.coords[2] > r.fromZ)
      {
        let target = zoneGrid[x][y][z - 1];

        room.exits['down'] = target.id;
      }

      if (room.coords[2] < r.toZ)
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