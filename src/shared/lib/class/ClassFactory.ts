/*
  Part of BrutusNEXT

  Stores constructors of dynamic classes so they can be instantiated
  in runtime.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';

export class ClassFactory
{
  // Hasmap of constructor of classes that can be dynamically instantiated.
  // Key:   class name
  // Value: class constructor
  public static classInfo = new Map<string, ClassInfo>();

  // ------------- Public static methods ----------------

  // Creates a new object with 'prototype' as it's prototype object.
  // (Any object could be used as 'prototype' in principle, but we
  //  only use prototype inheritance for entities so we restrict the
  //  type of 'prototype' to Entity.).
  // -> Returns 'null' on error.
  public static createObjectFromPrototype(prototype: Entity)
  {
    if (prototype === null || prototype === undefined)
    {
      ERROR("Attempt to create a prototype instance based on an"
        + " invalid prototype object. Instance is not created");
      return null;
    }

    // Object.create() will create a new object with 'prototype'
    // as it's prototype object. This will ensure that all 'own'
    // properties of 'prorotype' (those initialized in constructor
    // or in class body of prototype) become 'inherited' properties
    // on the new instance (so that changing the value on prototype
    // will change the value for all instances that don't have that
    // property overriden).
    let instance = Object.create(prototype);

    // Prototype inheritance in Javascript handles nonprimitive
    // properties as direct references to such properties in
    // prototype object. That means that writing to a property
    // inside a nonprimitive property changes the value on the
    // prototype, not on the instance. To prevent this, we need
    // to manually instantiate all nonprimitive properties.
    this.instantiateProperties(instance, prototype);
  }

  // Creates an instance of class 'className'. This can only be
  // used on classes registered by  ClassFactory.registerClass().
  // (classes registered by ClassFactory.registerPrototypeClass()
  //  are entity prototype classes and need to be instantiated by
  //  Entity.createInstance() instead.
  // -> Returns 'null' on error.
  public static createNew(className: string): Serializable
  {
    let classInfo = this.classInfo.get(className);

    if (classInfo === undefined)
    {
      ERROR("Attempt to create an instance of class '" + className + "'"
        + " that is not registered in ClassFactory. Instance is not created");
      return null;
    }

    if (classInfo.isEntityClass === true)
    {
      ERROR("Attempt to create an instance of class"
        + " '" + className + "' that is registered as"
        + " an entity class so it has to be instantiated"
        + " using Entity.createInstance() rather"
        + " than ClassFactory.createInstance()."
        + " Instance is not created. Maybe you"
        + " have registered your new class using"
        + " ClassFactory.registerEntityClass()"
        + " instead of ClassFactory.registerClass()?");
        + " Another possible reason is that you are"
        + " deserializing an Entity class but there"
        + " is no '" + Entity.PROTOTYPE_ENTITY_PROPERTY + "'"
        + " in JSON data"
      return null;
    }

    // Create an instance of the class using constructor stored
    // as classInfo.Class.
    return new classInfo.Class();
  }

  // Registers constructor of a class so it can be dynamically instantiated
  // later.
  public static registerClass<T extends Serializable>
  (
    Class: { new (...args: any[]): T }
  )
  {
    let classInfo: ClassInfo =
    {
      Class: Class,
      isEntityClass: false
    }
    
    this.addClassInfo(classInfo);
  }

  // Registers constructor of an Entity class so it can be dynamically
  // instantiated later. Prototype instance of this class will be created
  // and added to EntityManager at the startup so it can be inherited from
  // by other entities.
  public static registerEntityClass<T extends Entity>
  (
    Class: { new (...args: any[]): T }
  )
  {
    let classInfo: ClassInfo =
    {
      Class: Class,
      isEntityClass: true
    }
    
    this.addClassInfo(classInfo);
  }

  // Creates an entitity for each entity class registered in
  // ClassFactory and adds it to the EntityManager so it can
  // be used as prototype object for othe entities
  // (prototype entities use class name as their id).
  public static createRootEntities()
  {
    for (let [className, classInfo] of this.classInfo)
    {
      if (classInfo.isEntityClass)
        EntityManager.createRootEntity(className, classInfo.Class);
    }
  }

  // -> Returns array of names of entity classes registered in ClassFactory.
  public static getListOfEntityClasses()
  {
    let entityClasses = [];

    for (let [className, classInfo] of this.classInfo)
    {
      if (classInfo.isEntityClass)
        entityClasses.push(className);
    }

    return entityClasses;
  }

  // ------------- Private static methods ---------------

  // Ensures that all non-primitive properties of 'prototype'
  // are instantiated on 'object'.
  // -> Returns 'object' with instantiated properties.
  private static instantiateProperties(object: any, prototype: any)
  {
    if (object === null || object === undefined)
      return null;

    for (let propertyName in object)
      this.instantiateProperty(object, prototype, propertyName);

    return object;
  }

  // Ensures that if 'property' of 'object' is non-primitive,
  // it is recursively instantiated as an empty Object inherited
  // from the respective 'property' on 'prototype' object.
  private static instantiateProperty
  (
    object: any,
    prototype: any,
    propertyName: string
  )
  {
    if (prototype === undefined || prototype === null)
    {
      ERROR("Invalid prototype object");
      return;
    }

    // There is no point of instantating properties that don't exist
    // on prototype object or have 'null' value on it.
    if (prototype[propertyName] === undefined
        || prototype[propertyName] === null)
      return;

    // Primitive properties (numbers, strings, etc) don't have to
    // be instantiated because Javascript prototype inheritance
    // handles them correctly.
    if (typeof object[propertyName] !== 'object')
      return;

    // This check allows re-instantiating of properties of existing
    // instance when prototype is changed. Properties that already
    // are instantiated (they are 'own' properties of object) are
    // not overwritten.
    if (!object.hasOwnProperty(propertyName))
      // Object.create() will create a new {}, which will have
      // prototype[propertyName] as it's prototype object.
      object[propertyName] = Object.create(prototype[propertyName]);

    // Property we have just instantiated may have it's own
    // non-primitive properties that also need to be instantiated.
    //   Note that recursive call is done even for properties that
    // have already been instantiated on 'object', because there
    // still may be some changes deeper in the structure).
    this.instantiateProperties(object[propertyName], prototype[propertyName]);
  }

  // Adds 'classInfo' to ClassFactory.classInfo hashmap.
  private static addClassInfo(classInfo: ClassInfo)
  {
    if (this.classInfo.has(classInfo.Class.name))
    {
      ERROR("Attempt to add class " + classInfo.Class.name
        + " to the ClassFactory when it's already there");
      return;
    }

    // Class.name is the name of the constructor of the class,
    // which is the class name.
    this.classInfo.set(classInfo.Class.name, classInfo);
  }
}

// ------------------ Type declarations ----------------------

interface ClassInfo
{
  Class: new <T extends Serializable>(...args: any[]) => T,
  isEntityClass: boolean
}