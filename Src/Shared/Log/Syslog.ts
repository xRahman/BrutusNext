/*
  Part of BrutusNext

  Logging facility
*/

/*
  Logging is done differently on the client and on the
  server but it needs to work from shared code. To make
  it possible, Syslog functions are overriden in both
  Client/Log/Syslog and Server/Log/Syslog.
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
    // Client messages.
  | "[CLIENT]"
    // Server messages.
  | "[SERVER]"
    // Messages from http server.
  | "[HTTP_SERVER]"
    // Messages from https server.
  | "[HTTPS_SERVER]"
    // Websocket errors.
  | "[WEBSOCKET_ERROR]"
    // Messages from websocket server.
  | "[WEBSOCKET_SERVER]"
    // Player has connected etc.
  | "[CONNECTION]";

  // ! This function needs to be overwritten on the client and server.
  export function log(messageType: MessageType, message: string): void
  {
    throw Error(SyslogUtils.SHOULD_NEVER_BE_CALLED);
  }

  // ! This function needs to be overwritten on the client and server.
  export function reportUncaughtException(error: Error): void
  {
    throw Error(SyslogUtils.SHOULD_NEVER_BE_CALLED);
  }

  // If you get a compiler error "Argument of type '"xy"'
  // is not assignable to parameter of type 'never'",
  // it means that there is a case missing in the switch.
  export function reportMissingCase(variable: never): Error
  {
    return new Error("Unhandled switch case");
  }
}