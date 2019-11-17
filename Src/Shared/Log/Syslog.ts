/* --- Part of BrutusNext --- */

/*
  Syslog.

  Notes:
    Logging is done differently on the client and on the
    server but Syslog.log() needs to be useable from shared
    code. To make it possible, Syslog.log functions needs
    to be overwritten in both Client/Log/Syslog and
    Server/Log/Syslog.
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
}

/*
// import "../../Shared/Utils/String";

// tslint:disable-next-line:no-unnecessary-class
export class Syslog
{
  // ------------- Public static methods ----------------

  public static reportUncaughtException(error: any)
  {
    const uncaughtExceptionMessage = "This exception has"
      + " propagated to top-level function. It needs to"
      + " be caught much deeper where the error can be"
      + " properly recovered from.";

    if (error instanceof Error)
    {
      error.message = `${error.message} (${uncaughtExceptionMessage})`;
      Syslog.REPORT(error, false);
    }
    else
    {
      Syslog.REPORT
      (
        new Error(`${error} (${uncaughtExceptionMessage})`),
        false
      );
    }
  }

  // Use function REPORT from /Shared/Log/Report.
  public static REPORT(error: Error, isCaught = true)
  {
    Syslog.reportException(error, isCaught);
  }

  // Don't call this directly, use ERROR() instead.
  public static ERROR(message: string): void
  {
    // If someone tries to report error before a syslog instance is created
    // (for example directly from a class inicialization), we can't use regular
    // logging process so we throw exception instead.
    if (Syslog.instance === "Doesn't exist")
    {
      throw Error(`ERROR() occured before`
        + `application was created: "${message}"`);
    }

    Syslog.reportError(message);
  }

  // Note: If you get a compiler error "Argument of type '"xy"'
  //   is not assignable to parameter of type 'never'",
  //   it means that there is a case missing in the switch.
  public static reportMissingCase(variable: never)
  {
    return new Error("Unhandled switch case");
  }

  // ------------ Protected static methods --------------

  // ! This method needs to be overriden in descendants.
  protected static logFunction
  (
    messageType: Syslog.MessageType,
    message: string
  )
  {
    throw Error("Syslog log function is not inicialized. Make"
      + " sure it is overriden in both Client/Log/Syslog and"
      + " Server/Log/Syslog");
  }

  // ! This method needs to be overriden in descendants.
  protected static reportError(message: string)
  {
    throw Error("Syslog report error function is not inicialized."
      + " Make sure it is overriden in both Client/Log/Syslog and"
      + " Server/Log/Syslog");
  }

  // ! This method needs to be overriden in descendants.
  protected static reportException
  (
    messageType: Syslog.MessageType,
    message: string
  )
  {
    throw Error("Syslog report exception function is not inicialized."
      + " Make sure it is overriden in both Client/Log/Syslog and"
      + " Server/Log/Syslog");
  }
}
*/