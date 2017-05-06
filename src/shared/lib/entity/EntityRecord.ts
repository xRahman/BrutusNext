/*
  Part of BrutusNEXT

  Implements record of a single entity proxy reference used by EntityManager.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityProxyHandler} from
  '../../../shared/lib/entity/EntityProxyHandler';

export class EntityRecord
{
  private entity: Entity = null;
  private proxyHandler = null;

  constructor
  (
    entity: Entity,
    handler: EntityProxyHandler
  )
  {
    this.entity = entity;
    this.proxyHandler = handler;
  }

  // ---------------- Public methods --------------------

  public getEntity()
  {
    if (this.entity === null)
      ERROR("'null' entity reference in entity record in EntityManager"
        + " You are probably accessing entity record after it has been"
        + " removed from EntityManager and invalidated");

    return this.entity;
  }

  public invalidate()
  {
    // This is the important part - set proxyHandler.entity to 'null'.
    //   It will free the entity for dealocation (because 'entity'
    // property in proxy handler should be the only reference to it)
    // (any future access to entity's properties will be reported
    //  by proxyHandler as error).
    this.proxyHandler.invalidate();

    // Setting our internal variables to null is probably not
    // needed, because whole record will get removed from
    // EntityManager right after invalidate() is called, but
    // better be sure.
    // (On the other hand by doing this will will get an error
    //  message when someone tries to access these variables so
    //  it's proably a good idea to do this)
    this.entity = null;
    this.proxyHandler = null;
  }
}