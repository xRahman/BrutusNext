/*
  Part of BrutusNext

  Runtime exception reporting
*/

/*
  --------------------------------------------------------
         EVERY EXCEPTION NEEDS TO BE FIXED ASAP!
        (Even if the MUD doesn't crash right away)
  --------------------------------------------------------

  Usage example:

    import { REPORT } from 'Shared/Log/REPORT';

    try
    {
      something();
    }
    catch (error);
    {
      REPORT(error, "Something went wrong");
    }
*/

import { ERROR } from "../../Shared/Log/ERROR";
import { SyslogUtils } from "../../Shared/Log/SyslogUtils";

export function REPORT(error: Error, catchMessage?: string): void
{
  let exception = error;

  if (!(error instanceof Error))
  {
    ERROR(`'error' parameter passed to function REPORT() isn't`
      + ` an istance of Error object. Someone probably incorrectly`
      + ` used 'throw "message" instead of 'throw Error("message")'.`
      + ` Fix it so the stack trace shows where the error occured`
      + ` rather than where it has been caught`);

    exception = new Error(`${String(error)}`);
  }

  if (!catchMessage)
  {
    SyslogUtils.reportException(exception);
    return;
  }

  if (exception.message)
    exception.message = `${catchMessage} (${exception.message})`;

  SyslogUtils.reportException(exception);
}