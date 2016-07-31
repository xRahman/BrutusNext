/*
  Part of BrutusNEXT

  Implements logger.

  Usage example:

    import {Mudlog} from '../server/Mudlog';

    Mudlog.log(
      "Loading mobile data...",
      Mudlog.msgType.SYSTEM, Mudlog.levels.CREATOR);
*/

'use strict';

/// TODO: Az bude log file, tak napsat odchytavani vyjimek, aby se stack trace
///       zapisoval do log filu.

export class Mudlog
{
  public static msgType =
  {
    ASSERT:               "ASSERT",
    ASSERT_FATAL:         "ASSERT FATAL",
    SYSTEM_INFO:          "SYSTEM INFO",
    SYSTEM_ERROR:         "SYSTEM ERROR",
    SCRIPT_COMPILE_ERROR: "SCRIPT COMPILE ERROR",
    SCRIPT_RUNTIME_ERROR: "SCRIPT RUNTIME ERROR"
  }

  // Outputs message to log file. Also sends it to online immortals
  // of required or greater level.
  static log
  (
    message: string,
    msgType: string,
    level: number
  )
  {
    // TODO: Kontrolovat level charu, az bude existovat
    // (zatim se loguje vsechno)
    if (true)
    ///if (level.value >= char.level)
    {
      console.log("[" + msgType + "] " + message);
    }
  }
}
