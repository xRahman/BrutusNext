/*
  Part of BrutusNEXT

  Implements container to store instances of entities identified by
  unique string ids.
*/

/*
  All instances of entities (accounts, connections, characters, rooms, etc.)
  need to be held only in in Server.entityManager. Entities are not referenced
  directly but through their Proxy object (see EntityProxyHandler.ts) so if
  you access deleted entity, an error message will be logged.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
//import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
//import {NamedClass} from '../shared/NamedClass';
import {IdProvider} from '../shared/IdProvider';
import {Entity} from '../shared/Entity';
import {EntityProxyHandler} from '../shared/EntityProxyHandler';
//import {EntityId} from '../shared/EntityId';

export class EntityManager
{
  // -------------- Private class data -----------------

  // Hashmap<[ string, EntityRecord ]>
  //   Key: string id
  //   Value: { entity proxy, list of entity proxy handlers }
  private entityRecords = new Map();

  private idProvider = null;

  constructor(timeOfBoot: Date)
  {
    this.idProvider = new IdProvider(timeOfBoot);
  }

  // ---------------- Public methods --------------------

  public updateReference(id: string, handler: EntityProxyHandler)
  {
    let entityRecord: EntityRecord = this.entityRecords.get(id);

    if (entityRecord === undefined)
      return undefined;

    // When a handler is asking to update it's reference, it means
    // that the entity had been removed from EntityManager and than
    // readded to it (it happens for example when player quits the
    // game and logs back again). In that case we need to remember
    // this old handler to which a new reference will be issued,
    // so we can invalidate the reference when entity is removed
    // from EntityManager again.
    entityRecord.proxyHandlers.push(handler);

    // This will return an entity proxy.
    return entityRecord.getEntity();
  }

  // Removes entity from manager but doesn't delete it
  // (this is used for example when player quits the game).
  public remove(entity: Entity)
  {
    let entityRecord = this.entityRecords.get(entity.getId());

    ASSERT(entityRecord !== undefined,
      "Attempt to remove entity " + entity.getErrorIdString()
      + " from EntityManager which is not present in the manager");

    // Set to null all proxy handlers of this entity (so anyone who
    // still has a reference to entity proxy will know that entity is
    // no longer valid).
    entityRecord.invalidate();

    // Remove a record from hashmap (so when anyone ask for this
    // entity using it's string id, he will get undefined).
    this.entityRecords.delete(entity.getId());
  }

  /*
  public createId(entity: Entity): EntityId
  {
    this.commonAddEntityChecks(entity);

    ASSERT_FATAL(entity.getId() === null,
      "Attempt to create id for entity " + entity.getErrorIdString()
      + " which already has an id");

    let id = this.generateId(entity);

    this.idMustNotExist(id);

    // Entity remembers it's own id.
    entity.setId(id);

    // Insert id to hashmap under it's string id.
    this.ids.set(id.getStringId(), id);

    return id;
  }

  public register(id: EntityId)
  {
    if (!ASSERT(this.ids.has(id.getStringId()) === false,
      "Attempt to register id '" + id.getStringId() + "'"
      + " that is already registered in IdProvider"))
      return;

    // Insert id to hashmap.
    this.ids.set(id.getStringId(), id);
  }
  */

  // Returns entity proxy matching given id.
  // Returns undefined if entity doesn't exist in EntityManager.
  public get(id: string): Entity
  {
    return this.entityRecords.get(id).getEntityProxy();
  }

  // Check if entity exists in EntityManager.
  public has(id: string): boolean
  {
    return this.entityRecords.has(id);
  }

  // --------------- Private methods -------------------

  /*
  private generateId(entity: Entity): EntityId
  {
    // Increment lastIssuedId first so we start with 1 (initial value is 0).
    this.lastIssuedId++;

    let stringId = this.generateStringId();
    let id = new EntityId(stringId, entity);

    return id;
  }

  private idMustNotExist(id: EntityId)
  {
    // Id must not already exist.
    //   This should never happen, because ids are issued sequentionaly within
    // a single boot and each id contains boot timestamp in it. So the only way
    // two ids could be identical is to launch two instances of the server
    // in exactly the same milisecond.
    //   It means that if this happened, you have probably duplicated some
    // objects somewhere.
    ASSERT_FATAL(this.ids.has(id.getStringId) === false,
      "Attempt to add id (" + id.getStringId + ") that already"
      + " exists in IdProvider");
  }

  private commonAddEntityChecks(entity: Entity)
  {
    ASSERT_FATAL(entity !== null && entity !== undefined,
      "Attempt to add 'null' or 'undefined' entity to entityManager");

    ASSERT_FATAL(NamedClass.CLASS_NAME_PROPERTY in entity,
      "Attempt to add entity to entityManager that is not inherited from"
      + " class Entity");

    ASSERT_FATAL(Entity.ID_PROPERTY in entity,
      "Attempt to add entity to entityManager that is not inherited from"
      + " class Entity");
  }
  */
}

// ---------------------- private module stuff -------------------------------

class EntityRecord
{
  public entity = null;
  public entityProxy = null;

  // There can be more than one handler assigned to the entity.
  // It happens for example when player quits the game and logs
  // back in. If someone still has a reference to player's entity
  // proxy and tries to access it now, proxy handler will ask
  // EntityManager if its referenced entity exists. If it does,
  // entity reference in the old proxy handler will get updated.
  // But this means that more than one reference to entity will
  // exist from that time on, becuase a new handler has been created
  // for the new instance of entity (when the player logged back in).
  //   In order for EntityManager to be able to invalidate all references
  // to entity when the player quits again, it needs to remember all
  // existing not invalidated handlers (then the handler is invalidated,
  // its reference can be safely forgotten).
  public proxyHandlers = new Array<EntityProxyHandler>();

  // ---------------- Public methods --------------------

  public getEntity()
  {
    ASSERT(this.entity !== null,
      "Invalid entity reference in entity record in EntityManager");

    return this.entity;
  }

  public getEntityProxy()
  {
    ASSERT(this.entityProxy !== null,
      "Invalid entity proxy reference in entity record in EntityManager");

    return this.entityProxy;
  }

  public invalidate()
  {
    // Setting our internal variables to null is probably not
    // needed, because whole record will get removed from
    // EntityManager right after invalidate() is called, but
    // better be sure.
    this.entity = null;
    this.entityProxy = null;

    // This, on the other hand, IS needed. All existing references
    // to entity need to be invalidated.
    for (let handler of this.proxyHandlers)
    {
      handler.invalidate();
    }
  }
}