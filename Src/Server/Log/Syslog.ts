/* Part of BrutusNext */

/*
  Server side logging.

  Notes:
    We redefine logging functions in Shared/Log/Syslog
    and Shared/Log/SyslogUtils modules and then reexport
    those modified modules. This allows server-side
    logging functions to be called from shared code.
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
  logError("[UNCAUGHT_EXCEPTION]", getStackTrace(error));
};

SyslogUtils.reportError = (message: string) =>
{
  // Error message will contain stack trace beginning with
  // function 'ERROR' so the user sees where the error
  // originated rather than where the stack trace has been
  // captured.
  const stackTrace = SyslogUtils.getTrimmedStackTrace(ERROR);

  logError("[ERROR]", `${message}\n${stackTrace}`);
};

SyslogUtils.reportException = (error: Error) =>
{
  logError("[EXCEPTION]", getStackTrace(error));
};

export { Syslog, SyslogUtils };

// ----------------- Auxiliary Functions ---------------------

function getStackTrace(error: Error): string
{
  return `${error.message}\n${SyslogUtils.removeErrorMessage(error.stack)}`;
}

function logError(messageType: Syslog.MessageType, message: string): void
{
  const entry = SyslogUtils.createLogEntry(messageType, message);

  logToStderr(entry);
  /// TODO:
  // logToErrorFile(entry);
}

function logToStdout(entry: string): void
{
  console.log(entry);
}

function logToStderr(entry: string): void
{
  console.error(entry);
}