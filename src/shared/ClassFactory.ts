/*
  Part of BrutusNEXT

  Allows instantiation of classes in runtime.
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';
import {FATAL_ERROR} from '../shared/error/FATAL_ERROR';
import {Entity} from '../shared/entity/Entity';
import {NamedEntity} from '../shared/entity/NamedEntity';
import {EntityManager} from '../shared/entity/EntityManager';
import {PrototypeEntity} from '../shared/entity/PrototypeEntity';
import {DynamicClasses} from '../shared/DynamicClasses';
import {NamedClass} from '../shared/NamedClass';
import {Server} from '../server/Server';

export class ClassFactory
{
  //   Key:   entity id if prototype has it, lowercase class
  //            name otherwise (like 'account')
  //   Value: prototype object (entity or something else)
  private prototypes = new Map<string, any>();

  /// Pozn: dynamicClasses pořád potřebuju, protože ne všechny
  ///   classy jsou entity.

  // Hashmap<[ string, Class ]>
  //   Key: class name
  //   Value: constructor of the class
  private dynamicClasses = new Map();

  constructor()
  {
    DynamicClasses.init(this.dynamicClasses);
  }

  // ---------------- Public methods --------------------

  public async init()
  {
    let saveExists = await NamedEntity.isNameTaken
    (
      "Entity",
      NamedEntity.NameCathegory.prototypes
    );

    let prototypeEntity = null;

    if (saveExists)
    {
      prototypeEntity = await Server.entityManager.loadNamedEntity
      (
        'Entity',
        NamedEntity.NameCathegory.prototypes
      );
    }
    else
    {
      prototypeEntity = Server.entityManager.createThePrototypeEntity();
    }

    // Even if dynamic classes assignment has been loaded
    // (by loading prototypeEntity from disk), we still
    // do it in order to add newly added dynamic classes
    // that don't have a prototypeId yet.  
    this.assignPrototypes(prototypeEntity);

    await prototypeEntity.save();
  }

  // Declares a new class named 'className' and inherited from
  // 'ancestorName' and set it's ['className'] property to
  // 'className'. Also registers the new class in classFactory.
  // -> Returns newly declared class (it's constructor) or null
  //    if creation failed.
  public createClass(className: string, ancestorName: string)
  {
    if (!this.isNameValid(className))
    {
      ERROR("Attempt to create class with invalid"
        + " class name. Class is not created");
      return null;
    }

    if (!this.isNameValid(ancestorName))
    {
      ERROR("Attempt to create class with invalid"
        + " ancestor name. Class is not created");
      return null;
    } 

    // Class that we want to create must not yet exist.
    if (this.classExists(className))
    {
      ERROR("Attempt to create class '" + className + "'"
        + " (with ancestor '" + ancestorName + "') that"
        + " already exists. Class is not created");
      return null;
    }

    // Dynamicaly create a new class using a script run on virtual machine.
    let NewClass = this.declareClass(className, ancestorName);

    return NewClass;
  }

  public prototypeExists(className: string): boolean
  {
    return this.prototypes.has(className);
  }

  public classExists(className: string): boolean
  {
    return this.dynamicClasses.has(className);
  }

  public registerClass(className: string, Class)
  {
    if (!this.isNameValid(className))
    {
      ERROR("Attemt to register Class with invalid className");
      return;
    }

    if (Class === null || Class === undefined)
    {
      ERROR("Attemt to register invalid Class '" + className + "'");
      return;
    }

    if (this.dynamicClasses.has(className))
    {
      ERROR("Attempt to register class '" + className + "'"
        + " that is already registered in ClassFactory");
      return;
    }

    // Add Class to hashmap under the key 'className'.
    this.dynamicClasses.set(className, Class);
  }

  // -> Returns 'undefined' if no such prototype exists.
  public getPrototypeId(prototypeName: string)
  {
    return this.prototypes.get(prototypeName);
  }

  public getClass(className: string)
  {
    let Class = this.dynamicClasses.get(className);

    if (Class === undefined)
    {
      FATAL_ERROR("Attempt to request a nonexistent dynamic"
      + " class '" + className + ". If it's a prototype class,"
      + " it needs to have a .json file in ./data/prototypes."
      + " If it's declared in source code, it needs to be listed"
      + " in DynamicClasses.ts");
    }

    return Class;
  }

  // Creates an instance based on prototype 'new Class'.
  //   This is done instad of just using 'new Class' as
  // a class instance, because we want initialized class
  // properties to be on prototype, not on instance. That
  // wouldn't be the case if we just used 'new Class'.
  //   We also won non-primitive properties to be instantiated
  // so modifying them on an instance don't change them on
  // the prototype.)
  public createClassInstance(className: string)
  {
    if (!this.isNameValid(className))
    {
      ERROR("Invalid class name. Instance is not created");
      return null;
    }
 
    let Class = this.getClass(className);

    if (Class === undefined)
      // Error is already reported by getClass().
      return null;

    return this.createInstance(new Class);
  }

  // Creates a new instance based on prototype specified by 'prototypeId'.
  public createPrototypeInstance(prototypeId: string)
  {
    // Object that will be used as prototype for a newly created instance.
    let prototype = null;

    // Null 'prototypeId' means that no prototype will be used.
    // This is used to create THE prototype entity (prototype of
    // all other entities)
    if (prototypeId === null)
    {
      prototype = new Entity();
    }
    else
    {
      prototype = Server.entityManager.get(prototypeId, Entity);

      if (prototype === undefined)
      {
        ERROR("Failed to find entity prototype " + prototypeId
          + " in EntityManager");
        return null;
      }
    }

    return this.createInstance(prototype);
  }

  /*
  // Creates a new instance of type className.
  // Usage example:
  //   let instance = classFactory.createInstance('Account', Acount);
  public createInstance<T>
  (
    className: string,
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    typeCast: { new (...args: any[]): T },
    // Any extra arguments will be passed to the class constructor.
    ...args: any[]
  )
  {
    if (!this.isNameValid(className))
    {
      ERROR("Invalid class name. Instance is not created");
      return null;
    }

    let Class = this.getClass(className);

    if (Class === undefined)
      // Error is already reported by getClass().
      return null;

    let instance = new Class(...args);

/////////////////////
    if (instance['instantiateProperties'] === undefined)
    {
      ERROR("Unable to instantiate dynamic class " + className
        + " because it is not an InstantiableClass");
      return null;
    }

    // This is a workaround for 'feature' of javascript prototype
    // inheritance that non-primitive properties are passed to
    // instances as references rather than instantiated as well.
    //   Instantiating properties means, that for each non-primitive
    // property (Object, Array, etc.) we recursively create an empty
    // {}, but with prototype whitch is the corresponding property
    // on entity prototype. Or, in other words, inherited from
    // corresponding property on entity prototype.
    //   This will exploit the fact that inheritance of primitive
    // properties (numbers, strings, etc.) works fine - when such
    // property is written to instance, it will really be written
    // to the instance so it will become instance's 'own' property.
    // 'inheriting' non-primitive properties also works for methods,
    // so 'instantiated' non-primitive properties will have the same
    // functionality as on the entity prototype, even though they
    // are not classes but rather generic Objects.
    instance.instantiateProperties();
/////////////////////

    // Dynamic type check - we make sure that our newly created instance
    // is inherited from requested class or is an instance of that class.
    if (instance instanceof typeCast)
      // Here we typecast to <any> in order to pass newObject
      // as type T (you can't typecast directly to template type but you can
      // typecast to <any> which is then automatically cast to template type).
      return <any>instance;

    ERROR("Type cast error: Newly created instance of"
      + " class '" + className + "' is not an instance"
      + " of requested type (" + typeCast.name + ")");

    return null;
  }
  */

  // ---------------- Private methods -------------------

  private instantiateProperties(instance: any, className: string)
  {
    if (instance['instantiateProperties'] === undefined)
    {
      ERROR("Unable to instantiate dynamic class " + className
        + " because it is not an InstantiableClass");
      return null;
    }

    // This is a workaround for 'feature' of javascript prototype
    // inheritance that non-primitive properties are passed to
    // instances as references rather than instantiated as well.
    //   Instantiating properties means, that for each non-primitive
    // property (Object, Array, etc.) we recursively create an empty
    // {}, but with prototype whitch is the corresponding property
    // on entity prototype. Or, in other words, inherited from
    // corresponding property on entity prototype.
    //   This will exploit the fact that inheritance of primitive
    // properties (numbers, strings, etc.) works fine - when such
    // property is written to instance, it will really be written
    // to the instance so it will become instance's 'own' property.
    // 'inheriting' non-primitive properties also works for methods,
    // so 'instantiated' non-primitive properties will have the same
    // functionality as on the entity prototype, even though they
    // are not classes but rather generic Objects.
    instance.instantiateProperties();

    return instance;
  }

  private isNameValid(name: string): boolean
  {
    return name !== "" && name !== null && name !== undefined;
  }

  private declareClass(className: string, ancestorName: string)
  {
    // If the type of Ancestor variable doesn't make sense to you,
    // it's because it really doesn't make sense. It's type is
    // a constructor of that class, but we don't have no way to know
    // what class that is here, so we use NamedClass as return Value
    // which is a class so it satistfied Typescript's type checking.
    // (This little hack is needed so Typescript will let us dynamically
    // declare a new class extended from Ancestor).  
    let Ancestor: { new (...args: any[]): NamedClass } =
      this.getClass(ancestorName); 

    // Ancestor class must exist.
    if (Ancestor === undefined)
    {
      ERROR("Attempt to create class '" + className + "' inherited"
        + " from nonexisting ancestor class '" + ancestorName + "'."
        + " Class is not created");
      return null;
    }

    /// DEBUG:
    console.log("Declaring class '" + className + "'");

    // Note that dynamically declared class can't have a name
    // (that's why we are not using constructor.name but rather our own
    //  property 'className'. See NamedClass::className for details).
    let NewClass = class extends Ancestor { };

    if (NewClass === undefined)
    {
      ERROR("Failed to declare new class (" + className + ")");
      return null;
    }

    // This overrides static accessor 'className' inherited from
    // NamedClass, which is necessary, because that accessor returns
    // constructor.name, which is undefined for dynamically declared
    // class (and the property is locked against changing so it cannot
    // be set by any means).
    NewClass[NamedClass.CLASS_NAME_PROPERTY] = className;

    // Registers newly created class in classFactory.
    // Prints error message if we failed to create the class.
    this.registerClass(className, NewClass);

    return NewClass;
  }

  private isEntity(Class: any)
  {
    return Class.prototype['getId'] !== undefined;
  }

  // Creates a new object based on 'prototype'. It's non-primitive
  // properties will also be recursively instantiated.
  private createInstance(prototype: NamedClass)
  {
    // Object.create() will create a new object with 'prototype'
    // as it's prototype. This will change all 'own' properties
    // (those initialized in constructor or in class body of
    // prototype) to 'inherited' properties (so that changing the
    // value on prototype will change the value for all instances
    // that don't have that property overriden.
    let instance = Object.create(prototype);

    return this.instantiateProperties(instance, prototype.className);
  }


  private assignPrototypes(prototypeEntity: PrototypeEntity)
  {
    this.prototypes.clear();

    // First we go throgh descendant ids that prototypeEntity has
    // loaded from disk (if they are any) and update this.prototypes
    // with those records.
    for (let descendantId of prototypeEntity.descendants)
    {
      let descendant = Server.entityManager.get(descendantId, PrototypeEntity);

      if (!Entity.isValid(descendant))
      {
        FATAL_ERROR("Unable to find prototype entity " + descendantId
          + " in EntityManager");
        return;
      }

      // This will allow looking up a prototypeId using prototype className.
      this.prototypes.set(descendant.className, descendantId)
    }

    // Now we know which prototypes are already loaded (so they have
    // an entity id), so we can create id's for the rest and assignment
    // them to prototypeEntity.descendants.
    for (let Class of this.dynamicClasses.values())
    {
      let className = Class.className;

      if
      (
        // There are some dynamic classes that are not entities,
        // for example Exits or just any nested structure. Those
        // classes of course shound't have an Entity as their
        // prototype.
        this.isEntity(Class)
        // We also only want to add prototypess to this.prototypes
        // that are not there yet (they are already be there if
        // they were saved along with prototypeEntity).
        && !this.prototypeExists(className)
      )
      {
        // Create a new instance of Class that will
        // serve as a prototype.
        let prototypeInstance = this.createInstance(new Class);

        // And an entity id of a new prototype to prototypeEntity.descendants.
        prototypeEntity.descendants.push(prototypeInstance.getId());
      }
    }
  }
}
