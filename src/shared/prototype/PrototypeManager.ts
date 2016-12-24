/*
  Part of BrutusNEXT

  Allows instantiation of classes in runtime.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';
import {IdProvider} from '../../shared/entity/IdProvider';
///import {Prototype} from '../../shared/prototype/Prototype';
import {AutoSaveableObject} from '../../shared/fs/AutoSaveableObject';
import {Entity} from '../../shared/entity/Entity';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {EntityManager} from '../../shared/entity/EntityManager';
import {ScriptableEntity} from '../../shared/entity/ScriptableEntity';
import {DynamicClasses} from '../../shared/DynamicClasses';
import {NamedClass} from '../../shared/NamedClass';
import {Server} from '../../server/Server';

export class PrototypeManager extends AutoSaveableObject
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

  /*
  // Hashamp matching name of hardcoded entity classes (like 'Character')
  // to their assigned ids. This allows prototypes inherited from these
  // hardcoded classes to refer to them using an id instead of class name,
  // which allows renaming of hardcoded classes without the need to also
  // change the name in all save files that reference them.
  //   Key:   name od hardcoded entity class
  //   Value: assigned id.
  private hardcodedEntityPrototypeIds = new Map<string, string>();

  // Hashmap matching id assigned to a hardcoded entity class
  // to it's prototypeObject instance and the list of ids of
  // it's editable descentants.
  //   Key:   id assigned to a hardcoded entity class.
  //   Value: list of ids of descendants.
  private hardcodedEntityPrototypeRecords = new Map<string, Prototype>();
  */

  /*
  /// Pozn: dynamicClasses pořád potřebuju, protože ne všechny
  ///   classy jsou entity.

  // Hashmap<[ string, Class ]>
  //   Key: class name
  //   Value: constructor of the class
  private dynamicClasses = new Map();
  */

  /*
  private idProvider: IdProvider = null;
  // Do not save property 'idProvider'.
  private static idProvider = { isSaved: false };
  */

  /*
  // Only non-entity classes have their prototype object here.
  //   Key:   class name
  //   Value: prototype object
  private nonEntityPrototypes = new Map<string, Object>();
  // Do not save property 'nonEntityPrototypes'.
  private static nonEntityPrototypes = { isSaved: false };
  */

  // Hashmap matching prototype names to prototype objects.
  //   Key:   prototype class name
  //   Value: prototpype object or entity.
  private prototypeObjects = new Map<string, Object>();
  // Do not save property 'entityPrototypes'.
  private static prototypeObjects = { isSaved: false };


  //   Key:   prototype class name
  //   Value: record describing hardcoded entity prototype.
  // In order to instantiate hardcoded entities (like Account),
  // you need a prototype entity of such type which you will use
  // as a prototype object with Object.create(). These prototype
  // entities are stored in EntityManager like all other entities,
  // but they can't be saved to disk directly, because there is no
  // prototype entity available in order to instantiate them.
  //   So instead of saving them to disk like other (dynamic)
  // entities we recreate them every time the server starts - and
  //  these are the parameters we need to do it.
  private hardcodedEntityPrototypes =
    new Map<string, PrototypeManager.PrototypeRecord>();

  /*
  constructor(idProvider: IdProvider)
  {
    super();

    this.idProvider = idProvider;
  }
  */

  // ---------------- Public methods --------------------

  // Initializes prototypes for hardcoded classes and loads
  // entity prototypes from disk.
  //   If 'createDefaultData' is true, init() won't attempt
  // to load prototypes, everything will be initialized from
  // scratch.
  public async init(createDefaultData: boolean)
  {
    // Init needs to be done in four steps, because we need
    // to create prototype objects for hardcoded nonentity
    // classes (like Prototype) in order to be able to load
    // PrototypeManager.json file, which contains ids of
    // hardcoded entity classes (like Account).
    //   Only after loading these ids we can init the newly
    // added hardcoded entity class prototypes (those that
    // don't have an id yet) and also load the dynamic entity
    // prototypes (entity prototypes that are created by ingame
    // editor rather than declared in code).

    // First we create prototype objects for non-entity dynamic
    // classes (ee get a list of hardcoded entity dynamic classes
    // as side effect).
    let entityClasses = this.initNonEntityPrototypes();

    if (!createDefaultData)
    {
      // Load PrototypeManager from the file
      // (this.hardcodedEntityPrototypes array will be loaded).
      await this.load();
    }

    // Now create prototype objects of hardcoded entity classes.
    await this.createHardcodedEntityPrototypes(entityClasses);

    /// Rekurzivně, protože je třeba loadnout nejdřív předky, aby
    /// šlo loadnout potomky.
    /// - na druhou stranu musím nějak idčku přiřadit příslušný
    ///   entityPrototypeRecord - což jde jen přes 
    // Recursively load all prototype entities.
    this.loadDynamicEntityPrototypes();
  }

  // Creates a new object based on object specified by 'prototypeId'
  // ('prototypeId' can either be an id of prototype entity or the
  //  class name if prototype isn't an entity).
  // Non-primitive properties will also be recursively instantiated.
  // -> Returns 'null' if instance couldn't be created.
  public createInstance(prototypeId: string)
  {
    let prototypeObject = this.getPrototypeObject(prototypeId);

    if (!(prototypeObject === null || typeof prototypeObject === 'object'))
    {
      ERROR("Prototype object can only be 'null' or 'object'");
      return null;
    }

    // Object.create() will create a new object with 'prototypeObject'
    // as it's prototype. This will ensure that all 'own' properties
    // of 'prorotypeObject' (those initialized in constructor or in
    // class body of prototype) become 'inherited' properties on our
    // instance (so that changing the value on prototype will change
    // the value for all instances that don't have that property overriden).
    let instance = Object.create(prototypeObject);

    // We also need to use Object.create() for all non-primitive properties,
    // because in javascript such properties are only inherited by copying
    // a reference to such property on prototype object, which would mean
    // that changing a property of a non-primitive property on an instance
    // would actualy change that value on prototype.
    return this.instantiateObjectProperties
    (
      instance,
      prototypeObject.className
    );
  }

  /// Changed to work with prototypeId rather than prototypeObject.
  /*
  // Creates a new object based on object 'prototype'.
  // Non-primitive properties will also be recursively
  // instantiated.
  public createInstance(prototypeObject: NamedClass)
  {
    if (!(prototypeObject === null || typeof prototypeObject === 'object'))
    {
      ERROR("Prototype object can only be 'null' or 'object'");
      return null;
    }

    // Object.create() will create a new object with 'prototypeObject'
    // as it's prototype. This will ensure that all 'own' properties
    // of 'prorotypeObject' (those initialized in constructor or in
    // class body of prototype) become 'inherited' properties on our
    // instance (so that changing the value on prototype will change
    // the value for all instances that don't have that property overriden).
    let instance = Object.create(prototypeObject);

    // We also need to use Object.create() for all non-primitive properties,
    // because in javascript such properties are only inherited by copying
    // a reference to such property on prototype object, which would mean
    // that changing a property of a non-primitive property on an instance
    // would actualy change that value on prototype.
    return this.instantiateObjectProperties
    (
      instance,
      prototypeObject.className
    );
  }
  */

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

  // -> Returns 'null' if instance properties couldn't be instantiated.
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

  /*
  private setPrototypeObjectToPrototypeRecord
  (
    id: string,
    prototypeObject: Object
  )
  {
    let record = this.hardcodedEntityPrototypeRecords.get(id);

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
    {
      ERROR("Prototype record for id '" + id + "'"
        + " already has a prototypeObject assigned");
    }

    record.prototypeObject = prototypeObject;
  }
  */

  /*
  private createPrototypeObject(id: string, Class: any)
  {
    /// IMHO tady nepotřebuju createInstance (tj. Object.create()
    /// a instancování properties), protože půjde o prototype
    /// object, který odstíní vlastní vytváření konkrétních intancí.
    /// - prototyp coby Object.create() potřebuju pouze u editovatelných
    ///   prototypů, a to právě proto, aby byly editovatelné. 
    ///record.prototypeObject = this.createInstance(new Class);
    let prototypeObject = new Class;

    if (prototypeObject.setId === undefined)
    {
      ERROR("Attempt to create a prototypeObject of Class"
        + " " + Class.name + " which is not an Entity class");
      return null;
    }

    // Id is read from prototype object when a new instance is created
    // to set it's prototypeId (so it can be based on correct prototype
    // when loaded from file).
    prototypeObject.setId(id);

    // Not all entities have property 'name' - for example
    // Connection is an Entity, but not NamedEntity.
    if (prototypeObject.setNameSync !== undefined)
    {
      // Name would otherwise be 'Unnamed Entity'. Something
      // like 'Account prototype' is probably more informative.
      // (Note that entity name of a prototype object is not unique.
      //  When you refer to a prototype by it's name, you are
      //  actually refering to it's className, not entity name.)
      prototypeObject.setNameSync(Class.name + " prototype");
    }

    return prototypeObject;
  }
  */

  /*
  // -> Returns created id.
  private createPrototypeRecord(className: string)
  {
    let id = this.idProvider.generateId();

    // Note that prototypeRecord.descendantIds will be
    // empty - that's ok, because if the class didn't
    // already have prototypeRecord, it's newly added to
    // the code so it can't have any descendant prototypes
    // yet.
    let prototypeRecord = new Prototype();

    // Add newly created prototypeRecord to
    // this.hardcodedPrototypeRecords hashmap.
    this.hardcodedEntityPrototypeRecords.set(id, prototypeRecord);

    // And also add an entry mapping class name to
    // the id to this.hardcodedPrototypeIds hashmap.
    this.hardcodedEntityPrototypeIds.set(className, id);

    return id;
  }
  */

  // -> Returns 'null' if prototype entity coulnd't be created.
  private createPrototypeEntity
  (
    prototypeObject: NamedEntity,
    className:string
  )
  {
    let entity = Server.entityManager.createPrototypeEntity
    (
      prototypeObject,
      className
    );

    if (entity === null)
      return null;

    // Prototype entities of hardcode entity classes are entities like
    // all others, but they are not saved like entities, because we
    // couldn't load them the regular way (there are no prototype
    // entities to base these entities on, because they are the prototypes
    // for all other entities.
    //   So instead of saving them directly, we save just the information
    // required to recreate them on the next start of the server (most
    // importantly their id's).
    let record: PrototypeManager.PrototypeRecord =
    {
      id: entity.getId(),
      descendantIds: entity.desendantIds
    };

    this.hardcodedEntityPrototypes.set(Class.name, record);
    
    return entity;
  }

  private composePrototypeEntity
  (
    prototypeObject: NamedEntity,
    className: string,
    record: PrototypeManager.PrototypeRecord,
  )
  {
    let entity = Server.entityManager.composePrototypeEntity
    (
      prototypeObject,
      className,
      record.id,
      record.descendantIds
    );

    entity.descendantIds = record.descendantIds;

    return entity;
  }

  private initPrototypeEntity<T extends NamedEntity>
  (
    record: PrototypeManager.PrototypeRecord,
    Class: { new (...args: any[]): T }
  )
  {
    // Prototype object for hardcoded entity is just a regular
    // instance of respective class (like 'new Account');
    let prototypeObject = new Class;
    let prototypeEntity = null;

    if (record === undefined)
    {
      // Create a new prototype entity with a new id and also
      // create a new prototype record for it and add it to
      // this.hardcodedEntityPrototypes hashmap.
      prototypeEntity = this.createPrototypeEntity
      (
        prototypeObject,
        Class.name
      );
    }
    else
    {
      // Create prototype entity based on data in the record.
      prototypeEntity = this.composePrototypeEntity
      (
        prototypeObject,
        Class.name,
        record
      );
    }

    return prototypeEntity;
  }

  private async createHardcodedEntityPrototypes(entityClasses: Array<any>)
  {
    let saveNeeded = false;

    // It is possible that not all of the hardcoded entity classes have
    // an id stored in PrototypeManager save. This can either happen when
    // the server is launched for the first time and there is no /data
    // directory yet, or when someone has added some new entity classes
    // to the code. Either way, we are going to automatically generate
    // id's for those classes that lack them.

    // Go through all dynamic entity classes specified in
    // DynamicClasses.init().
    for (let Class of entityClasses)
    {
      // Check if our class already has an id assigned
      // (get() returns 'undefined' if hashmap doesn't contain such entry).
      let record = this.hardcodedEntityPrototypes.get(Class.name);

      if (record === undefined)
        saveNeeded = true;

      let prototypeEntity = this.initPrototypeEntity(record, Class);

      if (prototypeEntity === null)
        // Eror is already reported.
        continue;

      // Add the newly created prototype entity to this.prototypeObjects
      // hashmap.
      this.prototypeObjects.set(Class.name, prototypeEntity);
    }

    // If we created some new prototype entities, we need to
    // save PrototypeManager so we don't loose their ids.
    if (saveNeeded)
      await this.save();
  }

  /// Deprecated.
  /*
  // Searches for prototypeRecord matching 'prototype both in
  // this.hardcodedPrototypeIds and in this.hardcodedPrototypeRecords.
  // -> Returns 'undefined' if matching prototypeRecord isn't found.
  private getPrototypeRecord(prototype: string)
  {
    // Check if 'prototype' exists in this.hardcodedPrototypeIds
    // (so that it's a class name).
    let prototypeId = this.hardcodedEntityPrototypeIds.get(prototype);

    if (prototypeId !== undefined)
    {
      // 'this.hardcodedPrototypeIds' only translates prototype
      // classNames to respective ids, so to get our prototypeRecord
      // we need to request it from this.hardcodedPrototypeRecords
      // the id we have just obtained.
      return this.hardcodedEntityPrototypeRecords.get(prototypeId);
    }

    // If 'prototope' doesn't exist in this.hardcodedPrototypeIds,
    // it means that's its not a valid prototype class name, but
    // it still can be a valid prototype id - which we can determine
    // by searching it in  this.hardcodedPrototypeRecords.
    return this.hardcodedEntityPrototypeRecords.get(prototype);
  }
  */

  /// Deprecated.
  /*
  // Searches for 'prototype' in the ClassFactory.
  // -> Returns 'undefined' if 'prototype' isn't found.
  private searchPrototypeInClassFactory(prototype: string)
  {
    // First search in non-entity prototypes.
    let prototypeObject = this.nonEntityPrototypes.get(prototype);

    if (prototypeObject !== undefined)
      return prototypeObject;

    return this.searchEntityPrototype(prototype);
  }
  */

  /// Deprecated.
  /*
  // -> Returns prototypeObject if non-entity 'prototype' exists
  //    in ClassFactory, 'undefined' otherwise.
  private searchEntityPrototype(prototype: string)
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
  */

  // Searches for prototype object matching given 'prototypeId'
  // ('prototypeId' can either be an id of prototype entity or the
  //  class name if prototype isn't an entity).
  // -> Returns 'undefined' if matching prototype object isn't found.
  private getPrototypeObject(prototypeId: string)
  {
    // get() returns 'undefined' if 'prototypeId' isn't found.
    let prototype = this.prototypes.get(prototypeId);

    if (prototype === undefined || prototype === null)
    {
      ERROR("Unable to find prototype in PrototypeManager"
        + " matching prototypeId '" + prototypeId + "'");
      return undefined;
    }

    return prototype.getPrototypeObject(prototypeId);

    /*
    // Reuested prototype object can either exist in ClassFactory,
    // if it's a hardcoded class, or in EtityManager, if it's
    // an editable prototype.

    // Check if 'prototype' exists in ClassFactory.
    let prototypeObject = this.searchPrototypeInClassFactory(prototype);

    if (prototypeObject !== undefined)
      return prototypeObject;

    // Check if 'prototype' exists in EntityManager.
    return Server.entityManager.get(prototype, Object);
    */
  }

  // Creates prototype objects for non entity classes.
  // -> Returns the list of entity classes contained
  //    in DynamicClasses.
  private initNonEntityPrototypes()
  {
    // Assign constructors of dynamic classes
    // to DynamicClasses.constructors hashmap. 
    DynamicClasses.init();

    let entityClasses = [];

    for (let Class of DynamicClasses.constructors.values())
    {
      if (!this.isEntity(Class))
      {
        // We can create a prototype objects for non-entity classes
        // right away, because it's the first step (required in order
        // to be able to load PrototypeManager.json).
        this.initNonEntityPrototype(Class);
      }
      else
      {
        // Entity classes (those that have an id) are not
        // instantiated right away, because we need to create
        // id's for them if they don't have it yet. So we just
        // push them to a temporary array now.
        entityClasses.push(Class);
      }
    }

    return entityClasses;
  }

  private initNonEntityPrototype<T>(Class: { new (...args: any[]): T })
  {
    // Non-entity prototype objects are just instances
    // of respective classes (created as 'new Class').
    let prototypeObject = new Class;

    this.prototypeObjects.set(Class.name, prototypeObject);
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use these types from outside this file.
// It must be declared after the class because Typescript says so...
export module PrototypeManager
{
  export interface PrototypeRecord
  {
    // Id of a prototype entity.
    id: string;
    // List of ids of prototype entities inherited from this prototype.
    descendantIds: Array<string>;
  }
}
