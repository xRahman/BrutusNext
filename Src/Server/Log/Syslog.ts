/*
  Part of BrutusNext

  Server side logging
*/

/*
  This module redefines logging functions in Shared/Log/SyslogUtils
  to do server-specific logging.
*/

import { Syslog } from "../../Shared/Log/Syslog";
import { SyslogUtils } from "../../Shared/Log/SyslogUtils";

SyslogUtils.logEntry = (entry: string) =>
{
  logToStdout(entry);
  logToFile(entry);
};

SyslogUtils.logError = (error: Error) =>
{
  const entry = `${error.message}\n${removeErrorMessage(error.stack)}`;

  logToStderr(entry);
  logToErrorFile(entry);
};

export { Syslog, SyslogUtils };

// ----------------- Auxiliary Functions ---------------------

// Removes lines from the start of multiline string 'str' that
// don't start with 'prefix'. Lines need to be separated by '\n'.
function removeLinesWithoutPrefix(str: string, prefix: string): string
{
  const LINE_BREAK = "\n";
  const lines = str.split(LINE_BREAK);

  while (!lines[0].startsWith(prefix))
  {
    lines.shift();
  }

  return lines.join(LINE_BREAK);
}

export function removeErrorMessage(stackTrace?: string): string
{
  if (!stackTrace)
    return "Stack trace is not available.";

  // Stack trace in Error object starts with error message
  // prefixed with 'Error' which would be confusing in the log.
  //   To remove it, we trim lines not starting with '    at '.
  // (Error message can be multi-line so removing just 1 line
  //  would not always be enough.)
  return removeLinesWithoutPrefix(stackTrace, "    at ");
}

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