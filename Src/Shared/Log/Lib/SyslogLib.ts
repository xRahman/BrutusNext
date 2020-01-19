/*
  Part of BrutusNext

  Library functions used by Syslog
*/

/*
  Logging is done differently on the client and on
  the server but logging function need to be useable
  from shared code. To make it possible, they need
  to be overridden in both Client/Log/Syslog and
  Server/Log/Syslog.
*/

const MUST_BE_OVERRIDEN = "This"
  + " method should never be called. Make sure that"
  + " it is overridden in both Server/Log/Syslog"
  + " and Client/Log/Syslog and that client or server"
  + " Syslog is imported before shared Syslog";

export namespace SyslogLib
{
  export function logEntry(entry: string): void
  {
    throw Error(MUST_BE_OVERRIDEN);
  }

  export function logError(error: Error): void
  {
    throw Error(MUST_BE_OVERRIDEN);
  }
}