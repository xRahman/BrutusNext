/*
  Part of BrutusNEXT

  Implements server-side entity.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Attributes} from '../../../shared/lib/class/Attributes';
import {AccountNameLock} from '../../../server/lib/account/AccountNameLock';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';

export class ServerEntity extends Entity
{
  // Default values of property attributes
  // (note that this applies to all properties including those inherited
  //  from Entity class. So if you want to send some property of Entity
  //  to client, you need to specify it's property attributes in Entity
  //  and set 'sentToClient: true' there).
  protected static defaultAttributes: Attributes =
  {
    // By default, properties of server entities are not sent to the client.
    // (This does not apply to properties declared in ancestors like Entity).
    sentToClient: false
  };

  // ---------------- Protected data --------------------

  // ------------- Public static methods ----------------

  // ------------ Protected static methods --------------

  // ---------------- Public methods --------------------

  // ~ Overrides Entity.setName().
  // -> Returns 'false' if name isn't available.
  public async setName
  (
    name: string,
    cathegory: (Entity.NameCathegory | null) = null,
    // This should only be 'false' if you have created
    // a name lock file prior to calling setName().
    createNameLock = true
  )
  : Promise<boolean>
  {
    let oldName = this.getName();
    let oldCathegory = this.getNameCathegory();

    if (cathegory !== null)
    {
      if (this.isPrototypeEntity())
      {
        ERROR("Attempt to set unique name '" + name + "' in cathegory"
          + " '" + Entity.NameCathegory[cathegory] + "' to a prototype"
          + " entity " + this.getErrorIdString() + ". That's not allowed"
          + " - name will be inherited (and thus duplicated) when an"
          + " instance or a descendant prototype is created from this"
          + " prototype entity so it's not possible to ensure that it"
          + " will stay unique. Name is not set");
        return false;
      }

      if (!Utils.hasValidByteLengthAsFileName(name))
      {
        ERROR("Attempt to set unique name '" + name + "' in cathegory"
          + " '" + Entity.NameCathegory[cathegory] + "' to entity"
          + " " + this.getErrorIdString() + " which is longer than"
          + " " + Utils.MAX_FILENAME_BYTE_LENGTH + " bytes when escaped"
          + " to be useable as file name. That's not allowed because"
          + " unique entity names are used as file names (to know that"
          + " the name is taken) and there is a limit of file name length"
          + " (in bytes) on most Unix file systems. Name is not set");
        return false;
      }

      if (createNameLock)
      {
        let id = this.getId();

        /// TODO: Předělat!
        let passwordHash = this.readPasswordHashProperty();

        if (id === null)
        {
          ERROR("Unexpected 'null' value");
          return false;
        }

        if
        (
          !await ServerEntities.requestEntityName
          (
            id,
            name,
            cathegory,
            passwordHash
          )
        )
        {
          ERROR("Attempt to set unique name '" + name + "' in"
            + " cathegory '" + Entity.NameCathegory[cathegory] + "'"
            + " to entity " + this.getErrorIdString() + " which"
            + " is already taken. Name is not changed");
          return false;
        }
      }

      if (oldName && oldCathegory)
      {
        this.removeFromNameLists();

        // Make the old name available again.
        await ServerEntities.releaseName(oldName, oldCathegory);
      }
    }

    super.setName(name, cathegory, createNameLock);

    // Only add entity back to name list if we are changing the name
    // (if it previously had a non-null value).
    if (oldName && oldCathegory)
    {
      this.addToNameLists();
    }

    return true;
  }

  // 
  private readPasswordHashProperty()
  {
    /// TODO: Argh, tohle je hodně špatně. Zřejmě se tu zkouší, jestli
    /// náhodou nejsme Account (který má property 'passwordHash').
    /// Mělo by to samozřejmě bejt tak, že Account si přetíží příslušnou
    /// metodu a savne se, jak potřebuje.

    let passwordHash = (this as any)['passwordHash'];

    if (!passwordHash)
      return null;
    
    return passwordHash;
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------
}