/*
  Part of BrutusNext

  Client side logging
*/

/*
  This module redefines logging functions in Shared/Log/SyslogUtils
  to do client-specific logging.
*/

import { Syslog } from "../../Shared/Log/Syslog";
import { SyslogUtils } from "../../Shared/Log/SyslogUtils";
import { ErrorUtils } from "../../Shared/Utils/ErrorUtils";

SyslogUtils.logEntry = (entry: string) =>
{
  console.log(entry);
};

SyslogUtils.logError = (error: Error) =>
{
  // For some reason Chrome console displays original
  // error message instead of modified one (which has
  // additional useful information). To work around that
  // we clone the error object before displaying it.
  const clonedError = ErrorUtils.clone(error);

  // Use 'console.error()' instead of 'console.log()' because
  // it better displays stack trace (at least in Chrome).
  console.error(clonedError);
};

export { Syslog, SyslogUtils };