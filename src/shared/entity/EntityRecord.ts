/*
  Part of BrutusNEXT

  Implements record of a single entity proxy reference used by EntityManager.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Entity} from '../../shared/entity/Entity';
import {EntityProxyHandler} from '../../shared/entity/EntityProxyHandler';

export class EntityRecord
{
  /*
  public entity = null;
  */
  public entityProxy = null;
  public proxyHandler = null;

  /*
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
  */

  constructor
  (
    /* entity: Entity, */
    entityProxy: Entity,
    handler: EntityProxyHandler
  )
  {
    /*
    this.entity = entity;
    */
    this.entityProxy = entityProxy;
    this.proxyHandler = handler;

    /*
    this.addHandler(handler);
    */
  }

  // ---------------- Public methods --------------------

  /*
  public updateProxyHandlers(entity: Entity)
  {
    for (let handler of this.proxyHandlers)
    {
      if (handler.id !== entity.getId())
      {
        ERROR("One of proxy handlers of entity"
          + " " + entity.getErrorIdString() + " has"
          + " different id (" + handler.id + ")."
          + " setting it's id to " + entity.getId());
        handler.id = entity.getId();
      }

      handler.entity = entity;
    }
  }
  */

  /*
  public addHandler(handler: EntityProxyHandler)
  {
    if (!this.proxyHandlers.has(handler))
      this.proxyHandlers.add(handler);
  }
  */

  /*
  public getEntity()
  {
    if (this.entity === null)
      ERROR("Invalid entity reference in entity record in EntityManager");

    return this.entity;
  }
  */

  public getEntityProxy()
  {
    if (this.entityProxy === null)
    {
      ERROR("null entity proxy reference in entity"
        + " record in EntityManager");
    }

    return this.entityProxy;
  }

  public invalidate()
  {
    // This is the important part - set proxyHandler.entity to 'null'.
    this.proxyHandler.invalidate();

    // Setting our internal variables to null is probably not
    // needed, because whole record will get removed from
    // EntityManager right after invalidate() is called, but
    // better be sure.
    // (On the other hand by doing this will will get an error
    //  message when someone tries to access these variables so
    //  it's proably a good idea to do this)
    /*
    this.entity = null;
    */
    this.entityProxy = null;
    this.proxyHandler = null;

    /*
    // This, on the other hand, IS needed. All existing references
    // to entity need to be invalidated.
    for (let handler of this.proxyHandlers)
      handler.invalidate();
    */
  }
}