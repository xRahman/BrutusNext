/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room data.
*/

'use strict';

import {Coords} from '../../../shared/type/Coords';
import {ExitInterface} from '../../../shared/game/world/ExitData';

// Maps exit names to respective offsets in grid.
const EXITS =
{
  'n':   { s: -1, e:  0, u:  0 },
  'nw':  { s: -1, e: -1, u:  0 },
  'w':   { s:  0, e: -1, u:  0 },
  'sw':  { s:  1, e: -1, u:  0 },
  's':   { s:  1, e:  0, u:  0 },
  'se':  { s:  1, e:  1, u:  0 },
  'e':   { s:  0, e:  1, u:  0 },
  'ne':  { s: -1, e:  1, u:  0 },
  'nu':  { s: -1, e:  0, u:  1 },
  'nwu': { s: -1, e: -1, u:  1 },
  'wu':  { s:  0, e: -1, u:  1 },
  'swu': { s:  1, e: -1, u:  1 },
  'su':  { s:  1, e:  0, u:  1 },
  'seu': { s:  1, e:  1, u:  1 },
  'eu':  { s:  0, e:  1, u:  1 },
  'neu': { s: -1, e:  1, u:  1 },
  'u':   { s:  0, e:  0, u:  1 },
  'nd':  { s: -1, e:  0, u: -1 },
  'nwd': { s: -1, e: -1, u: -1 },
  'wd':  { s:  0, e: -1, u: -1 },
  'swd': { s:  1, e: -1, u: -1 },
  'sd':  { s:  1, e:  0, u: -1 },
  'sed': { s:  1, e:  1, u: -1 },
  'ed':  { s:  0, e:  1, u: -1 },
  'ned': { s: -1, e:  1, u: -1 },
  'd':   { s:  0, e:  0, u: -1 }
}

// Maps exit names to opposite directions.
const REVERSE_EXITS =
{
  'n'  : 's',
  'nw' : 'se',
  'w'  : 'e',
  'sw' : 'ne',
  's'  : 'n',
  'se' : 'nw',
  'e'  : 'w',
  'ne' : 'sw',
  'nu' : 'sd',
  'nwu': 'sed',
  'wu' : 'ed',
  'swu': 'ned',
  'su' : 'nd',
  'seu': 'nwd',
  'eu' : 'wd',
  'neu': 'swd',
  'u'  : 'd',
  'nd' : 'su',
  'nwd': 'seu',
  'wd' : 'eu',
  'swd': 'neu',
  'sd' : 'nu',
  'sed': 'nwu',
  'ed' : 'wu',
  'ned': 'swu',
  'd'  : 'u'
}

export class RoomData
{
  //------------------ Public data ----------------------

  // 'true' if the room exists on the server
  // (nonexisting room placeholders are displayed in edit mode).
  public exists = false;

  // Room name.
  public name: string = null;

  // Absolute coordinates (in the world).
  public coords: Coords = null;
  
  // Hasmap indexed by shortened exit names ('n', 'sw', 'nwu', etc.).
  public exits = new Map<string, ExitInterface>();

  // ---------------- Public methods --------------------

  // -> Returns 'undefined' if 'direction' isn't a name of an exit
  //    to and adjacent room.
  public static getReverseDirection(direction: string)
  {
    return REVERSE_EXITS[direction];
  }

  public hasExit(exitName: string)
  {
    return this.exits.has(exitName);
  }

  // -> Returns coordinates in specified 'direction'.
  //    Returns 'null' if 'direction' isn't a name of
  //      an exit leading to an adjacent room.
  public getCoordsInDirection(direction: string)
  {
    let shift = EXITS[direction];

    // 'direction' isn't any of the exit names leading to adjacent rooms.
    if (!shift)
      return null;

    let target = new Coords();
    
    target.e = this.coords.e + shift.e;
    target.s = this.coords.s + shift.s;
    target.u = this.coords.u + shift.u;

    return target;
  }

  // -> Returns exit name leading to 'to' coordinates.
  //    Returns 'null' if 'to' aren't coordinates of an adjacent room.
  public getDirection(to: Coords)
  {
    for (let direction in EXITS)
    {
      if
      (
        this.coords.e + EXITS[direction].e === to.e
        && this.coords.s + EXITS[direction].s === to.s
        && this.coords.u + EXITS[direction].u === to.u
      )
        return direction;
    }

    return null;
  }
}