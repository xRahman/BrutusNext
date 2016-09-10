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

import {FATAL_ERROR} from '../shared/FATAL_ERROR';
import {NamedClass} from '../shared/NamedClass';
import {Entity} from '../shared/Entity';

export class IdProvider
{
  // -------------- Private class data -----------------

  // Number of issued ids in this boot.
  private lastIssuedId = 0;

  /*
  // Hashmap<[ string, EntityId ]>
  //   Key: string id
  //   Value: entityId
  // Note:
  //   When the only remaining reference to an object inside of WeakMap
  // is that within WeakMap itself, that object becomes a free target
  // for garbage collection.
  //   It means that dangling ids won't be source of memory leaks. On the
  // other hand it also means that ids (an entities as well) will only
  // be held in memory if there is another (not weak) reference to an id.
  // In other words when you remove an id from an idList, it may get
  // dellocated along with it's entity.
  ///private ids = new WeakMap();
  private ids = new Map();
  */

  constructor(private timeOfBoot: Date) { }

  // ---------------- Public methods --------------------

  private generateId()
  {
    if (this.timeOfBoot === null)
    {
      FATAL_ERROR("Uninicialized timeOfBoot in IdProvider."
        + " Unable to generate ids");
    }

    // Increment lastIssuedId first so we start with 1 (initial value is 0).
    this.lastIssuedId++;

    // String id consists of radix-36 representation of lastIssuedId
    // and a radix-36 representation of current boot timestamp
    // (in miliseconds from the start of computer age) separated by dash ('-').
    // (radix 36 is used because it's a maximum radix toString() allows to use
    // and thus it leads to the shortest possible string representation of id)
    return this.lastIssuedId.toString(36)
      + '-'
      + this.timeOfBoot.getTime().toString(36);
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

  // Returns undefined if id doesn't exist.
  public get(stringId: string): EntityId
  {
    return this.ids.get(stringId);
  }

  // Check if id exists.
  public has(stringId: string): boolean
  {
    return this.ids.has(stringId);
  }
  */

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

  private generateStringId()
  {
    // String id consists of radix-36 representation of lastIssuedId
    // and a radix-36 representation of current boot timestamp
    // (in miliseconds from the start of computer age) separated by dash ('-').
    // (radix 36 is used because it's a maximum radix toString() allows to use
    // and thus it leads to the shortest possible string representation of id)
    return this.lastIssuedId.toString(36)
      + '-'
      + this.timeOfBoot.getTime().toString(36);
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
