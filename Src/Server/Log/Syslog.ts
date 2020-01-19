/*
  Part of BrutusNext

  Server side logging
*/

/*
  This module redefines logging functions in Shared/Log/SyslogUtils
  to do server-specific logging.
*/

import { Syslog } from "../../Shared/Log/Syslog";
import { ErrorUtils } from "../../Shared/Utils/ErrorUtils";
import { SyslogLib } from "../../Shared/Log/Lib/SyslogLib";

SyslogLib.logEntry = (entry: string) =>
{
  logToStdout(entry);
  logToFile(entry);
};

SyslogLib.logError = (error: Error) =>
{
  let trimmedStackTrace = ErrorUtils.removeErrorMessage(error.stack);

  if (!trimmedStackTrace)
    trimmedStackTrace = "Stack trace is not available.";

  const entry = `${error.message}\n${trimmedStackTrace}`;

  logToStderr(entry);
  logToErrorFile(entry);
};

export { Syslog, SyslogLib as SyslogUtils };

// ----------------- Auxiliary Functions ---------------------

function logToStdout(entry: string): void
{
  console.log(entry);
}

function logToFile(entry: string): void
{
  /// TODO
}

function logToStderr(entry: string): void
{
  console.error(entry);
}

function logToErrorFile(entry: string): void
{
  /// TODO
}