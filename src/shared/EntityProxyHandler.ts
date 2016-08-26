/*
  Part of BrutusNEXT

  Impements handler of javascript Proxy object that is used instead of
  entities.
*/

/*
  IMPORTANT:
    Never use this yourself! Always request new entities from EntityManager.
  They will be proxified for you automatically.
*/

/*
  How does it work:
    Handler is a class that implemets traps - special functions
  (get, set, etc.) which all called whenever a Proxy object is accessed.
  So because we use 'new Proxy(handler)' instead of 'new Entity()', we
  are able to trap any access to entity properties.

  This is used to "trap" access to deleted entity, so instead of just
  throwing type error or something like that (and crashing the server along
  the way), we report this event to syslog and return another Proxy object,
  which serves as 'invalid value' variable (it traps all access to this
  variable and reports it as invalid).

*/

'use strict';

import {getTrimmedStackTrace} from '../shared/UTILS';
import {ASSERT} from '../shared/ASSERT';
import {Entity} from '../shared/Entity';
import {InvalidValueProxyHandler} from '../shared/InvalidValueProxyHandler';
import {Server} from '../server/Server';
import {AdminLevels} from '../server/AdminLevels';
import {Mudlog} from '../server/Mudlog';

export class EntityProxyHandler
{
  // Reference to an entity we are proxyfying.
  // If this is null, all access to entity properties will be logged
  // as invalid and 'invalid variable' will be returned if properties
  // are read or methods are called.
  public entity: Entity = null;

  // Id of an entity we are proxyfying.
  public id: string = null;

  // Type (className) of an entity we are proxyfying.
  public type: string = null;

  // ---------------- Public methods --------------------

  public invalidate()
  {
    this.entity = null;

    /// Tohle je asi blbost. Těžko můžu obnovit referenci,
    /// když zapmenu idčko.
    ///this.id = null;
  }

  /*
  public loadFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    filePath: string
  )
  {
    this.id = jsonObject.id;
    this.type = jsonObject.type;

    ASSERT(this.id !== undefined && this.id !== null,
      "Invalid 'id' when loading entity reference"
      + " '" + propertyName + "' from JSON file "
      + filePath);

    ASSERT(this.type !== undefined && this.type !== null,
      "Invalid 'type' when loading entity reference"
      + " '" + propertyName + "' from JSON file "
      + filePath);

    // Set this.entity to null.
    this.invalidate();
  }
  */

  // If this.entity is not null, it's 'id' and 'className'
  // variables will be compared to handler's 'id' and 'type'
  // variables.
  // -> Returns false if anything is amiss.
  public sanityCheck(): boolean
  {
    if (this.entity === null)
      return true;

    let checkResult = true;

    let id = this.entity.getId();

    if (id !== null && this.id !== null)
    {
      if (!ASSERT(id === this.id,
          "Id of entity " + this.entity.getErrorIdString()
          + " differs from id saved in entity proxy handler"
          + " (which is " + this.id + ")"))
        checkResult = false;
    }

    let type = this.entity.className;

    if (type !== null && this.type !== null)
    {
      if (!ASSERT(id === this.type,
          "Class name of entity " + this.entity.getErrorIdString()
          + " differs from type saved in entity proxy handler"
          + " (which is " + this.type + ")"))
        checkResult = false;
    }

    return checkResult;
  }

  // -------------------  Traps -------------------------
  /// Note: It's possible that it will be necessary to implement some
  ///   of commented-out handlers in the future, so I'll let them be here.

  //// A trap for Object.getPrototypeOf.
  //public getPrototypeOf(target)
  //{
  //}

  //// A trap for Object.setPrototypeOf.
  //public setPrototypeOf(target)
  //{
  //}

  //// A trap for Object.isExtensible.
  //public isExtensible(target)
  //{
  //}

  //// A trap for Object.preventExtensions.
  //public preventExtensions(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyDescriptor.
  //public getOwnPropertyDescriptor(target)
  //{
  //}

  //// A trap for Object.defineProperty.
  //public defineProperty(target)
  //{
  //}

  //// A trap for the in operator.
  //public has(target)
  //{
  //}

  // A trap for getting property values.
  public get(target: any, property: any)
  {
    if (property === 'load')
      // TODO: Stejný popisek jako o if níže.
      return this.load;

    // This hack traps calls of entity.isValid() method.
    if (property === 'isValid')
      // Here we don't return this.isEntityValid() but the function
      // itself. That's because if function call is trapped by proxy
      // handler, first the function is requested by 'get' trap and
      // than the returned function is called. It means that someone
      // else will call the function we return here, we are not supposed
      // to call it ourselves.
      return this.isEntityValid;

    // Does the referenced entity exist?
    // (isEntityValid() updates this.entity if it's possible)
    if (this.isEntityValid() === false)
    {
      Mudlog.log
      (
        "Attempt to read property '" + property + "' of an invalid entity\n"
        + getTrimmedStackTrace(),
        Mudlog.msgType.INVALID_ENTITY_ACCESS,
        AdminLevels.IMMORTAL
      );

      // 'InvalidValueProxyHandler.invalidVariable' is a function proxy,
      // so it is callable.
      //
      // Explanation:
      //   It is not possible to directly trap a method call on entity.
      // When a method is called, property with it's name is acccessed first
      // and than it's called as a function.
      //   So here we are trapping any property access (including methods)
      // and we return another proxy, which proxifies a function object, so
      // it's callable. Calling 'invalidVariable()' is then trapped by this
      // function proxy and reported as invalid.
      //   'invalidVariable' proxy also traps all normal property access,
      // so it will also report if you try to read or write to some of it's
      // properties.
      return InvalidValueProxyHandler.invalidVariable;
    }

    return this.readProperty(property);
  }

  // A trap for setting property values.
  public set(target: any, property: any, value: any, receiver: any): boolean
  {
    // Note:
    //   At the moment, writing to a nonexisting property is allowed
    // (it will be created by doing it). If it should ever get forbidden,
    // here is the place to do it.

    // Does the referenced entity exist?
    // (isEntityValid() updates this.entity if it's possible)
    if (this.isEntityValid() === false)
    {
      Mudlog.log
      (
        "Attempt to write to property '" + property + "'"
        + " of an invalid entity\n"
        + getTrimmedStackTrace(),
        Mudlog.msgType.INVALID_ENTITY_ACCESS,
        AdminLevels.IMMORTAL
      );

      // Return value of 'set' trap noramlly indicates if writing succeeded.
      // We are not, however, going to return false on failure, because that
      // would throw a TypeError exception, which is exactly what we are trying
      // to prevent here.
      //   The purpose of proxyfying all entities is to report errors ourselves
      // and handle them in such a way that they won't crash the game.
      return true;
    }

    // All checks passed ok, let's write the value to the property.
    this.entity[property] = value;

    return true;
  }

  //// A trap for the delete operator.
  //public deleteProperty(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyNames.
  //public ownKeys(target)
  //{
  //}

  //// A trap for a function call.
  //public apply(target, thisArg, argumentsList)
  //{
  //}

  //// A trap for the new operator.
  //public construct(target)
  //{
  //}

  // --------------- Private methods -------------------

  private readProperty(property: string)
  {
    let value = this.entity[property];

    // Are we accessing a valid property?
    if (value === undefined)
    {
      Mudlog.log
      (
        "Attempt to read an undefined property '" + property + "'"
        + "of entity " + this.entity.getErrorIdString(),
        Mudlog.msgType.INVALID_PROPERTY_ACCESS,
        AdminLevels.IMMORTAL
      );

      // 'invalidVariable' that traps all access to it and reports
      // it as invalid.
      return InvalidValueProxyHandler.invalidVariable;
    }

    return value;
  }

  private isEntityValid(): boolean
  {
    ASSERT(this.id !== null,
      "Null stringId in EntityProxyHandler");

    if (this.entity === null)
    {
      // If we don't have a valid entity reference, we will
      // ask EntityManager if the entity exists (this can
      // happen for example if player quits - so our reference
      // is set to null - and then logs back again. In that case
      // our reference to entity is still null but entity exists
      // in entityManager, so we have to ask for it).
      return this.updateEnityReference();
    }

    return true;
  }

  // Requests current reference to entity from Server.entityManager
  // and updates this.reference with a new value.
  //   Returns false if entity is unavailable.
  private updateEnityReference(): boolean
  {
    if (this.id === null)
      // If we don't have a string id, there is no way we can
      // update our entity reference.
      return false;

    //let entity = Server.entityManager.get(this.id);
    let entity = Server.entityManager.updateReference(this.id, this);

    if (entity !== undefined)
    {
      // Update our internal reference if entity does exist.
      this.entity = entity;

      return true;
    }

    return false;
  }

  // This method allows invalid entity proxy to load itself.
  //   'entity.load()' call is trapped by 'get' handler and
  //  handler.load() (this method) is called).
  private async load()
  {
    /// Idčko může být null - např. při loadu worldu.

    /// TODO

    /*
    /// TODO: Zkonstruovat saveFileName
    /// - blbost, to asi nebudu potřebovat, to umí entita sama v rámci své
    ///   metody load().
    */

    /// TODO: Říct si EntityManageru o novou entitu
    /// - tady bacha: Pokud mám idčko, tak je to ok, ale pokud nemám,
    ///   tak nemám jak zkontrolovat, že neloaduju něco, co už loadnuté je.
    /// - asi jediná možnost bude, zkontrolvoat to až po loadu - což ale
    ///   nejspíš může udělat EntityManager sám (vyrobí si entitu, loadne ji,
    ///   checkne, že ještě není v manageru a když ne, tak k ní vyrobí proxy
    //    a tu vrátí).

    /// TODO: Load this new entity using it's load() method.

    await Server.entityManager.loadEntity(this);
  }
}