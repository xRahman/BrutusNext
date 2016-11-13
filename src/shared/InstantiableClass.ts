/*
  Part of BrutusNEXT

  Class that can instantiate even its non-primitive properties.
*/

/*
  Implementation notes:
  
  Prototype inheritance in Javascript is broken when it comes
  to non-primitive properties. When an instance of a class is created,
  only references to non-primitive properties are given to it. This
  means that if any instance chances something on it's non-primitive
  property (like entity.data.x = 13), the change will happen on class
  prototype rather than on instance and thus affect ALL instances.

  To prevent this, we recursively instantiate all non-primitive properties
  of dynamic classes (= of those classes that we dynamically instantiate
  in runtime) with empty objects inherited from the corresponding properties
  on class prototype (this is possible, because in javascript any object
  can be a prototype, not just a class) using Object.create() function.

  The result is, that when someone tries to write to any property, no matter
  how deep in the structure, prototype inheritance will actually work, because
  it's either a primitive property and javascript native inheritance mechanism
  kicks in, because every object withing the structure has it's prototype
  object, or it's a non-primitive object, in which case it's ok to just
  create it, because there is no corresponding obect on the class prototype
  (the instance will have some extra properties which are not on prototype).
  
   javascript Proxies that trap setting values to their
  properties. When someone tries to set something on such object,
  proxy handler (= this class) will first check if this property
  is properly instantiated and it will create it's instance if it's not.
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';
import {AttributableClass} from '../shared/AttributableClass';

export class InstantiableClass extends AttributableClass
{
  /*
  constructor()
  {
    super();
    this.instantiateProperties();
  }
  */

  // ---------------- Public methods --------------------

  public instantiateProperties()
  {
    // In javascript, constructor of the class is the class,
    // so 'this.constructor' is the class of this instance.
    // 'this.constructor.prototype' is the prototype object
    // of that class.
    let prototype = this.constructor.prototype;

    // Recursively instantiate non-primitive properties of this instance.
    this.instantiate(this, prototype);
  }

  // --------------- Private methods --------------------

  // Ensures that all non-primitive properties of 'prototype'
  // are instantiated on 'object'. 
  private instantiate(object: any, prototype: any)
  {
    // Instantiate all properties, including those on prototype.
    for (let property in object)
      this.instantiateProperty(object, prototype, property); 
  }

  // Recursively creates a proxified empty object (using Object.create())
  // for given 'property' of 'object'.  
  private instantiateProperty(object: any, prototype: any, property: string)
  {
    if (prototype === undefined || prototype === null)
    {
      ERROR("Invalid prototype object");
      return;
    }

    // There is no point of instantating properties that don't have any
    // real value.
    if (prototype[property] === undefined || prototype[property] === null)
      return;

    // Primitive properties (numbers, strings, etc) don't have to
    // be instantiated, because javascript prototype inheritance
    // instantiates them automatically when necessary (it only
    // doesn't work for non-primitive properties).
    if (typeof object[property] !== 'object')
      return;

    // This check allows re-instantiating of properties of existing
    // instance when prototype is changed. Properties that already
    // are instantiated (they are 'own' properties of object) are
    // not overwritten.
    if (!object.hasOwnProperty(property))
      // Object.create() will create a new {}, which will have
      // 'prototypeProperty' as it's prototype.
      object[property] = Object.create(prototype[property]);

    // Property we have just instantiated may have it's own
    // non-primitive properties that also need to be instantiated.
    //   Note that recursive call is done even for properties that
    // have already been instantiated on 'object', because there
    // still may be some changes deeper in the structure).
    this.instantiate(object[property], prototype[property]);
  }
}
