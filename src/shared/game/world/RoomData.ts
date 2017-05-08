/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room data.
*/

'use strict';

import {Flags} from '../../../shared/lib/utils/Flags';
import {Coords} from '../../../shared/type/Coords';
import {ExitData} from '../../../shared/game/world/ExitData';

// Maps exit names to respective offsets in grid.
const EXIT_SHIFTS =
{
  'n':   new Coords(-1,  0,  0),
  'nw':  new Coords(-1, -1,  0),
  'w':   new Coords( 0, -1,  0),
  'sw':  new Coords( 1, -1,  0),
  's':   new Coords( 1,  0,  0),
  'se':  new Coords( 1,  1,  0),
  'e':   new Coords( 0,  1,  0),
  'ne':  new Coords(-1,  1,  0),
  'nu':  new Coords(-1,  0,  1),
  'nwu': new Coords(-1, -1,  1),
  'wu':  new Coords( 0, -1,  1),
  'swu': new Coords( 1, -1,  1),
  'su':  new Coords( 1,  0,  1),
  'seu': new Coords( 1,  1,  1),
  'eu':  new Coords( 0,  1,  1),
  'neu': new Coords(-1,  1,  1),
  'u':   new Coords( 0,  0,  1),
  'nd':  new Coords(-1,  0, -1),
  'nwd': new Coords(-1, -1, -1),
  'wd':  new Coords( 0, -1, -1),
  'swd': new Coords( 1, -1, -1),
  'sd':  new Coords( 1,  0, -1),
  'sed': new Coords( 1,  1, -1),
  'ed':  new Coords( 0,  1, -1),
  'ned': new Coords(-1,  1, -1),
  'd':   new Coords( 0,  0, -1)
}

// // Maps exit names to respective offsets in grid.
// const EXITS =
// {
//   'n':   { s: -1, e:  0, u:  0 },
//   'nw':  { s: -1, e: -1, u:  0 },
//   'w':   { s:  0, e: -1, u:  0 },
//   'sw':  { s:  1, e: -1, u:  0 },
//   's':   { s:  1, e:  0, u:  0 },
//   'se':  { s:  1, e:  1, u:  0 },
//   'e':   { s:  0, e:  1, u:  0 },
//   'ne':  { s: -1, e:  1, u:  0 },
//   'nu':  { s: -1, e:  0, u:  1 },
//   'nwu': { s: -1, e: -1, u:  1 },
//   'wu':  { s:  0, e: -1, u:  1 },
//   'swu': { s:  1, e: -1, u:  1 },
//   'su':  { s:  1, e:  0, u:  1 },
//   'seu': { s:  1, e:  1, u:  1 },
//   'eu':  { s:  0, e:  1, u:  1 },
//   'neu': { s: -1, e:  1, u:  1 },
//   'u':   { s:  0, e:  0, u:  1 },
//   'nd':  { s: -1, e:  0, u: -1 },
//   'nwd': { s: -1, e: -1, u: -1 },
//   'wd':  { s:  0, e: -1, u: -1 },
//   'swd': { s:  1, e: -1, u: -1 },
//   'sd':  { s:  1, e:  0, u: -1 },
//   'sed': { s:  1, e:  1, u: -1 },
//   'ed':  { s:  0, e:  1, u: -1 },
//   'ned': { s: -1, e:  1, u: -1 },
//   'd':   { s:  0, e:  0, u: -1 }
// }

// Maps exit names to opposite directions.
const REVERSE_DIRS =
{
  'n':   's',
  'nw':  'se',
  'w':   'e',
  'sw':  'ne',
  's':   'n',
  'se':  'nw',
  'e':   'w',
  'ne':  'sw',
  'nu':  'sd',
  'nwu': 'sed',
  'wu':  'ed',
  'swu': 'ned',
  'su':  'nd',
  'seu': 'nwd',
  'eu':  'wd',
  'neu': 'swd',
  'u':   'd',
  'nd':  'su',
  'nwd': 'seu',
  'wd':  'eu',
  'swd': 'neu',
  'sd':  'nu',
  'sed': 'nwu',
  'ed':  'wu',
  'ned': 'swu',
  'd':   'u'
}

export class RoomData
{
  //------------------ Public data ----------------------

  /// ----------------- Test flagu. -----------------------
  public flags = new Flags<RoomData.Flags>();
  // private testFlagu()
  // {
  //   this.flags.set(RoomData.Flags.ROOM_PEACEFUL);
  //   /// Neprojde, hura! :\
  //   this.flags.isSet(this.flags);
  // }
  ///------------------------------------------------------

  // 'true' if the room exists on the server
  // (nonexisting room placeholders are displayed in edit mode).
  public exists = false;

  // Room name.
  public name: string = null;

  // Absolute coordinates (in the world).
  public coords: Coords = null;
  
  // Hasmap indexed by shortened exit names ('n', 'sw', 'nwu', etc.).
  public exits = new Map<string, ExitData>();

  // ---------------- Public methods --------------------

  // -> Returns 'undefined' if 'direction' isn't a name of an exit
  //    to and adjacent room.
  public static getReverseDirection(direction: string)
  {
    return REVERSE_DIRS[direction];
  }

  public hasExit(exitName: string)
  {
    return this.exits.has(exitName);
  }

/// Tohle by mohla umět class Coords.
  // -> Returns coordinates in specified 'direction'.
  //    Returns 'null' if 'direction' isn't a name of
  //      an exit leading to an adjacent room.
  public getCoordsInDirection(direction: string)
  {
    let shift = EXIT_SHIFTS[direction];

    // 'direction' isn't any of the exit names leading to adjacent rooms.
    if (!shift)
      return null;

    return Coords.sum(this.coords, shift);

  }

  // -> Returns exit name leading to 'to' coordinates.
  //    Returns 'null' if 'to' aren't coordinates of an adjacent room.
  public getDirection(to: Coords)
  {
    for (let direction in EXIT_SHIFTS)
    {
      let coordsInDirection = Coords.sum(this.coords, EXIT_SHIFTS[direction]);

      if (Coords.equals(coordsInDirection, to))
        return direction;
    }

    return null;
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module RoomData
{
  export enum Flags
  {
    ROOM_PEACEFUL
  }
}