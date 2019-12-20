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

SyslogUtils.logEntry = (entry: string) =>
{
  console.log(entry);
};

SyslogUtils.logError = (error: Error) =>
{
  // Use 'console.error()' instead of 'console.log()' because
  // it better displays stack trace (at least in Chrome).
  console.error(error);
};

export { Syslog, SyslogUtils };