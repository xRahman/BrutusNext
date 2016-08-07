/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/

/// TODO: Upravit komentáře (je jen jeden entity container na entity všech
/// druhů).

/*
  All instances of idable objects need to be held only in some
  IdableObjectsContainer. For example all game entities are held
  in Game.entities (which is IdableObjectsContainer). Everything
  else accesses idable objects only by their ids (by asking respective
  container or by using internal reference within id by calling
  id.getObject()).

  You can imagine it as a separate memory block (or database) with id's
  serving as pointers into this memory (or database).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {NamedClass} from '../shared/NamedClass';
import {Entity} from '../shared/Entity';
import {EntityId} from '../shared/EntityId';
import {IdProvider} from '../shared/IdProvider';
import {Server} from '../server/Server';

export class EntityContainer
{
  // -------------- Protected class data ----------------

  // Hashmap<[ string, Entity ]>
  //   Key: stringId
  //   Value: entity
  protected entities = new Map();

  // ---------------- Public methods --------------------

  // Inserts a new entity to this.entities, returns its unique id.
  public addUnderNewId(entity: Entity): EntityId
  {
    this.commonAddEntityChecks(entity);

    ASSERT_FATAL(entity.getId() === null,
      "Attempt to add entity which already has an id");

    let id = Server.idProvider.generateId(entity);

    this.entityMustNotExist(id);

    // Entity remembers it's own id.
    entity.setId(id);

    // Insert entity to hashmap under it's id.
    this.entities.set(id.getStringId(), entity);

    return id;
  }

  // Inserts entity under an existing id (which needs to be set as entity.id).
  public addUnderExistingId(entity: Entity)
  {
    this.commonAddEntityChecks(entity);

    let id = entity.getId();

    ASSERT_FATAL(id !== undefined,
      "Attempt to add entity with missing id");

    ASSERT_FATAL(id !== null,
      "Attempt to add entity with invalid id");

    ASSERT_FATAL(entity.className === id.getType(),
      "Attempt to add entity of class '" + entity.className + "'"
      + " under id that is of type '" + id.getType() + "'");

    this.entityMustNotExist(id);

    // Add entity to hashmap under it's id.
    this.entities.set(id.getStringId(), entity);
  }

  public get(id: EntityId): Entity
  {
    ASSERT_FATAL(id != null, "Trying to get entity using invalid id");

    let entity = this.entities.get(id.getStringId());

    ASSERT_FATAL(entity !== undefined,
      "Entity (" + id.getStringId() + ") no longer exists");

    return entity;
  }

  // Check if entity with this id exists in this.entities.
  public has(id: EntityId): boolean
  {
    ASSERT_FATAL(id !== null, "Trying to get entity using invalid id");

    return this.entities.has(id.getStringId());
  }

  // Removes reference to an entity so it can be deallocated.
  // (Entity is NOT deleted from disk, just dropped from memory.)
  // Id is not dropped, but it's entity state is set to NOT_LOADED.
  public dropEntity(id: EntityId)
  {
    ASSERT_FATAL(id !== null, "Invalid id");

    if (!ASSERT(this.entities.has(id.getStringId()),
        "Attempt to delete entity (" + id.getStringId() + ")"
        + " that doesn't exist in entities"))
      return;

    // Set internal reference to identified object to null.
    // (id object will still exist after referenced object is removed,
    // it just won't be valid anymore).
    id.dropEntity();

    // Delete record from hashmap.
    this.entities.delete(id.getStringId());
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods -------------------

  private entityMustNotExist(id: EntityId)
  {
    // Entity with this id must not already exist.
    //   This should never happen, because ids are issued sequentionaly within
    // a single boot and each id contains boot timestamp in it. So the only way
    // two ids could be identical is to launch two instances of the server
    // in exactly the same milisecond.
    //   It means that if this happened, you have probably duplicated some
    // objects somewhere.
    ASSERT_FATAL(!(this.entities.has(id.getStringId)),
      "Attempt to add entity with id (" + id.getStringId + ") that already"
      + " exists in this.entities");
  }

  private commonAddEntityChecks(entity: Entity)
  {
    ASSERT_FATAL(entity !== null && entity !== undefined,
      "Attempt to add 'null' or 'undefined' entity to this.entities");

    ASSERT_FATAL(NamedClass.CLASS_NAME_PROPERTY in entity,
      "Attempt to add entity to this.entities that is not inherited from"
      + " class Entity");

    ASSERT_FATAL(Entity.ID_PROPERTY in entity,
      "Attempt to add entity to this.entities that is not inherited from"
      + " class Entity");
  }
}