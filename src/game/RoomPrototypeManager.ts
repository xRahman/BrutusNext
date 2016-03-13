
/*
  Part of BrutusNEXT

  Container storing ids of prototype rooms which are not
  directly accessible in game (they are only available for
  editing).
*/

'use strict';

import {EntityManager} from '../game/EntityManager';
import {Room} from '../game/world/Room';

export class RoomPrototypeManager extends EntityManager<Room>
{
  // ---------------- Public methods --------------------

  /*
  /// Nakonec asi nebude potřeba. Prototypy budou prostě v prototypové
  /// zóně a loadnou se standardně jako jakákoliv jiná zóna.
  // Loads initial state from disk.
  public load()
  {
  }
  */

  // -------------- Protected class data ----------------
 
  // -------------- Protected methods -------------------

}