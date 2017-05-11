/*
  Part of BrutusNEXT

  Implements logger.

  Usage example:

    import {MessageType} from '../shared/lib/message/MessageType';
    import {AdminLevels} from '../shared/lib/admin/AdminLevels';
    import {Syslog} from '../shared/lib/log/Syslog';

    Syslog.log
    (
      "Loading mobile data...",
      MessageType.SYSTEM,
      AdminLevels.CREATOR
    );
*/

'use strict';

import {App} from '../../../shared/lib/app/App';
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

  // Reads stack trace from Error() object.
  // -> Returns string containing stack trace with first few lines
  //    trimmed accoding to 'trimType' parameter.
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

    // Join the array back to a single string.
    return stackTraceLines.join('\n');
  }
}


// ------------------ Type declarations ----------------------

export module Syslog
{
  export enum TrimType
  {
    ERROR,
    PROXY_HANDLER,
    PROXY_HANDLER_PLUS_ONE
  }
}