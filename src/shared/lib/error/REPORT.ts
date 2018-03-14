/*
  Part of BrutusNEXT

  Implements runtime exception reporting.
*/

/*
  IMPORTANT: Parameter of RERPORT() must be an Error object.

  Typical usage:

    import {REPORT} from '../shared/lib/error/REPORT';

    try
    {
      something();
    }
    catch (error);
    {
      REPORT(error);
    }

  Function REPORT() takes one parameter of type 'any', but it checks
  if it is an instance of Error class. That's because in our example
  typescript doesn't know the type of 'error' variable, because it
  can be thrown almost anywhere, so it has type 'any'.
*/

/*
  Implementation notes:
    Functions ERROR() and FATAL_ERROR() are exported directly (without
  encapsulating class) so they can be imported and called directly without
  the need to type something like ERROR.ERROR().

  They are named with CAPS to diferentiate them from javascript Error object.
*/

'use strict';

import {Utils} from '../../../shared/lib/utils/Utils';
import {App} from '../../../shared/lib/app/App';

// Note: 'error' parameter has type 'any' because when you catch
// an error, typescript has no way of knowing it's type. You still
// need to throw instances of Error object, however - you will get
// an error message if you don't.
export function REPORT(error: any)
{
  let message = '[EXCEPTION]: ';

  if (error instanceof Error)
  {
    error.message = message + error.message;
    App.reportException(error);
  }
  else
  {
    // Note: 'error' param will be converted to string and prepended
    // to error message.
    message += error + "\n"
      + "(ADDITIONAL ERROR: 'error' parameter passed to function"
      + " REPORT() isn't an istance of 'Error' object. Someone"
      + " probably incorrectly used 'throw \"message\"' instead of"
      + "'throw new Error(\"message\")'. Please fix it to stop seeing"
      + " the \"ADDITIONAL ERROR\" message and to have stack trace"
      + " show where the error occured rather than where it has been"
      + " caught)";

    // Note: Stack trace will point here instead of where the error
    // occured. To fix it, 'new Error()' must be thrown.
    App.reportException(new Error(message));
  }
}
