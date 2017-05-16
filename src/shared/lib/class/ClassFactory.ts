/*
  Part of BrutusNEXT

  Stores constructors of dynamic classes so they can be instantiated
  in runtime.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';

// Type describing constructor of a Serializable class.
type SerializableClass = new <T extends Serializable>(...args: any[]) => T;
// Type describing constructor of an Entity class.
type EntityClass = new <T extends Entity>(...args: any[]) => T;

export class Classes
{
  /// To be deleted.
  /*
  // Hasmap of constructor of classes that can be dynamically instantiated.
  // Key:   class name
  // Value: class constructor
  public static classInfo = new Map<string, ClassInfo>();
  */

  // Classes extended from Serializable but not from Entity.
  public static serializables = new Map<string, SerializableClass>();

  // Classes extended from Entity
  // (we keep Entity classes aside from other Serializable classes
  // even though Entity is extended from Serializable because they
  // are instantiated differently).
  public static entities = new Map<string, EntityClass>();

  // ------------- Public static methods ----------------

  /*
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
  */

  /*
/// TODO: Revidovat comment.
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
      /// TODO: Revidovat error message.
      /// - možná netřeba, spíš to celé zruším, páč se tímhle budou vyrábět
      ///   i root objecty prototypové dědičnosti.
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
  */

  // Registers constructor of a class so it can be dynamically instantiated
  // later.
  public static registerSerializableClass<T extends Serializable>
  (
    Class: SerializableClass
    //Class: { new (...args: any[]): T }
  )
  {
    this.serializables.set(Class.name, Class);
    /*
    let classInfo: ClassInfo =
    {
      Class: Class,
      isEntityClass: false
    }
    
    this.addClassInfo(classInfo);
    */
  }

  // Registers constructor of an Entity class so it can be dynamically
  // instantiated later. Prototype instance of this class will be created
  // and added to EntityManager at the startup so it can be inherited from
  // by other entities.
  public static registerEntityClass<T extends Entity>
  (
    Class: EntityClass
    //Class: { new (...args: any[]): T }
  )
  {
    this.entities.set(Class.name, Class);
    /*
    let classInfo: ClassInfo =
    {
      Class: Class,
      isEntityClass: true
    }
    
    this.addClassInfo(classInfo);
    */
  }

  // To be deleted.
  /*
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
  */

  /*
  // -> Returns array of names of entity classes registered in ClassFactory.
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
  */

  // ------------- Private static methods ---------------

  /// To be deleted.
  /*
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
  */
}

/// To be deleted.
/*
// ------------------ Type declarations ----------------------

interface ClassInfo
{
  Class: new <T extends Serializable>(...args: any[]) => T,
  isEntityClass: boolean
}
*/