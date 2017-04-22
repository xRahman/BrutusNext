/*
  Part of BrutusNEXT

  Stores constructors of dynamic classes so they can be instantiated
  in runtime.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';

export class ClassFactory
{
  // Hasmap of constructor of classes that can be dynamically instantiated.
  // Key:   class name
  // Value: class constructor
  public static classInfo = new Map<string, ClassInfo>();

  // ------------- Public static methods ----------------

  // Creates an instance of class 'className'. This can only be
  // used on classes registered by  ClassFactory.registerClass().
  // (classes registered by ClassFactory.registerPrototypeClass()
  //  are entity prototype classes and need to be instantiated by
  //  Entity.createInstance() instead.
  // -> Returns 'null' on error.
  public static createInstance(className: string)
  {
    let classInfo = this.classInfo.get(className);

    if (classInfo === undefined)
    {
      ERROR("Attempt to create an instance of class '" + className + "'"
        + " that is not registered in ClassFactory. Instance is not created");
      return null;
    }

    if (classInfo.isPrototypeClass === true)
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
        + " is no '" + Entity.PROTOTYPE_ID_PROPERTY + "'"
        + " in JSON data"
      return null;
    }

    // Create an instance of the class using constructor stored
    // as classInfo.Class.
    return new classInfo.Class();
  }

  // Registers constructor of a class so it can be dynamically instantiated
  // later.
  public static registerClass<T>(Class: { new (...args: any[]): T })
  {
    let classInfo: ClassInfo =
    {
      Class: Class,
      isPrototypeClass: false
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
      isPrototypeClass: true
    }
    
    this.addClassInfo(classInfo);
  }

  // Creates a prototype entitity for each prototype class listed
  // in ClassFactory.classInfo and adds it to the EntityManager so
  // it can be used as prototype for othe entities.
  // (These prototype entities use class name as their entity id,
  //  for example 'Room'.)
  public static createPrototypeEntities()
  {
    for (let [id, classInfo] of this.classInfo)
    {
      if (classInfo.isPrototypeClass)
      {
        this.createPrototypeEntity(id, classInfo.Class);
      }
    }
  }

  // ------------- Private static methods ---------------

  // Adds 'classInfo' to ClassFactory.classInfo hashmap.
  private static addClassInfo(classInfo: ClassInfo)
  {
    if (this.classInfo.has(classInfo.Class.name))
    {
      ERROR("Attempt to add class " + classInfo.Class.name
        + " to the ClassFactory when it's already there");
      return;
    }

    this.classInfo.set(classInfo.Class.name, classInfo);
  }

  // Creates an entity based with 'new Class' as it's prototype
  // and adds it to EntityManager (so it can be used as prototype
  // of other entities).
  private static createPrototypeEntity<T extends Entity>
  (
    id: string,
    Class: { new (...args: any[]): T }
  )
  {
    if (EntityManager.has(id))
    {
      ERROR("Attempt to add prototype entity for class " + id
        + " to EntityManager when it's already there");
      return;
    }

    let prototypeObject = new Class();

    // Create an entity based on 'prototypeObject' and add
    // to EntityManager under 'id' (which is the class name).
    // (We don't need to remember the entity we have just
    //  created, it will be accessed from EntityManager)
    Entity.createInstance(prototypeObject, id);
  }
}

interface ClassInfo
{
  Class: new <T>(...args: any[]) => T,
  isPrototypeClass: boolean
}