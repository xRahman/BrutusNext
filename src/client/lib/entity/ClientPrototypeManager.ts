/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {PrototypeManager} from '../../../shared/lib/entity/PrototypeManager';

export class ClientPrototypeManager extends PrototypeManager
{
  /*
  // Creates root prototype entities if they don't exist yet or loads
  // them from disk. Then recursively loads all prototype entities
  // inherited from them.
  public async initPrototypes(entityClasses: Array<string>)
  {
    TODO
    /// Tady toho asi moc nebude - klient při startu vytváří
    /// jen root prototype entity (a to navíc delají Classes),
    /// zbytek dostává spolu s instancemi entit.

    /// Možná by tu mohla být inicializace root prototype entit
    /// - ale to dává spíš smysl v /shared.
  }
  */
}