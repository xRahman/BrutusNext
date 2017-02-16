/*
  Part of BrutusNEXT

  Data from which exits are rendered.
*/

'use strict';


import {Coords} from '../../../shared/type/Coords';
import {ExitRenderInfo} from '../../../client/gui/mapper/ExitRenderInfo';
import {ExitData} from '../../../client/gui/mapper/ExitData';
import {RoomData} from '../../../client/gui/mapper/RoomData';

export class ExitRenderData
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  public data = new Map<string, ExitRenderInfo>();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public add(exit: ExitRenderInfo)
  {
    if (!exit.id)
      return;

    // Set exit data to this.exit hashmap under it's id.
    this.data.set(exit.id, exit);
  }

  public getRenderArray()
  {
    // This piece of black magic obtains array of hashmap values
    // (Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    return [...this.data.values()];
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}