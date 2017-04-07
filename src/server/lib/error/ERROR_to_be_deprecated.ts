/*
  Part of BrutusNEXT

  Implements server error logging. Use it a lot!

       --------------------------------------------------------
               EVERY ERROR() NEEDS TO BE FIXED ASAP!
               (Even if MUD doesn't crash right away)
       --------------------------------------------------------
*/

/*
  ERROR() just prints error message, FATAL_ERROR() also terminates the program.

  Use FATAL_ERROR() either if there is no realistic way to recover from the
  error or if "recovery" could lead to corruption of persistant game data
  (player file etc.).

  Usage examples:

    import {ERROR} from '../shared/ERROR';

    if (character === null)
    {
      ERROR("Invalid character");
    }

    import {FATAL_ERROR} from '../shared/FATAL_ERROR';

    FATAL_ERROR("Corrupted player data");

  Try to write messages that explain what the condition was (because it won't
  show in error output) and also what are the possible causes of this error
  (at the time of writing of ERROR(), you know quite well what could go
   wrong. 5 years later, you will pay gold for any such hint, trust me).

  Don't include name of the function where error occured. That will be added
  automatically.
*/

/*
  Implementation notes:
    Functions ERROR() and FATAL_ERROR() are exported directly (without
  encapsulating class) so they can be imported and called directly without
  the need to type something like ERROR.ERROR().

  They are named with CAPS to diferentiate them from javascript Error object.
*/

'use strict';

// Import required classes.
import {Syslog} from '../../../server/lib/log/Syslog';
import {AdminLevel} from '../../../server/lib/admin/AdminLevel';
import {Message} from '../../../server/lib/message/Message';

// Sends error message and a stack trace to syslog.
export function ERROR(message: string)
{
  let errorMsg = message + "\n"
    + Syslog.getTrimmedStackTrace(Syslog.TrimType.ERROR);

  Syslog.log(errorMsg, Message.Type.RUNTIME_ERROR, AdminLevel.ELDER_GOD);
}