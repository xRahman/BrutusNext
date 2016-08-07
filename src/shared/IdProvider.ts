/*
  Part of BrutusNEXT

  Implements generator of unique ids.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Mudlog} from '../server/Mudlog';
import {EntityId} from '../shared/EntityId';
import {Entity} from '../shared/Entity';

export class IdProvider
{
  // Hashmap<[ string, EntityId ]>
  //   Key: string id
  //   Value: EntityId object
  private ids = new Map();

  constructor(private timeOfBoot: Date) { }

  // -------------- Public static data ------------------

  // ---------------- Public methods --------------------

  // Returns undefined if id doesn't exist.
  public get(stringId: string): EntityId
  {
    return this.ids.get(stringId);
  }

  public generateId
  (
    // Entity for which we are generating an id.
    entity: Entity
  )
  : EntityId
  {
    // Increment lastIssuedId first so we start with 1 (initial value is 0).
    this.lastIssuedId++;

    let stringId = this.generateStringId();

    // Here we are dynamically creating an instance of class
    // 'idClass' passed to us as parameter.
    let id = new EntityId(stringId, entity.className, entity);

    // Insert newly created EntityId object to hashmap.
    this.ids.set(stringId, id);

    return id;
  }

  public registerLoadedId(id: EntityId)
  {
    if (!ASSERT(this.ids.has(id.getStringId()) === false,
        "Attempt to register loaded id '" + id.getStringId() + "'"
        + " that is already registered in idProvider"))
      return;

    // Insert id to hashmap.
    this.ids.set(id.getStringId(), id);
  }

  // -------------- Protected class data ----------------

  // Number of issued ids in this boot.
  protected lastIssuedId = 0;

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
}