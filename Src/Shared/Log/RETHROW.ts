/*
  Part of BrutusNext

  An error handling function REHTROW()
*/

/*
  RETHROW(error) enriches the error message with additional
  info and rethrows the 'error'.

  Usage example:

    import { RETHROW } from 'Shared/Log/RETHROW';

    try
    {
      something();
    }
    catch (error);
    {
      RETHROW(error, "Something went wrong");
    }
*/

import { ERROR } from "../../Shared/Log/ERROR";

// ! Always throws an exception.
export function RETHROW(error: Error, catchMessage: string): void
{
  let exception = error;

  if (!(error instanceof Error))
  {
    ERROR(`'error' parameter passed to function RETHROW() isn't`
      + ` an istance of Error object. Someone probably incorrectly`
      + ` used 'throw "message" instead of 'throw Error("message")'.`
      + ` Fix it so the stack trace shows where the error occured`
      + ` rather than where it has been caught`);

    exception = new Error(`${String(error)}`);
  }

  exception.message = `${catchMessage} (${exception.message})`;

  throw exception;
}