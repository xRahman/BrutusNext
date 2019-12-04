/* --- Part of BrutusNext --- */

/*
  Runtime exception reporting

  --------------------------------------------------------
         EVERY EXCEPTION NEEDS TO BE FIXED ASAP!
        (Even if the MUD doesn't crash right away)
  --------------------------------------------------------

  IMPORTANT:
    Parameter of REPORT() must be an Error object.

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

// Note: 'error' parameter has type 'any' because when you catch
//   an error, typescript has no way of knowing it's type. You still
//   need to throw instances of Error object, however - you will get
//   an error message if you don't.
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