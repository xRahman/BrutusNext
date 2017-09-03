/*
  Part of BrutusNEXT

  Stores constructors of dynamic classes so they can be instantiated
  in runtime.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';

/// This doesn't work in Typescript 2.4.1 anymore :\.
// // Type describing constructor of a Serializable class.
// type SerializableClass = new <T extends Serializable>(...args: any[]) => T;
// // Type describing constructor of an Entity class.
// type EntityClass = new <T extends Entity>(...args: any[]) => T;

export class Classes
{
  // Classes extended from Serializable but not from Entity.
  public static serializables = new Map<string, new() => any>();

  // Classes extended from Entity.
  // (we keep Entity classes aside from other Serializable classes
  //  even though Entity is extended from Serializable because they
  //  are instantiated differently).
  public static entities = new Map<string, new() => any>();

  // ------------- Public static methods ----------------

  public static registerSerializableClass<T extends Serializable>
  (
    Class: new(...args: any[]) => T
  )
  {
    this.serializables.set(Class.name, Class);
  }

  public static registerEntityClass<T extends Entity>
  (
    Class: new(...args: any[]) => T
  )
  {
    this.entities.set(Class.name, Class);
  }


  // ------------- Private static methods ---------------
}

/// To be deleted.
/*
export class Classes
{
  
  // Hasmap of constructor of classes that can be dynamically instantiated.
  // Key:   class name
  // Value: class constructor
  public static classInfo = new Map<string, ClassInfo>();

  // -> Returns 'undefined' if class isn't found.
  public static getSerializableClass(className: string)
  {
    return this.serializables.get(className);
  }

  // -> Returns 'undefined' if class isn't found.
  public static getEntityClass(className: string)
  {
    return this.entities.get(className);
  }

  // Creates an instance of class 'className'. This can only be
  // used on classes registered by Classes.registerSerializableClass().
  // (classes registered by Classes.registerEntityClass()
  //  are entity prototype classes and need to be instantiated by
  //  Entity.createInstance() instead.
  // -> Returns 'null' on error.
  public static createNew(className: string): Serializable
  {
    let classInfo = this.classInfo.get(className);

    if (classInfo === undefined)
    {
      ERROR("Attempt to create an instance of class '" + className + "'"
        + " that is not registered in Classes. Instance is not created");
      return null;
    }

    if (classInfo.isEntityClass === true)
    {
      /// TODO: Revidovat error message.
      /// - možná netřeba, spíš to celé zruším, páč se tímhle budou vyrábět
      ///   i root objecty prototypové dědičnosti.
      ERROR("Attempt to create an instance of class"
        + " '" + className + "' that is registered as"
        + " an entity class so it has to be instantiated"
        + " using Entity.createInstance() rather"
        + " than Classes.createInstance()."
        + " Instance is not created. Maybe you"
        + " have registered your new class using"
        + " Classes.registerEntityClass()"
        + " instead of Classes.registerSerializableClass()?");
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

  // Creates an entitity for each entity class registered in
  // Classes and adds it to the Entities so it can
  // be used as prototype object for othe entities
  // (prototype entities use class name as their id).
  public static createRootEntities()
  {
    for (let [className, classInfo] of this.classInfo)
    {
      if (classInfo.isEntityClass)
        Entities.createRootEntity(className, classInfo.Class);
    }
  }

  // -> Returns array of names of entity classes registered in Classes.
  public static getNamesOfEntityClasses()
  {
    let entityClasses = [];

    for (let [className, classInfo] of this.classInfo)
    {
      if (classInfo.isEntityClass)
        entityClasses.push(className);
    }

    return entityClasses;
  }

  // Adds 'classInfo' to Classes.classInfo hashmap.
  private static addClassInfo(classInfo: ClassInfo)
  {
    if (this.classInfo.has(classInfo.Class.name))
    {
      ERROR("Attempt to add class " + classInfo.Class.name
        + " to the Classes when it's already there");
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
*/