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
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {IdProvider} from '../shared/IdProvider';
import {Entity} from '../shared/Entity';
import {EntityProxyHandler} from '../shared/EntityProxyHandler';

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

  // If 'id' loaded from JSON already exists in EntityManager,
  // existing entity proxy is returned. Otherwise an 'invalid'
  // entity proxy is created and returned.
  public loadReferenceFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    filePath: string
  )
  : Entity
  {
    ASSERT_FATAL(jsonObject.className === Entity.ENTITY_REFERENCE_CLASS_NAME,
      "Attempt to load entity reference from invalid JSON object");

    let id = jsonObject.id;

    ASSERT(id !== undefined && id !== null,
      "Invalid 'id' when loading entity reference"
      + " '" + propertyName + "' from JSON file "
      + filePath);

    let type = jsonObject.type;

    ASSERT(type !== undefined && type !== null,
      "Invalid 'type' when loading entity reference"
      + " '" + propertyName + "' from JSON file "
      + filePath);

    let entityRecord = this.entityRecords.get(id);

    // If an entity with this 'id' already exists in hashmap,
    // just return it's proxy.
    if (entityRecord !== undefined)
    {
      let entityProxy = entityRecord.entityProxy;

      ASSERT(entityProxy !== undefined && entityProxy !== null,
        "Invalid entity proxy in entity record of entity with id "
        + id);

      ASSERT(entityProxy.className === type,
        "Error while loading entity reference"
        + " '" + propertyName + "' from file "
        + filePath + ": Property 'type' saved"
        + " in JSON doesn't match type of existing"
        + " entity " + entityProxy.getErrorStringId()
        + " that matches id saved in JSON");

      return entityProxy;
    }

    // If entity with this 'id' doesn't exist yet, a new proxy will
    // be created and it's handler's reference to entity will be set
    // to null.
    // (When this proxy is accessed, it will automatically ask
    //  EntityManager if the entity is already awailable.)
    return this.createInvalidEntityProxy
    (
      propertyName,
      jsonObject,
      filePath
    );
  }

  // Adds an entity to the hashmap under it's id.
  //   If entity doesn't have an id, a new one will be generated,
  // otherwise it will be added under it's existing id.
  //   Returns entity proxy (which should be used instead of entity).
  public add(entity: Entity)
  {
    let id = entity.getId();

    // If entity doesn't have an id, a new one will be generated.
    if (id === null)
    {
      id = this.idProvider.generateId();
      entity.setId(id);
    }

    let handler = new EntityProxyHandler();
    let entityProxy = new Proxy({}, handler);
    let entityRecord = new EntityRecord(entity, entityProxy, handler);

    // Add newly created entity record to hashmap under entity's string id.
    this.entityRecords.set(id, entityRecord);

    return entityProxy;
  }

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
    entityRecord.addHandler(handler);

    // This will return an entity proxy.
    return entityRecord.getEntityProxy();
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

  private createInvalidEntityProxy
  (
    propertyName: string,
    jsonObject: any,
    filePath: string
  )
  : Entity
  {
    let handler = new EntityProxyHandler();

    // This also sets handler.entity to null.
    handler.loadFromJsonObject(propertyName, jsonObject, filePath);

    let entityProxy = new Proxy({}, handler);

    return entityProxy;
  }
}

// ---------------------- private module stuff -------------------------------

class EntityRecord
{
  public entity = null;
  public entityProxy = null;

  // Set<[ EntityProxyHandler ]>
  //   Value: javascript proxy object handler
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
  public proxyHandlers = new Set();

  constructor(entity: Entity, entityProxy: Entity, handler: EntityProxyHandler)
  {
    this.entity = entity;
    this.entityProxy = entityProxy;
    this.addHandler(handler);
  }

  // ---------------- Public methods --------------------

  public addHandler(handler: EntityProxyHandler)
  {
    if (!this.proxyHandlers.has(handler))
      this.proxyHandlers.add(handler);
  }

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