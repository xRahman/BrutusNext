/*
  Part of BrutusNEXT

  Adds ability to store unique names and search in them.
*/

'use strict';

///import {SharedUtils} from '../../../shared/lib/utils/SharedUtils';
import {ERROR} from '../../../shared/lib/error/ERROR';
///import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
import {EntityList} from '../../../server/lib/entity/EntityList';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {ServerApp} from '../../../server/lib/app/ServerApp';

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

  public async loadNamedEntity
  (
    name: string,
    cathegory: NamedEntity.NameCathegory
  )
  {
    // First check if entity is already loaded in memory. 
    let entity = this.getEntityByName(name);

    // If it is already loaded, there is no point in loading it again.
    if (entity !== undefined)
    {
      if (entity === null)
      {
        ERROR("'null' found in entity list while attempting"
          + " to load named entity '" + name + "'. Entity is"
          + " not loaded");
        return null;
      }

      if (!entity.isValid())
      {
        ERROR("Attempt to load named entity '" + name + "'"
          + " which already exists but is not valid. This"
          + " can happen for example if you forget to update"
          + " removeFromLists() method, so when entity is"
          + " removed from Entities (and thus becomes"
          + " invalid), it is not removed from entity list."
          + " entity is not loaded");
        return null;
      }

      ERROR("Attempt to load named entity '" + name + "'"
        + " which already exists. Returning existing entity");
      return entity;
    }

    // Second parameter of loadNamedEntity is used for dynamic type cast.
    entity = await ServerApp.entityManager.loadNamedEntity
    (
      name,
      cathegory
    );

    if (!Entity.isValid(entity))
    {
      ERROR("Failed to load named entity '" + name + "'");
      return null;
    }

    if (name !== entity.getName())
    {
      ERROR("Entity name saved in file (" + entity.getName() + ")"
        + " doesn't match save file name (" + name + ")."
        + " Entity is not loaded");
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