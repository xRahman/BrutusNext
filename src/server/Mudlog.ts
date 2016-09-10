/*
  Part of BrutusNEXT

  Implements logger.

  Usage example:

    import {Mudlog} from '../server/Mudlog';

    Mudlog.log(
      "Loading mobile data...",
      Mudlog.msgType.SYSTEM, Mudlog.levels.CREATOR);
*/

'use strict';

/// TODO: Az bude log file, tak napsat odchytavani vyjimek, aby se stack trace
///       zapisoval do log filu.

export class Mudlog
{
  public static msgType =
  {
    ERROR:                   "ERROR",
    FATAL_ERROR:             "FATAL_ERROR",
    SYSTEM_INFO:             "SYSTEM INFO",
    SYSTEM_ERROR:            "SYSTEM ERROR",
    SCRIPT_COMPILE_ERROR:    "SCRIPT COMPILE ERROR",
    SCRIPT_RUNTIME_ERROR:    "SCRIPT RUNTIME ERROR",
    INVALID_PROPERTY_ACCESS: "INVALID_PROPERTY_ACCESS",
    INVALID_ENTITY_ACCESS:   "INVALID_ENTITY_ACCESS",
    INVALID_VARIABLE_ACCESS: "INVALID_VARIABLE_ACCESS"
  }

  // Outputs message to log file. Also sends it to online immortals
  // of required or greater level.
  public static log
  (
    message: string,
    msgType: string,
    level: number
  )
  {
    // TODO: Kontrolovat level charu, az bude existovat
    // (zatim se loguje vsechno)
    if (true)
    ///if (level.value >= char.level)
    {
      console.log("[" + msgType + "] " + message);
    }
  }

  // Creates Error() object, reads stack trace from it.
  // Returns string containing stack trace trimmed to start
  // with function where ERROR actually got triggered.
  public static getTrimmedStackTrace(): string
  {
    // Create a temporary error object to construct stack trace for us.
    // (use type 'any' because TypeScript wouldn't allow to acecss .stack
    // property otherwise)
    let tmpErr: any = new Error();

    // Now we cut off first three lines from tmpErr.stack string.
    // - First line contains just: 'Error:' which we don't need.
    // - Second line contains name and line of ERROR() function.
    // - Third line contains name and line of getTrimmedStackTrace() function.
    // By removing second and third line we trim stack trace to begin on the
    // line where ERROR actually got triggered, which is exacly what user needs
    // to see.

    // Break stack trace string into an array of lines.
    let stackTraceLines = tmpErr.stack.split('\n');
    // Remove three lines, starting at index 0.
    stackTraceLines.splice(0, 3);
    // Join the array back into a single string
    let stackTrace = stackTraceLines.join('\n');

    return stackTrace;
  }
}
