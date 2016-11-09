/*
  Part of BrutusNEXT

  Adds ability to store unique names and search in them.
*/

'use strict';

import {Utils} from '../../shared/Utils';
import {ERROR} from '../../shared/error/ERROR';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {EntityList} from '../../shared/entity/EntityList';
import {Entity} from '../../shared/entity/Entity';
import {EntityManager} from '../../shared/entity/EntityManager';

export class NameSearchList extends EntityList
{
  //------------------ Private data ---------------------

  // Hashmap<[ string, Entity ]>
  //   Key: string id
  //   Value: entity reference
  private uniqueNames = new Map();
  // Do not save or load property 'uniqueNames'.
  private static uniqueNames = { isSaved: false };

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public async loadNamedEntity<T>
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    typeCast: { new (...args: any[]): T }
  )
  : Promise<T>
  {
    if (!typeCast)
    {
      ERROR("Invalid typeCast parameter");
      return null;
    } 

    // This will be used in error messages (somehing like 'character').
    let type = typeCast.name.toLowerCase();
    // This will be used in error messages (somehing like 'Character').
    let capitalizedType = Utils.upperCaseFirstCharacter(type);

    // First check if entity is already loaded in memory. 
    let entity = this.getEntityByName(name);

    // If it is already loaded, there is no point in loading it again.
    if (entity !== undefined)
    {
      if (entity === null)
      {
        ERROR("'null' found in entity list while attempting"
          + " to load " + type + " " + name + ". " + capitalizedType
          + " is not loaded");
        return null;
      }

      if (!entity.isValid())
      {
        ERROR("Attempt to load " + type + " '" + name + "'"
          + " which already exists but is not valid. This"
          + " can happen for example if you forget to update"
          + " removeFromLists() method, so when " + type
          + " is removed from EntityManager (and thus becomes"
          + " invalid), it is not removed from entity list."
          + " " + capitalizedType + " is not loaded");
        return null;
      }

      ERROR("Attempt to load " + type + " '" + name + "'"
        + " which already exists. Returning existing " +  type);
      return entity;
    }

    // Second parameter of loadNamedEntity is used for dynamic type cast.
    entity = await EntityManager.loadNamedEntity
    (
      name,
      cathegory,
      typeCast
    );

    if (!Entity.isValid(entity))
    {
      ERROR("Failed to load " + type + " " + name);
      return null;
    }

    ///account.connection = connection;

    if (name !== entity.getName())
    {
      ERROR(capitalizedType + " name saved in file (" + entity.getName() + ")"
        + " doesn't match " + type + " file name (" + name + ")"
        + capitalizedType + " is not loaded");
        return null;
    }

    this.add(entity);

    return entity;
  }

  // -> Returns true if adding succeeded.
  public add(entity: NamedEntity): boolean
  {
    // Try to add an entity to the list using our ancestor's add() method.
    if (super.add(entity) === null)
      return false;

    // If entity has unique name, add it's id to the hashmap of unique names.
    if (entity.isNameUnique())
      this.uniqueNames.set(entity.getName(), entity);

    return true;
  }

  // Only checks entities with unique names.
  // -> Returns undefined if entity isn't loaded or doesn't exist.
  public getEntityByName(name: string)
  {
    return this.uniqueNames.get(name);
  }

  // Removes entity id from this list, but doesn't delete entity from
  // memory.
  public remove(entity: NamedEntity): boolean
  {
    if (entity.isNameUnique)
    {
      if (entity.getName !== undefined)
      {
        // Remove record from hashmap storing ids of uniquely named entities.
        this.uniqueNames.delete(entity.getName());
      }
      else
      {
        ERROR("Unable to remove entity " + entity.getErrorIdString()
          + " from NameSearchList because it doesn't have a 'name' property");
      }
    }

    return super.remove(entity);
  }

  public hasUniqueEntity(name: string): boolean
  {
    return this.uniqueNames.has(name);
  }

  // -------------- Private methods -------------------
}