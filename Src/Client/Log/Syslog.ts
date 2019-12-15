/*
  Part of BrutusNext

  Client side logging
*/

/*
  We redefine logging functions in Shared/Log/Syslog
  and Shared/Log/SyslogUtils modules and then reexport
  those modified modules. This allows server-side logging
  functions to be called from shared code.
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

function logError(error: Error): void
{
  // Use 'console.error()' instead of 'console.log()' because
  // it better displays stack trace (at least in Chrome).
  console.error(error);
}