/*
  Part of BrutusNEXT

  Implements assertions. Use them a lot!

       --------------------------------------------------------
             EVERY ASSERTION FAIL NEEDS TO BE FIXED ASAP!
               (Even if MUD doesn't crash right away)
       --------------------------------------------------------
*/

/*
  ASSERT() just prints errors, ASSERT_FATAL() also terminates the program.

  Use ASSERT_FATAL() either if there is no realistic way to recover from the
  error or if "recovery" could lead to corruption of persistant game data
  (player file etc.).

  Usage examples:

    import {ASSERT} from '../shared/ASSERT';
    if (!ASSERT(character !== null, "Invalid character"))
      return;

    import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
    ASSERT_FATAL(false, "Corrupted player data");

  Try to write messages that explain what the condition was (because it won't
  show in error output) and also what are the possible causes of this error
  (at the time of writing of an ASSERT, you know quite well what could go
   wrong. 5 years later, you will pay gold for any such hint, trust me).

  Do not, however, include name of the function where error occured. That will
  be added automatically.
*/

/*
  Implementation notes:
    Functions ASSERT() and ASSERT_FATAL() are exported directly (without
  encapsulating class) so they can be imported and called directly without
  the need to type something like Assert.ASSERT().

  They are named with CAPS to diferentiate them from assert() function that
  might be some day introduced to JavaScript.
*/

'use strict';

// Import required classes.
import {getTrimmedStackTrace} from '../shared/UTILS';
import {Mudlog} from '../server/Mudlog';
import {AdminLevels} from '../server/AdminLevels';

// Use ASSERT_FATAL to check for nonrecoverable errors.
// If condition is false, logs error messages and exits the program.
export function ASSERT_FATAL(condition: boolean, message: string)
{
  if (condition === false)
  {
    let errorMsg = "Fatal assertion failed: '" + message + "'" + "\n"
      + getTrimmedStackTrace();

    ///Mudlog.log(errorMsg, Mudlog.msgType.ASSERT_FATAL, AdminLevels.IMMORTAL);

    // Since promises are eating exceptions, throwing an error won't stop
    // the program if ASSERT_FATAL is triggered within asynchronous method.
    // So we rather print stack trace ourselves (using Mudlog.log() above)
    // and exit the program manualy.
    process.exit(1);
  }

  // This is basically a nonsense, ASSERT_FATAL is not supposed to be checked
  // against - if it fails, game will crash so no other code is necessary.
  // However, I have already written 'if (!ASSERT_FATAL(...))' by mistake and
  // without this return value, condition  would fail even if it was true,
  // which would lead to queer, unexpected behaviour.
  return true;
}
