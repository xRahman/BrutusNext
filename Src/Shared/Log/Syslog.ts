/* --- Part of BrutusNext --- */

/*
  Syslog.

  Notes:
    Logging is done differently on the client and on the
    server but Syslog.log() needs to be useable from shared
    code. To make it possible, Syslog.log functions are
    overwritten in both Client/Log/Syslog and Server/Log/Syslog.
*/

import { SyslogUtils } from "../../Shared/Log/SyslogUtils";

export namespace Syslog
{
  export type MessageType =
    // Sent when REPORT(error) is called. Contains original exception.
    "[EXCEPTION]"
    // Sent when exeption propagates to the top-level function
    // (which shouldn't happen).
  | "[UNCAUGHT_EXCEPTION]"
    // Sent when ERROR() is called.
  | "[ERROR]"
    // Something is ok (game is successfuly loaded]" | etc.).
  | "[INFO]"
    // Messages from http server.
  | "[HTTP_SERVER]"
    // Messages from https server.
  | "[HTTPS_SERVER]"
    // Messages from websocket communication.
  | "[WEBSOCKET]"
    // Messages from websocket server.
  | "[WEBSOCKET_SERVER]"
    // Player has connected etc.
  | "[CONNECTION_INFO]";

  // ! This function needs to be overwritten on the client and server.
  export function log(messageType: MessageType, message: string)
  {
    throw Error(SyslogUtils.THIS_SHOULD_NEVER_BE_CALLED);
  }

  // ! This function needs to be overwritten on the client and server.
  export function reportUncaughtException(error: Error)
  {
    throw Error(SyslogUtils.THIS_SHOULD_NEVER_BE_CALLED);
  }
}