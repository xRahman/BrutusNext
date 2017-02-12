/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room exit data.
*/

'use strict';

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

export interface ExitsInterface
{
  // Any number of properties of type Exit.
  [exitName: string]: Exit;
}