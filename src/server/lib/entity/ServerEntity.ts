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
    if (cathegory !== null && this.isPrototypeEntity())
    {
      ERROR("Attempt to set unique name '" + name + "' in cathegory"
        + " '" + Entity.NameCathegory[cathegory] + "' to a prototype"
        + " entity. That's not allowed - name will be inherited"
        + " (and thus duplicated) when an instance or a descendant"
        + " prototype is created from this prototype entity so it's"
        + " not possible to ensure that it will stay unique. Name is"
        + " not set");
      return false;
    }

    let oldName = this.getName();
    let oldCathegory = this.getNameCathegory();

    if (createNameLock)
    {
      let id = this.getId();

      if (!await ServerEntities.requestEntityName(id, name, cathegory))
      {
        ERROR("Attempt to set unique name '" + name + "' in"
          + " cathegory '" + Entity.NameCathegory[cathegory] + "'"
          + " to entity " + this.getErrorIdString() + " which"
          + " is already taken. Name is not changed");
        return false;
      }
    }

    // Make the old name available again.
    if (oldName && oldCathegory)
      await ServerEntities.releaseName(oldName, oldCathegory)

    return super.setName(name, cathegory, createNameLock);
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------
}