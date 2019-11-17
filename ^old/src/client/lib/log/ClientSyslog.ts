/*
  Part of BrutusNEXT

  Implements client-side logger.

  Do not use it directly, use /shared/lib/log/Syslog instead.
*/

'use strict';

import {App} from '../../../shared/lib/app/App';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';

export class ClientSyslog
{
  // Outputs log message to log file.
  public static log
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    let entry = "[" + MessageType[msgType] + "] " + message;

    // Output to debug console.
    console.log(entry);
  }
}