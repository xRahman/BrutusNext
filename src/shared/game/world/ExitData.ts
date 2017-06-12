/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room exit data.
*/

'use strict';

import {Flags} from '../../../shared/lib/utils/Flags';
import {SharedData} from '../../../shared/game/SharedData';

export class ExitData extends SharedData
{
  /// Momentálně potřebuju vědět jen to, jestli exit do daného směru existuje.
  /// - Časem by tu mohlo být přetížení vodorovných exitů šikmo nahoru/dolů.
  /// - A asi přetížení terénu.

  /// - Na tohle všechno by asi byly nejlepší flagy
  /// (jen nevím, jestli je dokážu narvat do /shared. Možná jo, s tím,
  ///  že se flag names holt budou číst ze serverových dat...
  ///    Nebo spíš že je server bude číst z dat v klientu, ať klient
  ///  nehrabe mimo www root dir).

  public flags = new Flags<ExitData.Flags>();
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module ExitData
{
  export enum Flags
  {
    // If the exit leads to unexplored room, it is considered
    // to be two-way until the room is explored (player doesn't
    // know if she will be able to return back until then).
    ONE_WAY
  }
}