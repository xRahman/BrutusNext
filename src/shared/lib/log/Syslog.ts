/*
  Part of BrutusNEXT

  Implements logger.

  Usage example:

    import {Syslog} from '../../../shared/lib/log/Syslog';

    Syslog.log("Loading mobile data...",
      Syslog.msgType.SYSTEM, Syslog.levels.CREATOR);
*/

'use strict';

// Import required classes.
import {App} from '../../../shared/lib/App';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';

export class Syslog
{
  public static log
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    App.syslog(text, msgType, adminLevel);
  }

    // Creates Error() object, reads stack trace from it.
  // Returns string containing stack trace trimmed to start
  // with function where ERROR actually got triggered.
  public static getTrimmedStackTrace(trimType: Syslog.TrimType): string
  {
    let trimValue = 0;

    switch (trimType)
    {
      case Syslog.TrimType.ERROR:
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

      case Syslog.TrimType.PROXY_HANDLER:
        // If the stack trace is requested by EntityProxyHandler,
        // we cut off first five lines from tmpErr.stack string.
        // - first three are the same as with ERROR, the other one
        //   represent internal call of proxy handler.
        trimValue = 4;
        break;

      case Syslog.TrimType.PROXY_HANDLER_PLUS_ONE:
        // If the stack trace is requested by EntityProxyHandler,
        // we cut off first five lines from tmpErr.stack string.
        // - first three are the same as with ERROR, another two
        //   represent internal call of proxy handler.
        trimValue = 5;
        break;

    }

    // Create a temporary error object to construct stack trace for us.
    let tmpErr = new Error();

    // Break stack trace string into an array of lines.
    let stackTraceLines = tmpErr.stack.split('\n');
    // Remove number of lines equal to 'trimValue', starting at index 0.
    stackTraceLines.splice(0, trimValue);
    // Join the array back into a single string
    let stackTrace = stackTraceLines.join('\n');

    return stackTrace;
  }
}


// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module Syslog
{
  export enum TrimType
  {
    ERROR,
    PROXY_HANDLER,
    PROXY_HANDLER_PLUS_ONE
  }
}