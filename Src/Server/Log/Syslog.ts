/* --- Part of BrutusNext --- */

/*
  Server side logging.

  Notes:
    We redefine logging functions in Shared/Log/Syslog
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
  const entry = SyslogUtils.createLogEntry(messageType, message);

  logToStdout(entry);
  /// TODO:
  // logToFile(entry);
};

Syslog.reportUncaughtException = (error: Error) =>
{
  Syslog.log("[UNCAUGHT_EXCEPTION]", getStackTrace(error));
};

SyslogUtils.reportError = (message: string) =>
{
  // Error message will contain stack trace beginning with
  // function 'ERROR' so the user sees where the error
  // originated rather than where the stack trace has been
  // captured.
  const errorMsg = `${message}\n${SyslogUtils.getTrimmedStackTrace(ERROR)}`;

  Syslog.log("[ERROR]", errorMsg);
};

SyslogUtils.reportException = (error: Error) =>
{
  Syslog.log("[EXCEPTION]", getStackTrace(error));
};

export { Syslog, SyslogUtils };

// ----------------- Auxiliary Functions ---------------------

function logToStdout(entry: string): void
{
  console.log(entry);
}

function getStackTrace(error: Error): string
{
  return `${error.message}\n${SyslogUtils.removeErrorMessage(error.stack)}`;
}