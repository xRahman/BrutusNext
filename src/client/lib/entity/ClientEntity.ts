/*
  Part of BrutusNEXT

  Implements client-side entity.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {Entity} from '../../../shared/lib/entity/Entity';

export class ClientGameEntity extends Entity
{
  //----------------- Protected data --------------------

  // ------------- Public static methods ----------------

  // ------------ Protected static methods --------------

  // ---------------- Public methods --------------------

  // ~ Overrides Entity.setName().
  // -> Returns 'false'.
  public async setName
  (
    name: string,
    cathegory: Entity.NameCathegory = null,
    // This should only be 'false' if you have created
    // a name lock file prior to calling setName().
    createNameLock = true
  )
  {
    ERROR("Attempt to change the name of an entity."
      + " That's not allowed on the client");

    return false;
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------
}