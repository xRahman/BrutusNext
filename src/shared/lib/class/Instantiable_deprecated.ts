/*
  Part of BrutusNEXT

  Class that can instantiate even its non-primitive properties.
*/

/*
  Implementation notes:
  
  Prototype inheritance in Javascript is broken when it comes to
  non-primitive properties. When an instance of a class is created,
  only references to non-primitive properties are given to it, not
  their instances. This means that if any instance chances something
  on it's non-primitive property (like entity.data.x = 13), the change
  will happen on class prototype rather than on instance and will thus
  affect ALL instances.

  To prevent this, we recursively instantiate all non-primitive properties
  of dynamic classes (= of those classes that we dynamically instantiate
  in runtime) with empty objects inherited from the corresponding property
  on class prototype (this is possible, because in javascript any object
  can be a prototype, not just a class) using Object.create() function.

  The result is, that when someone tries to write to any property, no matter
  how deep in the structure, prototype inheritance will actually work, because
  it's either a primitive property and javascript native inheritance mechanism
  kicks in, or it's a non-primitive object, in which case it's ok to just
  create it, because there is no corresponding obejct on the class prototype
  (the instance will have some extra properties which are not on prototype).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Attributable} from '../../../shared/lib/class/Attributable';

export class Instantiable extends Attributable
{
  /// Nad tímhle zrovna dumám...
  /*
  public static get PROTOTYPE_PROPERTY() { return 'prototype'; }
  */

  //------------------ Private data ---------------------

  /// Nad tímhle zrovna dumám...
  /*
  // Value is 'className' (if the prototype is a hardcoded class)
  // or 'id' (if the prototype is an entity).
  private prototype: string = null;
  */


  // ---------------- Public methods --------------------

  /*
  public static createInstance(prototypeObject: Instantiable)
  {

  }
  */

  /*
  public instantiateProperties()
  {
    // In javascript, constructor of the class is the class,
    // so 'this.constructor' is the class of this instance and
    // 'this.constructor.prototype' is the prototype object of
    // that class.
    let prototype = this.constructor.prototype;

    // Recursively instantiate non-primitive properties of this
    // instance.
    this.instantiate(this, prototype);
  }

  // --------------- Private methods --------------------

  // Ensures that all non-primitive properties of 'prototype'
  // are instantiated on 'object'. 
  private instantiate(object: any, prototype: any)
  {
    for (let property in object)
      this.instantiateProperty(object, prototype, property); 
  }

  // Ensures that if 'property' of 'object' is non-primitive,
  // it is recursively instantiated as an empty Object inherited
  // from the respective 'property' on 'prototype' object.
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
    // be instantiated because Javascript prototype inheritance
    // handles them correctly.
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
  */
}
