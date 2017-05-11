/*
  Part of BrutusNEXT

  Implements runtime error reporting. Use it a lot!

       --------------------------------------------------------
               EVERY ERROR() NEEDS TO BE FIXED ASAP!
               (Even if MUD doesn't crash right away)
       --------------------------------------------------------
*/

/*
  ERROR() just prints error message, FATAL_ERROR() also terminates the program.

  Use FATAL_ERROR() either if there is no realistic way to recover from the
  error or if recovery could lead to corruption of persistant game data
  (player file etc.).

  ERROR() usage example:

    import {ERROR} from '../shared/lib/error/ERROR';

    if (character === null)
    {
      ERROR("Invalid character");
    }

  FATAL_ERROR() usage example:

    import {FATAL_ERROR} from '../shared/lib/error/FATAL_ERROR';

    FATAL_ERROR("Corrupted player data");

  Try to write error messages that explain what are the possible causes
  and available solutions.
  (At the time of writing of ERROR(), you know quite well what could go
   wrong. 5 years later, you will pay gold for any such hint, trust me.)

  Don't include name of the function where error occured. It will be added
  automatically to the stack trace.
*/

/*
  Implementation notes:
    Functions ERROR() and FATAL_ERROR() are exported directly (without
  encapsulating class) so they can be imported and called directly without
  the need to type something like ERROR.ERROR().

  They are named with CAPS to diferentiate them from javascript Error object.
*/

'use strict';

import {App} from '../../../shared/lib/app/App';

export function ERROR(message: string)
{
  App.reportError(message);
}
