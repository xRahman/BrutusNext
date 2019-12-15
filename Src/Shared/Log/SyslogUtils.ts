/*
  Part of BrutusNext

  Syslog-related utility functions
*/

/*
  Logging is done differently on the client and on
  the server but logging function need to be useable
  from shared code. To make it possible, they need
  to be overridden in both Client/Log/SyslogUtils
  andServer/Log/SyslogUtils.
*/

import { Syslog } from "../../Shared/Log/Syslog";

export namespace SyslogUtils
{
  export const SHOULD_NEVER_BE_CALLED = "This"
    + " method should never be called. Make sure that"
    + " it is overridden in both Server/Log/Syslog"
    + " and Client/Log/Syslog and that client or server"
    + " Syslog is imported before shared Syslog";

  // ! This function needs to be overwritten on the client and server.
  export function reportError(message: string): void
  {
    throw Error(SHOULD_NEVER_BE_CALLED);
  }

  // ! This function needs to be overwritten on the client and server.
  export function reportException(error: Error): void
  {
    throw Error(SHOULD_NEVER_BE_CALLED);
  }

  export function createLogEntry
  (
    messageType: Syslog.MessageType,
    message: string
  )
  : string
  {
    return `${messageType} ${message}`;
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

  // Returns stack trace beginning with function 'stackTop'.
  export function getTrimmedStackTrace
  (
    stackTop: (message: string) => void
  )
  : string
  {
    const tmpErr = trimStackTrace(new Error(), stackTop);

    return removeErrorMessage(tmpErr.stack);
  }

  // Modifies 'stack' property of Error object 'error' so
  // it starts with function 'stackTop'.
  export function trimStackTrace
  (
    error: Error,
    stackTop: (message: string) => void
  )
  : Error
  {
    Error.captureStackTrace(error, stackTop);

    return error;
  }
}

// ----------------- Auxiliary Functions ---------------------

// Removes lines from the start of multiline string 'str' that
// don't start with 'prefix'. Lines need to be separated by '\n'.
function removeLinesWithoutPrefix(str: string, prefix: string): string
{
  const LINE_BREAK = "\n";
  const lines = str.split(LINE_BREAK);

  while (lines[0].startsWith(prefix))
  {
    lines.shift();
  }

  // Join 'lines' back to a single multi-line string.
  return lines.join(LINE_BREAK);
}