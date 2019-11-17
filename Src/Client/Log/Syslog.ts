/* --- Part of BrutusNext --- */

/*
  Server side logging.

  Notes:
    Here we redefine logging functions in Shared/Log/Syslog
    and Shared/Log/SyslogUtils modules and then reexport
    those modified modules.
      This trick allows server-side logging functions to
    be called from shared code.
*/

import { ERROR } from "../../Shared/Log/ERROR";

import { Syslog } from "../../Shared/Log/Syslog";
import { SyslogUtils } from "../../Shared/Log/SyslogUtils";

Syslog.log = (messageType: Syslog.MessageType, message: string) =>
{
  console.log(SyslogUtils.createLogEntry(messageType, message));
};

Syslog.reportUncaughtException = (error: Error) =>
{
  error.message =
    SyslogUtils.createLogEntry("[UNCAUGHT_EXCEPTION]", error.message);

  logError(error);
};

SyslogUtils.reportError = (message: string) =>
{
  const logEntry = SyslogUtils.createLogEntry("[ERROR]", message);
  const error = new Error(logEntry);

  SyslogUtils.trimStackTrace(error, ERROR);

  logError(error);
};

SyslogUtils.reportException = (error: Error) =>
{
  error.message = SyslogUtils.createLogEntry("[EXCEPTION]", error.message);

  logError(error);
};

export { Syslog, SyslogUtils };

// ----------------- Auxiliary Functions ---------------------

function logError(error: Error)
{
  // Use 'console.error()' instead of 'console.log()' because
  // it better displays stack trace (at least in Chrome).
  console.error(error);
}

/*
import { ERROR } from "../../Shared/Log/ERROR";
import * as Shared from "../../Shared/Log/Syslog";

export class Syslog extends Shared.Syslog
{
  // -------------- Static class data -------------------

  // Here we also assign Syslog instance to Syslog.instance property
  // so it will be accessible from shared code. Without this, functions
  // like ERROR() would not work because Syslog.instance would be
  // 'null'.
  protected static instance = Shared.Syslog.instance = new Syslog();

  // --------------- Protected methods ------------------

  // ~ Overrides Shared.Syslog.log().
  protected log(messageType: Shared.Syslog.MessageType, message: string)
  {
    const entry = Shared.Syslog.createLogEntry(messageType, message);

    console.log(entry);
  }

  // ~ Overrides Shared.Syslog.reportException().
  protected reportException(error: Error, isCaught: boolean): void
  {
    const messageType = Shared.Syslog.exceptionMessageType(isCaught);

    error.message = Shared.Syslog.createLogEntry(messageType, error.message);

    logError(error);
  }

  // ~ Overrides Shared.Syslog.reportError().
  protected reportError(message: string): void
  {
    const logEntry = Shared.Syslog.createLogEntry("[ERROR]", message);
    const error = new Error(logEntry);

    Shared.Syslog.trimStackTrace(error, ERROR);

    logError(error);
  }
}
*/