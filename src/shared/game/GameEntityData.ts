/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room data.
*/

'use strict';

import {PropertyAttributes} from
  '../../shared/lib/class/PropertyAttributes';
import {Serializable} from '../../shared/lib/class/Serializable';

export class GameEntityData extends Serializable
{
  //------------------ Public data ----------------------

  /// Tohle asi fakt dává smysl v XxxData, chmura...
  /// - tak asi ne, to by tu muselo být i idčko a to už vůbec
  ///   nedává smysl. Nejspíš to bude tak, že properties zděděné
  ///   z Entity se posílat budou (což je ok, client-side entity
  ///   je má určitě taky).
  /*
  public name: string = null;
  */

  public description = "Unfinished entity.";
    /// 'true' nejspíš bude defaultní hodnota.
    /*
    private static description: PropertyAttributes =
    {
      saved: true,
      edited: true
    }
    */

  // ---------------- Public methods --------------------
}