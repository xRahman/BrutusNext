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
  // TODO: Tohle by se asi hodilo prehodit jinam, nejspis nekam do classy pro
  // immortalske zalezitosti. Zatim to necham tady.
  public static levels =
  {
    MORTAL:      { value: 0, str: "MORTAL" },
    IMMORTAL:    { value: 1, str: "IMMORTAL" },
    GOD:         { value: 2, str: "GOD" },
    GREATER_GOD: { value: 3, str: "GREATER_GOD" },
    CREATOR:     { value: 4, str: "CREATOR" },
    IMPLEMENTOR: { value: 5, str: "IMPLEMENTOR" },
    // This probably won't be needed here.
    ///length:      { value: 6, str: "ERROR" }
  }

  public static msgType =
  {
    ASSERT:       { str: "ASSERT" },
    ASSERT_FATAL: { str: "ASSERT FATAL" },
    SYSTEM_INFO:  { str: "SYSTEM INFO" },
    SYSTEM_ERROR: { str: "SYSTEM ERROR" }
  }

  // Outputs message to log file. Also sends it to online immortals
  // of required or greater level.
  static log(
    message: string,
    msgType: MudlogMessageType,
    level: MudlogImmortalLevel)
  {
    // TODO: Kontrolovat level charu, az bude existovat
    // (zatim se loguje vsechno)
    if (true)
    ///if (level.value >= char.level)
    {
      // Do not log fatal asserts to the console, only to the log file
      // and to online immortals.
      // (stack trace will be sent to the console via throwing Error())

/// Promisy (async funkce) mi zerou exceptiony, takze prozatim budu
/// vypisovat i fatal asserty do konzole (holt tam budou dvakrat, kdyz
/// je spusti neco mimo async funkci, ale lepsi, nez se o chybe nedozvedet
/// vubec).

///      if (msgType.str !== Mudlog.msgType.ASSERT_FATAL.str)
///      {
        // Log message to the console.
        console.log("[" + msgType.str + "] " + message);
///      }
    }
  }
}

// ---------------------- private module stuff -------------------------------

interface MudlogMessageType
{
  str: string;
}

interface MudlogImmortalLevel
{
  value: number;
  str: string;
}