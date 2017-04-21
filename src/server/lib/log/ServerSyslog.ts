/*
  Part of BrutusNEXT

  Implements logger.

  Usage example:

    import {Syslog} from '../server/Syslog';

    Syslog.log("Loading mobile data...",
      Syslog.msgType.SYSTEM, Syslog.levels.CREATOR);
*/

'use strict';

/// TODO: Az bude log file, tak napsat odchytavani vyjimek, aby se stack trace
///       zapisoval do log filu.

import {App} from '../../../shared/lib/App';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Message} from '../../../server/lib/message/Message';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';

/*
enum TrimType
{
  ERROR,
  PROXY_HANDLER,
  PROXY_HANDLER_PLUS_ONE
}
*/

export class ServerSyslog
{
  /*
  // Make 'TrimType' enum a static member of this class.
  public static TrimType = TrimType;
  */

  /// Přesunuto do Message.Type
  /*
  public static msgType =
  {
    RUNTIME_ERROR:           "RUNTIME ERROR",
    FATAL_RUNTIME_ERROR:     "FATAL RUNTIME ERROR",
    SYSTEM_INFO:             "SYSTEM INFO",
    SYSTEM_ERROR:            "SYSTEM ERROR",
    SCRIPT_COMPILE_ERROR:    "SCRIPT COMPILE ERROR",
    SCRIPT_RUNTIME_ERROR:    "SCRIPT RUNTIME ERROR",
    INVALID_ACCESS:          "INVALID ACCESS"
  }
  */

  // Outputs message to log file. Also sends it to online immortals
  // of required or greater level.
  public static log
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    let entry = "[" + MessageType[msgType] + "] " + text;
    let message = new Message(entry, msgType);

    // We need to check if instance of ServerApp exists, because syslog
    // messages can be sent even before it is is created.
    if (App.instanceExists())
    {
      // Send log entry to all online characters that have appropriate
      // admin level. Syslog messages don't have sender ('sender'
      // parameter is null).
      message.sendToAllIngameConnections(adminLevel);
    }
    
    // Output to stdout.
    console.log(entry);

    // Output to log file.
    /// TODO
  }
}