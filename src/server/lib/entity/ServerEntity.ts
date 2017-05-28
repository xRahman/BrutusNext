/*
  Part of BrutusNEXT

  Implements server-side entity.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';

export class ServerEntity extends Entity
{
  //----------------- Protected data --------------------

  // ------------- Public static methods ----------------

  // ------------ Protected static methods --------------

  // ---------------- Public methods --------------------

  // ~ Overrides Entity.setName().
  // -> Returns 'false' if name isn't available.
  public async setName
  (
    name: string,
    cathegory: Entity.NameCathegory = null,
    // This should only be 'false' if you have created
    // a name lock file prior to calling setName().
    createNameLock = true
  )
  {
/// TODO: Před setnutím jména je třeba vyhodit entitu z NameListů
/// přes this.removeFromNameLists() a pokud je to prototyp, tak taky
/// z Prototypes. Po setnutí ji tam zase přidat.

    let oldName = this.getName();
    let oldCathegory = this.getNameCathegory();

    if (createNameLock)
    {
      // Check if requested name is available.
      // (This will always be false on client because entity name change
      //  is disabled there.)
      if (!await ServerEntities.requestName(this.getId(), name, cathegory))
        return false;
    }

    // Make the old name available again.
    if (oldName && oldCathegory)
      await ServerEntities.releaseName(oldName, oldCathegory)

    return super.setName(name, cathegory, createNameLock);
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------
}