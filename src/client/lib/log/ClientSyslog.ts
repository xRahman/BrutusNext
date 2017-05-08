/*
  Part of BrutusNEXT

  Implements client-side logger.

  Do not use it directly, use /shared/lib/log/Syslog instead.
*/

'use strict';

/// TODO: Az bude log file, tak napsat odchytavani vyjimek, aby se stack trace
///       zapisoval do log filu.

import {App} from '../../../shared/lib/app/App';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';

export class ClientSyslog
{
  // Outputs message to log file. Also sends it to online immortals
  // of required or greater level.
  public static log
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    let entry = "[" + MessageType[msgType] + "] " + text;

    /// Tohle na clientu asi moc nemá smysl...
    /// (teoreticky by šlo poslat na server packet s chybovou hláškou,
    ///  ale dostávat všehcny hlášky ze všech clientů by asi bylo moc spamu...)
    // // We need to check if instance of ServerApp exists, because syslog
    // // messages can be sent even before it is is created.
    // if (App.instanceExists())
    // {
    //   let message = new Message(entry, msgType);
    //
    //   // Send log entry to all online characters that have appropriate
    //   // admin level. Syslog messages don't have sender ('sender'
    //   // parameter is null).
    //   message.sendToAllIngameConnections(adminLevel);
    // }
    
    // Output to stdout.
    console.log(entry);

    // Output to log file.
    /// TODO
  }
}