/*
  Part of BrutusNEXT

  Container storing id's of entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';

export class EntityList<T extends Entity> extends Serializable
{
  // ----------------- Private data ---------------------

  private entities = new Set<T>();

  // --------------- Public accessors -------------------

  public getEntities() { return this.entities; }

  // Number of entities in the list.
  public get size() { return this.entities.size; }

  // ---------------- Public methods --------------------

  // -> Returns true if adding succeeded.
  public add(entity: T): boolean
  {
    if (this.entities.has(entity))
    {
      ERROR("Attempt to add entity '" + entity.getErrorIdString() + "'"
        + " which is already in the list. Entity is not added");
      return false;
    }

    this.entities.add(entity);

    return true;
  }

  // Attempts to load all ivalid entities in the list
  // (this can change the order of entities - invalid
  //  ones are removed and reinserted).
  public async load(containerIdString: string)
  {
    // Iterate over all values in this.entities hashmap.
    for (let entity of this.entities)
    {
      if (entity === null)
      {
        ERROR("'null' entity reference in entity list");
        continue;
      }

      if (!entity.isValid())
      {
        // Remove the invalid reference from the set.
        this.entities.delete(entity);

        // Load the entity from disk.
/// TODO: Tohle se mi vůbec nelíbí - typová kontrola na baterky ;\
/// (Asi by šlo do konstruktoru EntityListu dát jako parametr Class, vůči
///  které se pak bude provádět dynamicTypeCheck)
        entity = <T>await Entities.loadEntityById
        (
          entity.getId(),
          Entity
        );
        
        // Add the new (valid) reference back to the set.
        this.entities.add(entity);
      }
    }
  }

  // Saves all valid entities in the list.
  public async save()
  {
    // Iterate over all value in this.entityIds hashmap.
    for (let entity of this.entities)
    {
      if (entity.isValid())
        await Entities.save(entity);
    }
  }

  // Removes entity id from this list, but doesn't delete entity from
  // Entities.
  // -> Returns 'true' on success.
  public remove(entity: T): boolean
  {
    if (!this.entities.has(entity))
    {
      ERROR("Attempt to remove entity '" + entity.getErrorIdString() + "'"
        + " from EntityList which is not present in it");
      return false;
    }

    this.entities.delete(entity);

    return true;
  }

  // Removes entity from this list and releases it from memory
  // by removing it from Entities (but doesn't delete it from
  // disk).
  public release(entity: T)
  {
    // Remove entity from the list.
    if (this.remove(entity))
    {
      // Remove entity reference from id so the memory can be dealocated.
      Entities.release(entity);
    }
  }

  // -> Returns true if entity is in the list.
  public has(entity: T): boolean
  {
    return this.entities.has(entity);
  }
}