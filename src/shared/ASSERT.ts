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

    import {ASSERT_FATAL} from '../shared/ASSERT';
    ASSERT_FATAL(false, "Corrupted player data");

  Try to write messages that explain what the condition was (because it won't
  show in error output).

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
import {Mudlog} from '../server/Mudlog';
import {AdminLevels} from '../server/AdminLevels';

// Sends error message to syslog along with a stack trace if condition is
// false. Returns unmodified value of the condition.
export function ASSERT(condition: boolean, message: string)
{
  if (condition === false)
  {
    let stackTrace = getTrimmedStackTrace();

    let errorMsg = "Assertion failed: '" + message + "'" + "\n"
      + stackTrace;

    Mudlog.log(errorMsg, Mudlog.msgType.ASSERT, AdminLevels.CREATOR);
  }

  return condition;
}

// Use ASSERT_FATAL to check for nonrecoverable errors.
// If condition is false, logs error messages and throws Error() to end
// the program.
export function ASSERT_FATAL(condition: boolean, message: string)
{
  if (condition === false)
  {
    let stackTrace = getTrimmedStackTrace();

    let errorMsg = "Fatal assertion failed: '" + message + "'" + "\n"
      + stackTrace;

    Mudlog.log(errorMsg, Mudlog.msgType.ASSERT_FATAL, AdminLevels.IMMORTAL);

    // Since promises are eating exceptions, throwing an error won't stop
    // the program if ASSERT_FATAL is triggered within asynchronous method.
    // So we rather print stack trace ourselves (using Mudlog.log() above)
    // and exit the program manualy.
    process.exit(1);

    /*
    let error = new Error("Fatal assertion failed");
    // Modify error object's stack trace to reflect that it was caused by
    // ASSERT_FATAL.
    error.stack = errorMsg;
    
    // Throw an exception that will cause the program to end and print stack
    // trace to the console.
    throw error;
    */
  }

  // This is basically a nonsense, ASSERT_FATAL is not supposed to be checked
  // against - if it fails, game will crash so no other code is necessary.
  // However, I have already done it by mistake and without this return value,
  // condition if (!ASSERT_FATAL(...)) would fail, even if conditing passed
  // to it were true - which would lead to queer, unexpected behaviour.
  return true;
}

// ---------------------- private module stuff -------------------------------

// Creates Error() object, reads stack trace from it.
// Returns string containing stack trace trimmed to start with function
// where assert actually got triggered.
function getTrimmedStackTrace(): string
{
  // Create a temporary error object to construct stack trace for us.
  // (use type 'any' because TypeScript wouldn't allow to acecss .stack
  // property otherwise)
  let tmpErr: any = new Error();

  // Now we cut off first three lines from tmpErr.stack string.
  //   First line contains just: 'Error:' which we don't need.
  //   Second line contains name and line of ASSERT() function.
  //   Second line contains name and line of getTrimmedStackTrace() function.
  //   By second and third line we trim stack trace to begin on the line where
  // assertion actually failed, which is exacly what user needs to see.

  // Break stack trace string into an array of lines.
  let stackTraceLines = tmpErr.stack.split('\n');
  // Remove three lines, starting at index 0.
  stackTraceLines.splice(0, 3);
  // Join the array back into a single string
  let stackTrace = stackTraceLines.join('\n');

  return stackTrace;
}