/*
  Part of BrutusNEXT

  Allows entities to be named.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Entity} from '../../shared/entity/Entity';
import {UniqueNames} from '../../shared/entity/UniqueNames';

export class NamedEntity extends Entity
{
  private name = "Unnamed Entity";
  /*
  // Note: We can't use static attribudes for 'name' property, because
  // we want 'uniqueness' flag to be saved to file.
  private isNameUnique = false;
  */
  // In what cathegory is this name unique (accounts, characters, world...).
  // 'null' means that the name is not unique.
  private uniqueNameCathegory: UniqueNames.Cathegory = null;

  public isUnique() { return this.uniqueNameCathegory !== null; }
  

  // The name won't be unique. If this enity had a unique name
  // previously, it will get freed to reuse. 
  public setName(name: string, isNameUnique: boolean)
  {
    if (name === null || name === undefined || name === "")
    {
      ERROR("Attempt to set invalid name, name is not set");
      return;
    }

    if (this.name === name && this.isNameUnique === false)
      // No change, so there is nothing to do.
      return;
    
    // If the name has been unique before, delete name lock file.
    if (this.isNameUnique)
      UniqueNames.deleteNameLockFile(this.name, this.uniqueNameCathegory);

    this.name = name;
    this.isNameUnique = false;
  }

  // Sets a unique name for this entity. If the previous name
  // has been unique, it will get freed to reuse by someone else.
  public setUniqueName(name: string, cathegory: UniqueNames.Cathegory)
  {
    if (name === null || name === undefined || name === "")
    {
      ERROR("Attempt to set invalid name, name is not set");
      return;
    }

    if (this.name === name && this.isNameUnique === true)
      // No change, so there is nothing to do.
      return;

    // If the new name is to be unique, check if it is available.
    if (isNameUnique && !this.isNameAvailable(name))
        // Eror is already reported by isNameAvailable().
        return;
    /*
      {
        // If new name is not available, we won't change anything.
        ERROR("Attempt to change name of entity "
          + this.getErrorIdString() + " to '"
          + name + "', which already exists. Name"
          + " is not changed");
        return;
      }
    */

    // If file with entity name existed, delete it
    // (because we are either going to create a new
    //   one or the name will no longer be unique so
    //   the file lock needs to be removed)
    if (this.isNameUnique === true)
    {
      
    }

    if (isNameUnique)
    {
      createNameLockFile();
    }

    // Now we can do the actual change.
    this.name = name;
    this.isNameUnique = true;
  }

  // ---------------- Public methods --------------------

  // Returns something like "Character 'Zuzka' (id: d-imt2xk99)"
  // (indended for use in error messages).
  public getErrorIdString()
  {
    let id = this.getId();

    if (id === null)
    {
      return "{ className: " + this.className + ","
           + " name: " + this.name + ", id: null }";
    }

    return "{ className: " + this.className + ", name: " + this.name + ","
      + " id: " + id + " }";
  }

  private isNameAvailable
  (
    name: string,
    cathegory: UniqueNames.Cathegory
  )
  : boolean
  {
    if (UniqueNames.exists(name, cathegory))
    {
      ERROR("Attempt to change name of entity "
        + this.getErrorIdString() + " to '"
        + name + "', which already exists. Name"
        + " is not changed");
      return false;
    }

    return true;
  }  
}