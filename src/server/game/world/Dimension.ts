/*
  Part of BrutusNEXT

  Dimension (a set of Realms).
*/

/*
  Tohle mozna nakonec bude jen flaga. Dimension asi nepotrebuje
  samostatnou funkcnost. Uvidime...
*/

'use strict';

import {GameEntity} from '../../../server/game/GameEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export class Dimension extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  ///protected static get SAVE_DIRECTORY() { return "./data/dimensions/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  //----------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ~ Overrides Entity.addToNameLists().
  protected addToNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.addToAbbrevLists().
  protected addToAbbrevLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromNameLists().
  protected removeFromNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromAbbrevLists().
  protected removeFromAbbrevLists()
  {
    /// TODO
  }

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Dimension);