/*
  Part of BrutusNEXT

  Various utility functions.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {MessageType} from '../../../shared/lib/message/MessageType';
// import {ServerTelnetSocket} from
//   '../../../server/lib/net/telnet/ServerTelnetSocket';

export module ServerUtils
{
  // Reports exception to Syslog, not just to console.
  export function reportException(err: Error)
  {
    Syslog.log
    (
      "Uncaught exception"
        + "\n"
        + err.stack,
      MessageType.FATAL_RUNTIME_ERROR,
      AdminLevel.IMMORTAL
    );
  }

  /*
  // Extracts 'property' value from 'attributes' object describing
  // an enum 'enumName'.
  export function getEnumAttributes
  (
    attributes: Object,
    enumName: string,
    property: string
  )
  {
    if (property in attributes)
      return attributes[property];

    ERROR("Enum value " + property + " doesn't exist in attributes"
          + " of enum " + enumName + ". You probably added a value"
          + " to the enum but forgot to add it to it's attributes");

    return null;
  }
  */
}