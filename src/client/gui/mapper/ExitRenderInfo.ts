/*
  Part of BrutusNEXT

  Data from which exit is rendered.
*/

'use strict';

import {Coords} from '../../../shared/type/Coords';

export class ExitRenderInfo
{
  // Client-side id created by concatenating of id's
  // of connected rooms in alphabetical order.
  // (It also serves as respective svg element id).
  public id: string = null;

  // Coords of connected rooms. Order only matters if
  // this is a one-way exit.
  public from = new Coords();
  public to = new Coords();

  // If the exit leads to unexplored room, it is considered
  // to be two-way untill the room is explored (player does't
  // know if she will be able to return back until then).
  public oneWay = false;
}