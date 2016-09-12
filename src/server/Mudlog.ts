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


enum TrimType
{
  ERROR,
  PROXY_HANDLER,
  PROXY_HANDLER_PLUS_ONE
}

export class Mudlog
{
  // Make 'TrimType' enum a static member of this class.
  public static TrimType = TrimType;

  public static msgType =
  {
    RUNTIME_ERROR:           "RUNTIME ERROR",
    FATAL_RUNTIME_ERROR:     "FATAL RUNTIME ERROR",
    SYSTEM_INFO:             "SYSTEM INFO",
    SYSTEM_ERROR:            "SYSTEM ERROR",
    SCRIPT_COMPILE_ERROR:    "SCRIPT COMPILE ERROR",
    SCRIPT_RUNTIME_ERROR:    "SCRIPT RUNTIME ERROR",
    INVALID_ACCESS:          "INVALID_ACCESS"
    /*
    INVALID_PROPERTY_ACCESS:
      "ATTEMPT TO ACCESS AN INVALID PROPERTY",
    INVALID_ENTITY_PROPERTY_ACCESS:
      "ATTEMPT TO ACCESS PROPERTY OF AN INVALID ENTITY",
    INVALID_VARIABLE_PROPERTY_ACCESS:
      "ATTEMPT TO ACCESS PROPERTY OF INVALID VARIABLE",
    INVALID_VARIABLE_FUNCTION_CALL:
      "ATTEMPT TO CALL FUNCTION ON INVALID VARIABLE"
    */
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
  public static getTrimmedStackTrace(trimType: TrimType): string
  {
    let trimValue = 0;

    switch (trimType)
    {
      case TrimType.ERROR:
        // If the stack trace is requested by ERROR() function,
        // cut off first three lines from tmpErr.stack string.
        // - First line contains just: 'Error:' which we don't need.
        // - Second line contains name and line of ERROR() function.
        // - Third line contains name and line of getTrimmedStackTrace() function.
        // By removing second and third line we trim stack trace to begin on the
        // line where ERROR actually got triggered, which is exacly what user needs
        // to see.
        trimValue = 3;
        break;

      case TrimType.PROXY_HANDLER:
        // If the stack trace is requested by EntityProxyHandler,
        // we cut off first five lines from tmpErr.stack string.
        // - first three are the same as with ERROR, the other one
        //   represent internal call of proxy handler.
        trimValue = 4;
        break;

      case TrimType.PROXY_HANDLER_PLUS_ONE:
        // If the stack trace is requested by EntityProxyHandler,
        // we cut off first five lines from tmpErr.stack string.
        // - first three are the same as with ERROR, another two
        //   represent internal call of proxy handler.
        trimValue = 5;
        break;

    }

    // Create a temporary error object to construct stack trace for us.
    // (use type 'any' because TypeScript wouldn't allow to acecss .stack
    // property otherwise)
    let tmpErr: any = new Error();

    // Break stack trace string into an array of lines.
    let stackTraceLines = tmpErr.stack.split('\n');
    // Remove number of lines equal to 'trimValue', starting at index 0.
    stackTraceLines.splice(0, trimValue);
    // Join the array back into a single string
    let stackTrace = stackTraceLines.join('\n');

    return stackTrace;
  }
}
