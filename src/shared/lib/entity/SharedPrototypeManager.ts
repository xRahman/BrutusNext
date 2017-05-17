/*
  Part of BrutusNEXT

  Contains references to hardcoded prototype entities
  (which are the roots of prototype trees).
*/

'use strict';

// import {ERROR} from '../../../shared/lib/error/ERROR';
// import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
// import {IdProvider} from '../../../server/lib/entity/IdProvider';
// import {AutoSaveableObject} from '../../../server/lib/fs/AutoSaveableObject';
// import {Entity} from '../../../server/lib/entity/Entity';
// import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
// import {Entities} from '../../../server/lib/entity/Entities';
// import {ScriptableEntity} from '../../../server/lib/entity/ScriptableEntity';
// ///import {DynamicClasses} from '../../../server/lib/class/DynamicClasses';
// import {NamedClass} from '../../../server/lib/class/NamedClass';
// import {ServerApp} from '../../../server/lib/Server';
// import {Classes} from '../../../shared/lib/Classes';

export class Prototypes
{
  /// Prototypes nemusí obsahovat nic - 

  /*
  // Hashmap matching prototype names to prototype objects.
  //   Key:   class name
  //   Value: prototpype entity
  private prototypeObjects = new Map<string, Entity>();
  // Do not save property 'entityPrototypes'.
  private static prototypeObjects = { isSaved: false };

  // Hashmap storing information about hardcoded entity prototypes.
  //   In order to instantiate hardcoded entity (like Account),
  // you need a prototype entity of such type which you will use
  // as a prototype object with Object.create(). These prototype
  // entities are stored in Entities like all other entities,
  // but they can't be saved to disk directly, because they are
  // root nodes of inheritance tree so there are no prototype entities
  // to base them on.
  //   So instead of saving them to disk like other (dynamic)
  // entities we recreate them every time the server starts. To do it,
  // we need to remember their ids and ids of their descendants - and
  // that somewhere is right here in this hashmap.
  //   Key:   prototype class name
  //   Value: record describing hardcoded entity prototype.
  private hardcodedPrototypes = new Map<string, HardcodedPrototype>();

  // ---------------- Public methods --------------------

  // Initializes prototypes for hardcoded classes and loads
  // entity prototypes from disk.
  //   If 'createDefaultData' is true, init() won't attempt
  // to load prototypes, everything will be initialized from
  // scratch.
  public async init(createDefaultData: boolean)
  {
    // First we create prototype objects for non-entity dynamic classes
    // (we also get list of hardcoded entity dynamic classes
    // as side effect of iterating Classes.constructors).
    let entityClasses = this.initNonEntityPrototypes();

    if (!createDefaultData)
    {
      // Load Prototypes from the file
      // (this.hardcodedEntityPrototypes array will be loaded).
      await this.load();
    }

    // Now create prototype entities for hardcoded entity classes.
    await this.createHardcodedEntityPrototypes(entityClasses);

    // Recursively load all prototype entities. Recursive loading
    // (each prototype loads its descendants) removes the need to
    //  store prototypes in order of inheritance, which greatly
    //  simplifies changing the ancestor of a prototype. This way
    //  you don't have to reorder the list of prototype entities,
    //  you just have to remove yourself from list of descendants
    //  in you old ancestor and add yourself as a descendant to
    //  your new ancestor).
    this.loadDynamicEntityPrototypes();
  }

  // Creates a new object based on object specified by 'prototypeId'
  // ('prototypeId' can either be an id of prototype entity or the
  //  class name if prototype isn't an entity).
  // Non-primitive properties will also be recursively instantiated.
  // -> Returns 'null' if instance couldn't be created.
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

  // Searches for prototype object matching given 'prototypName'.
  // -> Returns 'undefined' if matching prototype object isn't found.
  public getPrototypeObject(prototypeName: string)
  {
    // get() returns 'undefined' if 'prototypeId' isn't found.
    let prototypeObject = this.prototypeObjects.get(prototypeName);

    if (prototypeObject === undefined)
    {
      ERROR("Unable to find prototype in Prototypes"
        + " matching prototypeId '" + prototypeName + "'");
      return undefined;
    }

    return prototypeObject;
  }

  // ---------------- Private methods -------------------

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

  // Creates a new prototype entity with new id based on 'prototypeObject'.
  // -> Returns 'null' if prototype entity coulnd't be created.
  private createPrototypeEntity
  (
    prototypeObject: Entity,
    className:string
  )
  {
    let entity = ServerApp.entityManager.createHardcodedPrototypeEntity
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
    let record: HardcodedPrototype =
    {
      id: entity.getId(),
      instanceIds: entity.getInstanceIds()
    };

    this.hardcodedPrototypes.set(className, record);
    
    return entity;
  }

  // Composes an entity using id from 'record' parameter.
  private composePrototypeEntity
  (
    prototypeObject: Entity,
    className: string,
    record: HardcodedPrototype,
  )
  {
    let entity = ServerApp.entityManager.composePrototypeEntity
    (
      prototypeObject,
      className,
      record.id,
      record.instanceIds
    );

    entity.setInstanceIds(record.instanceIds);

    return entity;
  }

  // Generates a new entity with new id and adds a new record to
  // this.hardcodedEntityPrototypes if 'record' is undefined,
  // composes an entity using 'record.id' otherwise.
  private initPrototypeEntity<T extends Entity>
  (
    record: HardcodedPrototype,
    Class: { new (...args: any[]): T }
  )
  {
    // Prototype object for hardcoded entity is just a regular
    // instance of respective class (like 'new Account');
    let prototypeObject = new Class;

    if (record === undefined)
    {
      // Create a new prototype entity with a new id and also
      // create a new prototype record for it and add it to
      // this.hardcodedEntityPrototypes hashmap.
      return this.createPrototypeEntity
      (
        prototypeObject,
        Class.name
      );
    }
    else
    {
      // Create prototype entity based on data in the record.
      return this.composePrototypeEntity
      (
        prototypeObject,
        Class.name,
        record
      );
    }
  }

  private getPrototypeRecord(className: string)
  {
    let record = this.hardcodedPrototypes.get(className);

    if (record !== undefined)
    {
      if (record.id === undefined || record.instanceIds === undefined)
      {
        FATAL_ERROR("Empty or invalid record of prototype"
          + " '" + className + "' loaded from file"
          + " " + Prototypes.SAVE_DIRECTORY
          + Prototypes.SAVE_FILE_NAME + ". It"
          + " means that id of respective prototype"
          + " entity is lost, no prototypes inherited"
          + " from " + className + " will load correctly"
          + " and it won't be possible to create it's"
          + " instances. The best fix is probably to"
          + " return to the last commit that worked"
          + " (including both /src and /data");
        return undefined;
      }
    }

    return record;
  }

  private async createHardcodedEntityPrototypes<T extends Entity>
  (
    // Array of class constructors.
    entityClasses: Array<{ new (...args: any[]): T }>
  )
  {
    let saveNeeded = false;

    // It is possible that not all of the hardcoded entity classes have an
    // id stored in Prototypes save. This can either happen when the
    // server is launched for the first time and there is no /data
    // directory yet, or when someone has added new entity classes to
    // the code. Either way, we are going to automatically generate id's
    // for those classes that lack them.

    // Go through all dynamic entity classes.
    for (let Class of entityClasses)
    {
      // Check if our class already has an id assigned.
      //  (We do this in advance to know if a new entity
      //   will be generated so that we will have to save
      //   Prototypes.)
      //  (get() returns 'undefined' if hashmap doesn't
      //   contain requested entry.)
      let record = this.getPrototypeRecord(Class.name);

      if (record === undefined)
        saveNeeded = true;

      // Generate a new entity with new id and add a new record to
      // this.hardcodedEntityPrototypes if 'record' is undefined,
      // compose an entity using 'record.id' otherwise.
      let prototypeEntity = this.initPrototypeEntity(record, Class);

      if (prototypeEntity === null)
        // Eror is already reported.
        continue;

      // Add the newly created prototype entity to this.prototypeObjects
      // hashmap.
      this.prototypeObjects.set(Class.name, prototypeEntity);
    }

    // If we created some new prototype entities, we need to
    // save Prototypes so we don't loose their ids.
    if (saveNeeded)
      await this.save();
  }

  // Creates prototype objects for non entity classes.
  // -> Returns the list of entity classes registerd in Classes.
  private initNonEntityPrototypes()
  {
    let entityClasses = [];

    for (let Class of Classes.constructors.values())
    {
      if (!this.isEntity(Class))
      {
        // We can create a prototype objects for non-entity classes
        // right away, because it's the first step (required in order
        // to be able to load Prototypes.json).
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

  private initNonEntityPrototype<T extends NamedClass>
  (
    Class: { new (...args: any[]): T }
  )
  {
    // Non-entity prototype objects are just instances
    // of respective classes (created as 'new Class').
    let prototypeObject = new Class;

    this.prototypeObjects.set(Class.name, prototypeObject);
  }

  private loadDynamicEntityPrototypes()
  {
    /// TODO
  }
  */
}

// ------------------ Type declarations ----------------------

/*
interface HardcodedPrototype
{
  // Id of a prototype entity.
  id: string;
  // List of ids of prototype entities inherited from this prototype.
  instanceIds: Set<string>;
}
*/