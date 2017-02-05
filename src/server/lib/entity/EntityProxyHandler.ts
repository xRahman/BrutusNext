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

import {ERROR} from '../../../server/lib/error/ERROR';
import {FATAL_ERROR} from '../../../server/lib/error/FATAL_ERROR';
import {Entity} from '../../../server/lib/entity/Entity';
import {InvalidValueProxyHandler}
  from '../../../server/lib/entity/InvalidValueProxyHandler';
import {Server} from '../../../server/lib/Server';
import {AdminLevel} from '../../../server/lib/admin/AdminLevel';
import {Syslog} from '../../../server/lib/log/Syslog';
import {Message} from '../../../server/lib/message/Message';

// Module 'util' is included, because we have to trap util.inspect
// call to preserve it's functionality.
const util = require('util');

export class EntityProxyHandler
{
  // Reference to an entity we are proxyfying.
  // If this is null, all access to entity properties will be logged
  // as invalid and 'invalid variable' will be returned if properties
  // are read or methods are called.
  public entity: Entity = null;

  // Id of an entity we are proxyfying.
  public id: string = null;

  /*
  // Type (className) of an entity we are proxyfying.
  public type: string = null;
  */

  // ---------------- Public methods --------------------

  public invalidate()
  {
    this.entity = null;

    // Note: Doing 'this.id = null;' here would be a really bad idea,
    //   because we could hardly reclaim the reference to the entity later
    //   if we forgot it's id.
    // Update:
    //   Reclaiming of existing reference is deprecated now, but there is
    //   still no reason to invalidate internal id reference so better not
    //   do it.
  }

  /*
  public loadFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    path: string
  )
  {
    this.id = jsonObject.id;
    this.type = jsonObject.type;

    ASSERT(this.id !== undefined && this.id !== null,
      "Invalid 'id' when loading entity reference"
      + " '" + propertyName + "' from JSON file "
      + path);

    ASSERT(this.type !== undefined && this.type !== null,
      "Invalid 'type' when loading entity reference"
      + " '" + propertyName + "' from JSON file "
      + path);

    // Set this.entity to null.
    this.invalidate();
  }
  */

  // If this.entity is not null, it's 'id variable will be compared
  // to handler's 'id' variable.
  // -> Returns false if anything is amiss.
  public sanityCheck(): boolean
  {
    if (this.id === null || this.id === undefined || this.id === "")
      return false;

    // If entity doesn't exist yet, there is no point in checking
    // it's id - we consider handler to be valid.
    if (this.entity === null)
      return true;

    if (this.entity.getId() !== this.id)
    {
      ERROR("Id of entity " + this.entity.getErrorIdString()
        + " differs from id in entity proxy handler"
        + " (which is " + this.id + ")");

      return false;
    }

    return true;
  }

  // -------------------  Traps -------------------------
  /// Note: It's possible that it will be necessary to implement some
  ///   of commented-out handlers in the future, so I'll let them be here.

  // A trap for Object.getPrototypeOf.
  // (This is triggered when instanceof operator is used on the proxy.)
  public getPrototypeOf(target: any)
  {
    ///console.log("getPrototypeOf(target)");

    if (this.isEntityValid() === false)
      return {};
    
    return Object.getPrototypeOf(this.entity);
  }

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

  // A trap for Object.getOwnPropertyDescriptor.
  // (This is trapped in order to 'hasOwnProperty()' to work)
  public getOwnPropertyDescriptor(target: any, property: any)
  {
    // Does the referenced entity exist?
    if (this.isEntityValid() === false)
    {
      Syslog.log
      (
        "Attempt to call 'getOwnPropertyDescriptor()' function on"
          + " an invalid entity\n"
          + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
        Message.Type.INVALID_ACCESS,
        AdminLevel.IMMORTAL
      );

      // Invalid entity doesn't have any properties (it's value is null),
      return undefined;
    }

    return Object.getOwnPropertyDescriptor(this.entity, property);
  }

  //// A trap for Object.defineProperty.
  //public defineProperty(target)
  //{
  //}

  // A trap for the in operator.
  // (But not for: 'for .. in' operator - that's not possible to trap). 
  public has(target: any, property: any): boolean
  {
    // Does the referenced entity exist?
    // (isEntityValid() updates this.entity if it's possible)
    if (this.isEntityValid() === false)
    {
      Syslog.log
      (
        "Attempt to use 'in' operator on an invalid entity\n"
          + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
        Message.Type.INVALID_ACCESS,
        AdminLevel.IMMORTAL
      );

      // Invalid entity doesn't have any properties (it's value is null),
      // so 'in' operator will always return false in this case.
      return false;
    }

    ///return property in this.entity;
    return Reflect.has(this.entity, property);
  }

  /// Tohle zjevně nefunguje.
  /*
  // A trap for the 'hawOwnProperty()' function.
  public hasOwn(target: any, property: any): boolean
  {
    // Does the referenced entity exist?
    // (isEntityValid() updates this.entity if it's possible)
    if (this.isEntityValid() === false)
    {
      Syslog.log
      (
        "Attempt to call 'hasOwnProperty()' function on an invalid entity\n"
          + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
        Message.Type.INVALID_ACCESS,
        AdminLevel.IMMORTAL
      );

      // Invalid entity doesn't have any properties (it's value is null),
      // so 'hasOwnProperty()' will always return false in this case.
      return false;
    }

    return this.entity.hasOwnProperty(property);
  }
  */


  // A trap for getting property values.
  public get(target: any, property: any)
  {
    // This HACK is needed to circumvent HACK in implementation of
    // async functions.
    //   When an async function returns value, it tries to acces 'then'
    // property of return value - probably to determine if return value
    // is a Promise and promisify it if it's isn't.
    //   If the return value is an entity proxy, it will trap this access
    // and because 'then' property usually doesn't exist on entities, it
    // would be reported as access to nonexisting property.
    //   For the same reason then() method exists in Entity to ensure
    // that it's not ever declared.
    if (property === 'then')
      return undefined;

    // 'isProxy' property can be used for debugging to test if reference
    //  is a proxy.
    //    Value of 'isProxy' will be 'undefined' if reference isn't a proxy).
    if (property === 'isProxy')
      return true;

    ///console.log("get(): " + property);

    // Note:
    // When a function property access is trapped, only a function
    // property is returned (like 'return this.dynicamCast;', not
    // 'return this.dynamicCast();').
    //   Fucntion will be called by whoever reuqested the property.

    // Trap calls of entity.isValid() method.
    if (property === 'isValid')
    {
      ///console.log("EntityProxyHandler.get() trapped 'isValid'");

      /// Prozatím nepůjde "oživit" mrtvou referenci.
      /*
      // Entity reference is updated when someone asks if
      // it's valid to provide them with up-to-date info.
      if (this.entity === null)
        this.updateEnityReference();
      */

      return this.isEntityValidTrapHandler;
    }

    // Trap calls of entity.isEtity() method.
    if (property === 'isEntity')
    {
      // Note:
      //   'variable.isEntity' is tested by SaveableObject to
      // determine if property should be saved as a reference
      // rather then directly. This is true even for invalid
      // references - that's why we always return 'true' here.
      return true;
    }

    /// Prozatím entity.load() úplně disabluju.
    /*
    // Trap calls of entity.load() method.
    if (property === 'load')
      return this.loadTrapHandler;
    */

    // This is an awful hack I'd very much liked to not to use...
    // But it's necessary in orderd for function trapping to work.
    //   The reason is, that when you trap a function call, like
    // 'proxy.dynamicCast()', it gets split in two parts:
    // - first the property 'dynamicCast' is accessed
    // - then it is called
    // So all we can do in the first step is to return a reference
    // to function, we can't call it ourseves. The problem is,
    // that when it is called, it's 'this' will be proxy, not
    // proxy handler - so there won't be any this.entity on it.
    //   That's why '_internalEntity' property must be trapped as well,
    // so it can be accessed in subsequent function call (it's not named
    // 'entity' but rather '_internalEntity' to prevent using it by accident).
    // (see EntityProxyHandler.dynamicCast() for example of such function).
    if (property === '_internalEntity')
      return this.entity;

    // This is the same case as with '_internalEntity' trap above.
    // It's an ugly hack but, unfortunatelly, necessary one.
    if (property === '_proxyHandler')
      return this;

    // Trap calls of entity.dynamicTypeCheck() method.
    if (property === 'dynamicTypeCheck')
      return this.dynamicTypeCheckTrapHandler;

    // Trap calls of entity.dynamicCast() method.
    if (property === 'dynamicCast')
      return this.dynamicCastTrapHandler;

    // Does the referenced entity exist?
    // (isEntityValid() updates this.entity if it's possible)
    if (this.isEntityValid() === false)
    {
      // This happens when printing out stack trace when accessing invalid
      // variable. Properties are scanned, which would lead to spam
      // to syslog with missleading information. Returning empty function
      // prevents such spam).
      if (property === 'constructor')
        return function() { };

      // If someone calls 'inspect' on us.
      // (It happens when utils.inspect() is used.)
      if (property === 'inspect')
        return function() { return "<InvalidEntity>"; }

      Syslog.log
      (
        "Attempt to read property '" + property + "' of an invalid entity\n"
          + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
        Message.Type.INVALID_ACCESS,
        AdminLevel.IMMORTAL
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
      Syslog.log
      (
        "Attempt to write to property '" + property + "'"
        + " of an invalid entity\n"
        + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
        Message.Type.INVALID_ACCESS,
        AdminLevel.IMMORTAL
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
  //  console.log(">> EntityProxyHandler.ownKeys() launched");
  //
  //  return Object.getOwnPropertyNames(this.entity);
  //}

  //// A trap for a function call.
  //public apply(target, thisArg, argumentsList)
  //{
  //}

  //// A trap for the new operator.
  //public construct(target)
  //{
  //}

  /// DO NOT USE THIS. It has been deprecated in ES7
  //public enumerate(target: any): any
  //{
  //}

  // --------------- Private methods -------------------

  private readProperty(property: string)
  {
    if (this.entity['isProxy'] === true)
    {
      FATAL_ERROR("Internal entity reference is a proxy."
        + " It must be an unproxied reference");
    }

    // If someone calls 'inspect' on us.
    // (This happens when utils.inspect() is used.)
    if (property === 'inspect')
    {
      return function()
      {
        // When the inspect function will be called, 'this'
        // won't be EntityHandler but entity proxy, so this.entity
        // would be undefined (entity doesn't have property 'entity'
        // on it. So we need to get handler.entity by trapping
        // access to '_internalEntity' property);
        let internalEntity = this['_internalEntity'];

        return util.inspect(internalEntity);
      }
    }

    let value = this.entity[property];

    /// This is probably not such a good idea. It would prevent
    /// checking if a property exist on an instance (because if
    //  it didn't exist, reading it would be reported as error).
    /*
    // Are we accessing a valid property?
    if (value === undefined)
    {
      Syslog.log
      (
        "Attempt to read an undefined property '" + property + "'"
          + " of entity " + this.entity.getErrorIdString() + "\n"
          + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER_PLUS_ONE),
        Message.Type.INVALID_ACCESS,
        AdminLevel.IMMORTAL
      );

      // 'invalidVariable' that traps all access to it and reports
      // it as invalid.
      return InvalidValueProxyHandler.invalidVariable;
    }
    */

    return value;
  }

  private isEntityValid(): boolean
  {
    if (this['isProxy'] === true)
    {
      FATAL_ERROR("Validity check is run on entity proxy"
        + " rather than on entity proxy handler. Make sure"
        + " that you use isEntityValidTrapHandler() instead"
        + " of isEntityValid() when you return property from"
        + " property access trap handlers");
    }

    if (this.id === null)
      return false;

    if (this.entity === null)
    {
      // Entity validity is not updated on each property access,
      // it is only updated on 'isValid()' call. This way you will
      // get error message if you try to access invalid entity
      // reference without calling 'isValid()' first.
      return false;
    }

    return true;
  }

  /// Prozatím nepůjde "oživit" mrtvou referenci.
  /*
  // Requests current reference to entity from Server.entityManager
  // and updates this.reference with a new value.
  //   Returns false if entity is unavailable.
  private updateEnityReference(): boolean
  {
    if (this.id === null)
    {
      /// Nejsem si jistej, jestli je správně, aby tohle byl error,
      /// ale nejspíš jo.
      ERROR("Attempt to update entity reference of proxy handler with"
        + " null id");

      // If we don't have a string id, there is no way we can
      // update our entity reference.
      return false;
    }

    let entity = Server.entityManager.updateReference(this);

    if (entity !== undefined)
    {
      // Update our internal reference if entity does exist.
      this.entity = entity;

      return true;
    }

    return false;
  }
  */

  // ------------ Private trap handlers ----------------

  // IMPORTANT:
  //   These functions are called from handlers trapping
  // property access. Keep in mind that it means that their
  // 'this' is not an EntityProxyhandler but rather a Proxy
  // on which the access is trapped.

  private dynamicCastTrapHandler<T>(type: { new (...args: any[]): T })
  {
    // Note: When this function is called, 'this' is not an
    // EntityProxyHandler, but the proxy. So 'dynamicTypeCheck'
    // property access must be trapped in order for this call
    // to work.
    this['dynamicTypeCheck'](type);

    return <any>this;
  }

  private dynamicTypeCheckTrapHandler<T>(type: { new (...args: any[]): T })
  {
    // Note: When this function is called, 'this' is not an
    // EntityProxyHandler, but the proxy. So '_internalEntity'
    // property access must be trapped in order for this to work.
    let internalEntity = this['_internalEntity'];

    if (internalEntity === undefined)
    {
      ERROR("Undefined internal entity reference in entity proxy handler."
       + " This is not supposed to ever happen so I don't have any hints"
       + " about possible cause, sorry");
       return false;
    }

    if (internalEntity === null)
    {
      ERROR("Invalid internal entity reference in entity proxy handler."
        + " Make sure you check entity.isValid() before you call"
        + " entity.dynamicTypeCheck() or entity.dynamicCast()");
        return false;
    }

    // Dynamic type check - we make sure that entity is inherited from
    // requested class (or an instance of the class itself).
    if (!(internalEntity instanceof type))
    {
      FATAL_ERROR("Type cast error: Newly created entity of type"
        + " '" + internalEntity.className + "' is not an instance of"
        + " requested type (" + type.name + ")");

      return false;
    }

    return true;
  }

  private isEntityValidTrapHandler(): boolean
  {
    // Note: When this function is called, 'this' is not an
    // EntityProxyHandler, but the proxy. So '_proxyHandler'
    // property access must be trapped in order for this to work.
    let proxyHandler = this['_proxyHandler'];

    return proxyHandler.isEntityValid();
  }

  /// Prozatím entity.load() úplně disabluju.
  /*
  // This method allows invalid entity proxy to load itself.
  //   'entity.load()' call is trapped by 'get' handler and
  //  handler.load() (this method) is called).
  private async loadTrapHandler()
  {
    // Note: When this function is called, 'this' is not an
    // EntityProxyHandler, but the proxy. So '_proxyHandler'
    // property access must be trapped in order for this to work.
    let proxyHandler = this['_proxyHandler'];
    let id = proxyHandler.id; 

    if (id === null || id === undefined)
    {
      ERROR("Missing or invalid id in entity proxy handler."
        + " Entity is not loaded");
      return;
    }

    // Note: We are intentionally passing the proxy as parameter
    //   (by passing 'this'). It will be needed in order to add
    //   a record to EntityManager without creating a new proxy
    //   (that would also be possible, but it would create another
    //   reference pointing to the same entity, so it's better to
    //   reuse existing reference).
    // However, typescript doesn't know that 'this' is not an
    // EntityProxyHandler, so we have to typecast 'this' to <any>
    // to bypass incorrect type check.
    await Server.entityManager.loadExistingEntityProxy
    (
      proxyHandler,
      <any>this
    );
  }
  */
}