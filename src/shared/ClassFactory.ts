/*
  Part of BrutusNEXT

  Allows instantiation of classes in runtime.
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';
import {FATAL_ERROR} from '../shared/error/FATAL_ERROR';
import {IdProvider} from '../shared/entity/IdProvider';
import {PrototypeRecord} from '../shared/PrototypeRecord';
import {AutoSaveableObject} from '../shared/fs/AutoSaveableObject';
import {Entity} from '../shared/entity/Entity';
import {NamedEntity} from '../shared/entity/NamedEntity';
import {EntityManager} from '../shared/entity/EntityManager';
import {PrototypeEntity} from '../shared/entity/PrototypeEntity';
import {DynamicClasses} from '../shared/DynamicClasses';
import {NamedClass} from '../shared/NamedClass';
import {Server} from '../server/Server';

export class ClassFactory extends AutoSaveableObject
{
  private static get SAVE_DIRECTORY()
  {
    return "./data/";
  }

  private static get SAVE_FILE_NAME()
  {
    return "ClassFactory.json";
  }

  /*
    Co potřebuju:
    - podle idčka předka najít objekt, ze kterého se zdědím
    - seznam idček editovatelných potomků, abych mohl rekurzivně
      loadnout prototypy
    - podle jména classy zjistit, jestli už má idčko a případně jaké.
  */

  // Hashmap matching id assigned to a hardcoded entity class
  // to it's prototypeObject instance and the list of ids of
  // it's editable descentants.
  //   Key:   id assigned to a hardcoded entity class.
  //   Value: list of ids of descendants.
  private hardcodedPrototypeRecords = new Map<string, PrototypeRecord>();

  // Hashamp matching name of hardcoded entity classes (like 'Character')
  // to their assigned ids. This allows prototypes inherited from these
  // hardcoded classes to refer to them using an id instead of class name,
  // which allows renaming of hardcoded classes without the need to also
  // change the name in all save files that reference them.
  //   Key:   name od hardcoded entity class
  //   Value: assigned id.
  private hardcodedPrototypeIds = new Map<string, string>(); 

  // Only non-entity classes have their prototype object here.
  // Enity prototype objects are regular entities and you will
  // find them in EntityManager.
  //   Key:   class name
  //   Value: prototype object
  private nonEntityPrototypes = new Map<string, any>();
  // Do not save property 'nonEntityPrototypes'.
  private static nonEntityPrototypes = { isSaved: false };

  /*
  /// Pozn: dynamicClasses pořád potřebuju, protože ne všechny
  ///   classy jsou entity.

  // Hashmap<[ string, Class ]>
  //   Key: class name
  //   Value: constructor of the class
  private dynamicClasses = new Map();
  */

  constructor(private idProvider: IdProvider)
  {
    super();    
  }

  // ---------------- Public methods --------------------

  public async initPrototypes()
  {
    // Assign constructors of dynamic classes to DynamicClasses.constructors. 
    DynamicClasses.init();

    let entityClasses = [];

    for (let Class of DynamicClasses.constructors.values())
    {
      // Split dynamicClasses into two groups:
      // - to those that are descended from class Entity
      //   (so they do have an id).
      // - and those that are descended from something else
      //   (so they don't have an id).
      if (!this.isEntity(Class))
      {
        // Non-entity class prototypes are just an instances
        // of these classes (created by 'new Class'). We store
        // them in this.nonEntityPrototypes. 
        this.nonEntityPrototypes.set(Class.name, new Class);
      }
      else
      {
        // Entity classes (those that have an id) are not
        // instantiated right away, because we need to create
        // id's for them if they don't exist yet.
        entityClasses.push(Class);
      }
    }

    // Now create prototype instances of dynamic entity classes.
    // Note that editable entity prototypes are not stored in ClassFactory
    // but rather in EntityManager, because they are regular entities
    // (they can be edited, you can stat them from the game, etc.).
    await this.initEntityPrototypes(entityClasses);
  }

  // Creates a new object based on object 'prototype'.
  // Non-primitive properties will also be recursively
  // instantiated.
  public createInstance(prototypeObject: NamedClass)
  {
    // Object.create() will create a new object with 'prototype'
    // as it's prototype. This will change all 'own' properties
    // (those initialized in constructor or in class body of
    // prototype) to 'inherited' properties (so that changing the
    // value on prototype will change the value for all instances
    // that don't have that property overriden.
    let instance = Object.create(prototypeObject);

    return this.instantiateObjectProperties
    (
      instance,
      prototypeObject.className
    );
  }

  // 'prototype' can be a hardcoded class name or an entity id.
  // -> Returns 'undefined' if 'prototype' isn't found.
  public getPrototypeObject(prototype: string)
  {
    // Reuested prototype can either exist in ClassFactory,
    // if it's a hardcoded class, or in EtityManager, if it's
    // an editable prototype.

    // First we check if 'prototype' exists in ClassFactory.
    let prototypeObject = this.searchPrototypeInClassFactory(prototype);

    if (prototypeObject !== undefined)
      return prototypeObject;

    // Then we check if 'prototype' exists in EntityManager.
    return Server.entityManager.get(prototype, Object);
  }

  /*
  // Only searches for prototypes that are not entities.
  // (to search for entity prototype using entity id use
  //  EntityManager.get(id))
  // -> Returns 'undefined' if such prototype doesn't exist.
  public getPrototype(className)
  {
    return this.nonEntityPrototypes.get(className);
  }
  */

  /*
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
  */

  /*
  public prototypeExists(className: string): boolean
  {
    return this.prototypes.has(className);
  }
  */

  /*
  public classExists(className: string): boolean
  {
    return this.dynamicClasses.has(className);
  }
  */

  /*
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
  */

  /*
  // -> Returns 'undefined' if no such prototype exists.
  public getPrototypeId(prototypeName: string)
  {
    return this.prototypes.get(prototypeName);
  }
  */

  /*
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
  */

  /*
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
  */

  /*
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
  */

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

  /*
  // Creates a prototype object as an instance of 'Class'.
  private createPrototype(Class: any)
  {
    return new Class;
  }
  */

  /*
  private async loadRootPrototypeEntity()
  {
    let saveExists = await NamedEntity.isNameTaken
    (
      "Entity",
      NamedEntity.NameCathegory.prototypes
    );

    if (saveExists)
    {
      return await Server.entityManager.loadNamedEntity
      (
        'Entity',
        NamedEntity.NameCathegory.prototypes
      );
    }

    return this.createPrototype(Entity);
  }
  */

  /*
  private isNameValid(name: string): boolean
  {
    return name !== "" && name !== null && name !== undefined;
  }
  */

  /*
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
  */

  /*
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
  */

  /*
  private getPrototypeIds(rootPrototypeEntity: Entity)
  {
    //   Key:   class name
    //   Value: id of respective prototype entity
    let ids = new Map<string, string>();

    // We also add the root prototype entity id to the hasmap, so
    // it can be searched for when creating it's direct descendants.
    ids.set(rootPrototypeEntity.constructor.name, rootPrototypeEntity.getId());

    for (let id of rootPrototypeEntity.descendantIds)
    {
      ids.set()
    }

    return ids;
  }
  */

  /*
  private createPrototypeEntity(Class: any)
  {
    let ancestorName = Class.prototype.name;

    let ancestor = ;

    // If class doesn't have an id yet, we ask EntityManager
    // to create a new entity inherited from prototypeEntity id.
    return Server.entityManager.createEntity
    (
      Class.name,
      NamedEntity.NameCathegory.prototypes,
      ancestor.getId()
    );
  }
  */

  private instantiateObjectProperties(instance: any, className: string)
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

  private isEntity(Class: any)
  {
    return Class.prototype['getId'] !== undefined;
  }

  private createPrototypeObject(id: string, Class: any)
  {
    let record = this.hardcodedPrototypeRecords.get(id);

    if (record === undefined)
    {
      ERROR("Unable to find prototype record corresponding"
        + " to id '" + id + "'. All records from"
        + " ClassFactory.hardcodedPrototypeIds"
        + " hashmap must have a corresponding record"
        + " in ClassFactory.hardcodedPrototypeRecords"
        + " hashmap");
      return;
    }

    if (record.prototypeObject !== null)
      ERROR("Prototype record for id '" + id + "'"
        + " already has a prototypeObject assigned");
    
    /// IMHO tady nepotřebuju createInstance (tj. Object.create()
    /// a instancování properties), protože půjde o prototype
    /// object, který odstíní vlastní vytváření konkrétních intancí.
    /// - prototyp coby Object.create() potřebuju pouze u editovatelných
    ///   prototypů, a to právě proto, aby byly editovatelné. 
    ///record.prototypeObject = this.createInstance(new Class);
    record.prototypeObject = new Class;
  }

  private createPrototypeRecord(Class: any)
  {
    let id = this.idProvider.generateId();

    // Note that prototypeRecord.descendantIds will be
    // empty - that's ok, because if the class didn't
    // already have prototypeRecord, its newly added to
    // the code so it can't have any descendant prototypes
    // yet. 
    let prototypeRecord = new PrototypeRecord();

    // Add newly created prototypeRecord to
    // this.hardcodedPrototypeRecords hashmap.
    this.hardcodedPrototypeRecords.set(id, prototypeRecord);

    // And also add an entry mapping class name to
    // the id to this.hardcodedPrototypeIds hashmap.
    this.hardcodedPrototypeIds.set(id, Class.name);
  }

  private async initEntityPrototypes(entityClasses: Array<any>)
  {
    // Load ClassFactory from the save. This will load
    // hardcodedPrototypeRecords and hardcodedPrototypeIds
    // hashmaps.
    await this.load();

    // It is possible that not all of the hardcoded entity classes have
    // an id stored in ClassFactory save. This can either happen when the
    // server is launched for the first time and there is no /data yet,
    // or when someone has added some new entity classes to the code. Either
    // way, we are going to automatically generate id's for those classes
    // that lack them.

    // Go through all dynamic entity classes specified in
    // DynamicClasses.init().
    for (let Class of entityClasses)
    {
      // First we check if our class already has an id assigned.
      // (hashmap returns 'undefined' if it doesn't contain requested entry)
      let id = this.hardcodedPrototypeIds.get(Class.name);

      if (id === undefined)
        this.createPrototypeRecord(Class);

      // Now we know that prototypeRecord for the processed
      // class exists, because either it has been present in
      // ClassFactory save or we have just created it.
      //   So we can create a prototype object for the Class.
      this.createPrototypeObject(id, Class);
    }
  }

  // Searches for prototypeRecord matching 'prototype both in
  // this.hardcodedPrototypeIds and in this.hardcodedPrototypeRecords.
  // -> Returns 'undefined' if matching prototypeRecord isn't found.
  private getPrototypeRecord(prototype: string)
  {
    // Check if 'prototype' exists in this.hardcodedPrototypeIds
    // (so that it's a class name).
    let prototypeId = this.hardcodedPrototypeIds.get(prototype);

    if (prototypeId !== undefined)
    {
      // 'this.hardcodedPrototypeIds' only translates prototype
      // classNames to respective ids, so to get our prototypeRecord
      // we need to request it from this.hardcodedPrototypeRecords
      // the id we have just obtained.
      return this.hardcodedPrototypeRecords.get(prototypeId);
    }

    // If 'prototope' doesn't exist in this.hardcodedPrototypeIds,
    // it means that's its not a valid prototype class name, but
    // it still can be a valid prototype id - which we can determine
    // by searching it in  this.hardcodedPrototypeRecords.
    return this.hardcodedPrototypeRecords.get(prototype);
  }

  // Searches for 'prototype' both in this.hardcodedPrototypeIds
  // and in this.hardcodedPrototypeRecords.
  // -> Returns 'undefined' if 'prototype' isn't found.
  private searchPrototypeInClassFactory(prototype: string)
  {
    let prototypeRecord = this.getPrototypeRecord(prototype);

    if (prototypeRecord === undefined || prototypeRecord === null)
      return undefined;

    // Now we have a prototype record corresponding to requested
    // 'prototype', but we need to return a prototypeObect contained
    // in this record.
    //   So we check the prototypeObject is valid:
    if (prototypeRecord.prototypeObject === null)
    {
      ERROR("Attempt to request prototypeObject of prototype"
        + " " + prototype + " which doesn't have it initialized"
        + " in it's prototype record yet");
      return undefined;
    }

    return prototypeRecord.prototypeObject;
  }
}
