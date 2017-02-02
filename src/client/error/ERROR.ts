/*
  Part of BrutusNEXT

  Implements client error logging.
*/

'use strict';

// Sends error message and a stack trace to syslog.
export function ERROR(message: string)
{
  console.log('ERROR: ' + message);
}

///export = ERROR;