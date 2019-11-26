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
  // function 'ERROR' so the user see where the error
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

// export class Syslog extends Shared.Syslog
// {
//   /*
//   // -------------- Static class data -------------------

//   // Here we also assign Syslog instance to Syslog.instance property
//   // so it will be accessible from shared code. Without this, functions
//   // like ERROR() would not work because Syslog.instance would be
//   // 'null'.
//   protected static instance = Shared.Syslog.instance = new Syslog();

//   // --------------- Protected methods ------------------

//   // ~ Overrides Shared.Syslog.log().
//   protected log(messageType: Shared.Syslog.MessageType, message: string)
//   {
//     const entry = Syslog.createLogEntry(messageType, message);

//     logToStdout(entry);
//     // TODO:
//     // logToFile(entry);
//   }

//   // ~ Overrides Shared.Syslog.reportException().
//   protected reportException(error: Error, isCaught: boolean): void
//   {
//     let message = error.message;

//     message += `\n${Syslog.removeErrorMessage(error.stack)}`;

//     this.log(Syslog.exceptionMessageType(isCaught), message);
//   }

//   // ~ Overrides Shared.Syslog.reportError().
//   protected reportError(message: string): void
//   {
//     const stackTrace = Shared.Syslog.createTrimmedStackTrace(ERROR);
//     const errorMsg = `${message}\n${stackTrace}`;

//     this.log("[ERROR]", errorMsg);
//   }
//   */
// }

// ----------------- Auxiliary Functions ---------------------

function logToStdout(entry: string): void
{
  console.log(entry);
}

function getStackTrace(error: Error): string
{
  return `${error.message}\n${SyslogUtils.removeErrorMessage(error.stack)}`;
}