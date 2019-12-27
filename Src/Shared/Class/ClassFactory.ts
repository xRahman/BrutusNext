/*
  Part of BrutusNEXT
*/

/*
  Note:
    ClassFactory creates instances of typescript classes
    using 'Object.create()' rather than 'new'. It means
    that created instances are in fact empty objects with
    no own properties - all of their properties are inherited
    from the prototype object (which is an instance of requested
    class).
      ClassFactory also makes sure that prototypal inheritance
    works correcly event for nonprimitive properties by also
    instantiating them using Object.create() with the respective
    nonprimitive property on the prototype object as their
    prototype. This prevents modifying the prototype object
    when writing to the instance.
*/

import { ID, Serializable } from "../../Shared/Class/Serializable";
import { Types } from "../../Shared/Utils/Types";

// Key:   Class name.
// Value: Prototype instance that will be passed to Object.create()
//        when the class is instantiated.
const prototypes = new Map<string, Serializable>();

export namespace ClassFactory
{
  // ! Throws exception on error.
  export function newInstance<T>(Class: Types.NonabstractClass<T>): T
  {
    // ! Throws exception on error.
    return newInstanceByName(Class.name).dynamicCast(Class);
  }

  // ! Throws exception on error.
  export function newInstanceByName(className: string): Serializable
  {
    // ! Throws exception on error.
    const prototype = getPrototype(className);

    if (prototype === "Doesn't exist")
    {
      throw Error(`Failed to instantiate class '${className}' because`
        + ` it's prototype isn't registered in the class factory. Make `
        + ` sure ClassFactory.registerClassPrototype(${className}) is`
        + ` called somewhere`);
    }

    return instantiate(prototype);
  }

  export function registerClassPrototype<T extends Serializable>
  (
    Class: Types.NonabstractClass<T>
  )
  : void
  {
    register(Class.name, new Class());
  }

/// TODO: Tohle možná nebude muset bejt public
/// (záleží na tom, jak budu vyrábět instance root prototype entit).
  // ! Throws exception on error.
  export function register(className: string, prototype: Serializable): void
  {
    if (prototypes.has(className))
    {
      throw Error(`Failed to register prototype '${className}'`
        + ` because there already is a prototype registered under this`
        + ` name in the class factory`);
    }

    prototypes.set(className, prototype);
  }

  export function getPrototype(prototypeName: string)
  : Serializable | "Doesn't exist"
  {
    const prototype = prototypes.get(prototypeName);

    if (prototype === undefined)
      return "Doesn't exist";

    return prototype;
  }

  export function instantiate<T extends object>(prototype: T): T
  {
    // Object.create() will create a new object with 'prototype'
    // as it's prototype object. This will ensure that all 'own'
    // properties of 'prorotype' (those initialized in constructor
    // or in class body of prototype) become 'inherited' properties
    // on the new instance (so that changing the value on prototype
    // will change the value for all instances that don't have that
    // property overriden).
    const instance = Object.create(prototype);

    // Prototype inheritance in Javascript handles nonprimitive
    // properties as direct references to such properties in
    // prototype object. That means that writing to a property
    // inside a nonprimitive property changes the value on the
    // prototype, not on the instance. To prevent this, we need
    // to manually instantiate all nonprimitive properties.
    instantiateProperties(instance, prototype);

    return instance;
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function instantiateProperties(instance: object, prototype: object)
: void
{
  if (instance === null)
  {
    throw Error(`Failed to instantiate properties because 'instance'`
      + ` has 'null' value. Don't ever use 'null', use 'undefined'`
      + ` instead or even better a string type like "Not found" or`
      + ` something like that`);
  }

  if (instance === undefined)
    // 'undefined' has no properties so there is nothing to instantiate.
    return;

  // We need to iterate over inherited properties for two reasons:
  //   1) Instance is created using Object.create() so it doesn't have
  //      any own properties (the whole point is to create them here).
  //   2) We need to instantiate all inherited properties, not only
  //      those of our direct prototype object but of it's prototypes
  //      as well. The point of instantiating nonprimitive properties
  //      is to prevent changing of value on the prototype so we really
  //      need to "mask" all inherited nonprimitive properties with
  //      an empty object that we can write our own properties into.
  // TLRD: We really need to disable the oterwise sensible tslint rule here.
  // tslint:disable-next-line:forin
  for (const propertyName in instance)
  {
    // This check allows for re-instantiating of properties of existing
    // instance when prototype is changed. Properties that already are
    // instantiated (they are 'own' properties) should not be overwritten
    // with a new empty object.
    if (instance.hasOwnProperty(propertyName))
      continue;

    const prototypeProperty = (prototype as any)[propertyName];

      // ! Throws exception on error.
    const instantiatedProperty = instantiateProperty(prototypeProperty);

    if (instantiatedProperty !== "Not instantiated")
    {
      (instance as any)[propertyName] = instantiatedProperty;

      // Property we have just instantiated may have it's own
      // non-primitive properties that also need to be instantiated.
      //   Note that recursive call is done even for properties that
      // have already been instantiated on 'object', because there
      // still may be some changes deeper in the structure).
      instantiateProperties
      (
        instantiatedProperty,
        prototypeProperty
      );
    }
  }
}

// ! Throws exception on error.
function instantiateProperty(prototypeProperty: any): any
{
  if (prototypeProperty === null)
  {
    throw Error(`Failed to instantiate object property because`
      + ` respective prototype property has 'null' value. Don't ever`
      + ` use 'null', use 'undefined' instead or even better a string`
      + ` type like "Not found" or something like that`);
  }

  // Primitive properties (numbers, strings, 'undefined', etc) don't
  // have to be instantiated because Javascript prototype inheritance
  // handles them correctly.
  if (typeof prototypeProperty !== "object")
    return "Not instantiated";

  // Do not recursively instantiate propeties of other entities
  // (that could lead to infinite recursion among other things).
  //   Note that we can't use "instanceof Entity" here because
  // importing Entity to ClassFactory would lead to circular
  // module dependance error. So we have to check if 'id' property
  // is present instead.
  if (prototypeProperty[ID] !== undefined)
    return "Not instantiated";

  // Properties of type Map or Set can't be instantiated using
  // Object.create() because accessing them would thrown an exception,
  // so we have to create a new instance of Map() or Set().
  // (This means that prototypal inheritance won't really work for Map
  //  or Set - instance won't have access to these properties on the
  //  prototype - but at least it prevents changing the prototype by
  //  writing to it's instance.
  if (Types.isMap(prototypeProperty))
    return new Map();

  if (Types.isSet(prototypeProperty))
    return new Set();

  if (Types.isDate(prototypeProperty))
  {
    throw Error(`Attempt to instantiate property of type Date.`
      + ` Don't use Date type, use class Time instead. Property is`
      + ` not instantiated`);
  }

  // Object.create() will create a new {}, which will have
  // 'prototypeProperty' as it's prototype object.
  return Object.create(prototypeProperty);
}