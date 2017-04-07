/*
  Part of BrutusNEXT

  Auxiliary class that stores information about
  hardcoded prototype class.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
import {Server} from '../../../server/lib/Server';
import {Entity} from '../../../server/lib/entity/Entity';

export class EntityPrototypeRecord extends SaveableObject
{
  public prototypeId = null;

  // The javascript object on which instances are based using
  // Object.create(). See PrototypeManager.createInstance().
  // Note: This property can't be named 'prototype' because
  // 'static prototype' property would refer to the javascript
  // prototype property so we wouldn't be able to set this property
  // as non-saveable. 
  public prototypeObject = null;
  // Do not save property 'prototypeObject'.
  private static prototypeObject = { isSaved: false };

  /// Pozn.: descendantIds a ancestorIds nemohou být u entity,
  ///        protože hardcoded classy nemají prototype entitu.

  // Ids of prototype entities that are inherited from this
  // prototype entity.
  // - We use ids instead of prototype names to allow easy changing of
  //   prototype names (you only have to change the name at one place
  //   because descendants reference their ancestor by it's id which
  //   doesn't change).
  // - Descendants are remembered because we want to be able to load
  //   protype entities recursively (starting with PrototypeManager,
  //   which holds hardcoded prototypes, which know their descendatns,
  //   and so on). Remembering only descendants wouldn't allow this.
  public descendantIds = [];

  /// Na vícenásobnou dědičnost se prozatím vykašlu - fightspecy a podobně
  /// nejspíš vyřeším přes attachování vzorců chování (které budou zděděné
  /// mezi sebou).
  /*
  // Ids of prototype entities this prototype entity is inherited
  // from.
  // - We use ids instead of prototype names to allow easy changing of
  //   prototype names (same as with descendantIds).
  // - TODO (proč je ancestorů víc a nějak to vymyslet s "mergnutým"
  //   prototypem - i když ten je asi odkazovaný přes prototypeId)
  public ancestorIds = [];
  */
  public ancestorId = null;

  // -> Returns 'undefined' if prototype object isn't found.
  public getPrototypeObject(prototypeId: string)
  {
    // Non-entity prototypes store their prototypeOject directly,
    // so we can just return it.
    if (this.prototypeObject !== null)
      return this.prototypeObject;

    // Prototype object of an entity prototype is an entity and
    // because all entities are stored in EntityManager, we need
    // to ask the manager for our prototype entity.
    let prototypeEntity = Server.entityManager.get(prototypeId, Entity);

    if (prototypeEntity === null || prototypeEntity === undefined)
    {
      ERROR("Failed to find prototype object because"
        + " entity with id '" + prototypeId + "' doesn't"
        + " exist in PrototypeManager. If this id is not"
        + " an etity id but a class name, it means that"
        + " prototypeObject in respective Prototype record"
        + " is not properly initialized");
      return undefined;
    }

    if (prototypeEntity.getId() !== prototypeId)
    {
      ERROR("Id of entity " + prototypeEntity.getErrorIdString
        + " provided by Entity manager differs from the requested"
        + " id (" + prototypeId + ")");
      return undefined;
    }

    return prototypeEntity;
  }
}
