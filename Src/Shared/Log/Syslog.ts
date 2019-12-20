/*
  Part of BrutusNext

  Logging facility
*/

/*
  Regular log messages have a message type so they can be
  filtered. Error messages don't have it - all errors must
  be fixed ASAP so there is no point in filtering.
*/

/*
  Best error logging practices:

    If you need to return from the function after reporting an error,
    throw an exception instead (unless you are a top-level even handler
    so there is noone else to catch the exception). Syslog.logError()
    should only be used if you want to log something that you can
    immediately recover from.

    Try to write error messages that explain what are the possible causes
    and available solutions. At the time of writing of Syslog.logError(),
    you probably know quite well what could go wrong. 5 years later you will
    pay gold for any such hint.

    Don't include name of the function where error occured. Stack trace is
    added automatically to the log message.
*/

import { SyslogUtils } from "../../Shared/Log/SyslogUtils";

type SyslogMessageType =
  | "[CLIENT]"
  | "[SERVER]"
  | "[HTTP_SERVER]"
  | "[HTTPS_SERVER]"
  | "[WEBSOCKET_SERVER]"
  | "[CONNECTION]";

export namespace Syslog
{
  export function log(messageType: SyslogMessageType, message: string): void
  {
    SyslogUtils.logEntry(`${String(messageType)} ${message}`);
  }

  export function logError(message: string): void;
  export function logError(error: Error, catchMessage?: string): void;
  export function logError
  (
    errorOrMessage: string | Error,
    catchMessage?: string
  )
  : void
  {
    if (errorOrMessage instanceof Error)
    {
      logExistingErrorObject(errorOrMessage, catchMessage);
    }
    else
    {
      logNewErrorObject(errorOrMessage);
    }
  }

  export function reportUncaughtException(error: Error): void
  {
    error.message = `[UNCAUGHT_EXCEPTION] ${error.message}`;

    SyslogUtils.logError(error);
  }

  // If you get a compiler error "Argument of type '"xy"'
  // is not assignable to parameter of type 'never'",
  // it means that there is a case missing in the switch.
  export function reportMissingCase(variable: never): Error
  {
    return new Error("Unhandled switch case");
  }
}

function logExistingErrorObject(error: Error, catchMessage?: string): void
{
  error.message = `[ERROR] ${error.message}`;

  if (catchMessage)
    error.message = `${catchMessage} (${error.message})`;

  SyslogUtils.logError(error);
}

function logNewErrorObject(message: string): void
{
  const error = new Error(message);

  error.message = `[ERROR] ${error.message}`;

  // Modify stack trace to start where Syslog.logError() was called.
  Error.captureStackTrace(error, Syslog.logError);

  SyslogUtils.logError(error);
}