/*
  Part of BrutusNEXT

  Dimension (a set of Realms).
*/

/*
  Tohle mozna nakonec bude jen flaga. Dimension asi nepotrebuje
  samostatnou funkcnost. Uvidime...
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {GameEntity} from '../../game/GameEntity';

export class Dimension extends GameEntity
{
  constructor(name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  static get SAVE_DIRECTORY() { return "./data/dimensions/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file will this area be saved to.
  protected getSaveDirectory(): string
  {
    return Dimension.SAVE_DIRECTORY + this.getIdStringValue() + ".json";
  }

  // ---------------- Private methods -------------------
}

// Add constructor of this class as a property of global object,
// so it's instances can be created dynamically in runtime.
global['Dimension'] = Dimension;