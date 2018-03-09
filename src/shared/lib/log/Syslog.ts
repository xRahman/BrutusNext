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

  public static logConnectionInfo(message: string)
  {
    this.log
    (
      message,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  public static logSystemInfo(message: string)
  {
    this.log
    (
      message,
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }

  // Reads stack trace from Error() object.
  // -> Returns string containing stack trace with first few lines
  //    trimmed accoding to 'trimType' parameter.
  public static getTrimmedStackTrace(trimType: Syslog.TrimType): string | null
  {
    let trimValue = 0;

    // Cut off first few lines from tmpErr.stack string so
    // it starts at the line where error actually occured.
    switch (trimType)
    {
      case Syslog.TrimType.ERROR:
        
        trimValue = 5;
        break;

      case Syslog.TrimType.PROXY_HANDLER:
        trimValue = 6;
        break;

      case Syslog.TrimType.PROXY_HANDLER_PLUS_ONE:
        trimValue = 7;
        break;
    }

    // Create a temporary error object to construct stack trace for us.
    let tmpErr = new Error();

    /// TODO: Asi spíš exception. Error object vyrábím přímo tady, takže
    /// stack trace by měl bejt k dispozici vždycky.
    if (!tmpErr)
      return null;

    let stackTrace =
      tmpErr.stack ? tmpErr.stack : "Stack trace is not available.";

    // Break stack trace string into an array of lines.
    let stackTraceLines = stackTrace.split('\n');
    
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