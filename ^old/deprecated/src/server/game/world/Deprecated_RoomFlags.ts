/*
  Part of BrutusNEXT

  Symbolic names for room flags.
*/

/*
    Not all existing room flags are necessarily defined here.
    Some of them may be declared dynamically - in that case the flag
    exists in files but doesn't have symbolic name here.
      Feel free to add symbolic names for such flags here if you want
    to use them from the code.
     
    Note also that only the name of the flag is declared here, not its
    integer value. The value is still saved to file.

    You can also add a new flag here that doesn't yet exist in the file.
    It will be added there automatically on the next reboot (when the
    game loads itself from file) and an unused numeric value will
    automatically be assigned to it.

    If you really want to delete a flag (maybe because you added it by
    mistake or it becomes obsolete), the only way to do it is to edit
    the file with respective FlagData (///TODO: cesta k souboru).
  */

'use strict';

import {Flags} from '../../../server/lib/flags/Flags';

export class RoomFlags extends Flags
{
  // System room not accessible to players.
  public static get SYSTEM() { return 'SYSTEM'; }
}