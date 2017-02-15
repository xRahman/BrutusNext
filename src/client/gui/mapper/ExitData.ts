/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room exit data.
*/

'use strict';

/// Hmm tak přímo z toho dědit nepůjde, v jsonu budou exity jinak
/// (respektive, mohl bych je dát přímo jako properties místo Mapy...)
///import {ExitsInterface} from '../../../shared/protocol/world/ExitsInterface';

interface Exit
{
  /// Momentálně potřebuju vědět jen to, jestli exit do daného směru existu.
  /// - Časem by tu mohlo být přetížení vodorovných exitů šikmo nahoru/dolů.
  /// - A asi přetížení terénu.

  /// - Na tohle všechno by asi byly nejlepší flagy
  /// (jen nevím, jestli je dokážu narvat do /shared. Možná jo, s tím,
  ///  že se flag names holt budou číst ze serverových dat...
  ///    Nebo spíš že je server bude číst z dat v klientu, ať klient
  ///  nehrabe mimo www root dir).
}

export class ExitData
{
  private exits = new Map<string, Exit>();

  public set(exitName: string)
  {
    let exit: Exit = {};

    this.exits.set(exitName, exit);
  }

  public has(exitName: string)
  {
    if (this.exits.has(exitName))
      return true;

    return false;
  }

  public getExitData()
  {
    return this.exits.values();
  }
}