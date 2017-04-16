/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember it's EntityId.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
import {AutoSaveableObject} from '../../../server/lib/fs/AutoSaveableObject';
import {Server} from '../../../server/lib/Server';

export class Entity extends AutoSaveableObject
{
  // public static get ID_PROPERTY() { return 'id'; }

  // public static get PROTOTYPE_ID_PROPERTY()
  // {
  //   return "prototypeId";
  // }

  // public static get IS_PROTOTYPE_PROPERTY()
  // {
  //   return "isEntityPrototype";
  // }

  // public static get INSTANCE_IDS_PROPERTY()
  // {
  //   return "instanceIds";
  // }

  // ----------------- Private data ----------------------

  // ///private id: EntityId = null;
  // private id: string = null;
  // // Property 'id' is not saved to file, because it is saved
  // // as the name of the saved file (like 7-iu5by22s.json).
  // private static id = { isSaved: false };

  // // Id of entity which serves as prototype object to this entity.
  // //   This needs to be saved in orded to know what prototype object
  // // to use when creating this entity.
  // //   Only hardcoded entity prototypes have null 'prototypeId'.
  // private prototypeId: string = null;

  // // Symbolic name of this entity, which is relative to the
  // // 'symLocation' entity (in other words: entity 'symLocation'
  // // has a hasmap 'symNames' which maps 'symName' of this entity
  // // to the reference to this entity).
  // private symName: string = null;

  // // Reference to the entity which can translate our 'symName'
  // // to the reference to this entity.
  // private symLocation: Entity = null;

  // // Hasmap translating symbolic names of entities to respective
  // // references.
  // //   Key:   'symName'
  // //   Value: reference to entity identified by 'symName'
  // private symNames = new Map<string, Entity>();

  // // Set of ids of entities that use this entity as their prototype
  // // object - including entities saved on disk but not present in
  // // memory at the moment.
  // private instanceIds = new Set<string>();


  /// Na vícenásobnou dědičnost se prozatím vykašlu - fightspecy a podobně
  /// nejspíš vyřeším přes attachování vzorců chování (které budou zděděné
  /// mezi sebou).
  /*
  // Ids of prototype entities this prototype entity is inherited
  // from.
  // - We use ids instead of prototype names to allow easy changing of
  //   prototype names (same as with descendantIds).
  // - TODO (proč je ancestorů víc a nějak to vymyslet s "mergnutým"
  //   prototypem - i když ten je asi odkazovaný přes prototypeId)
  public ancestorIds = [];
  */
  /// Místo ancestora použiu 'prototypeId'
  /*
  // Ancestor prototype entity.
  // - Only prototype entities should have 'ancestor' as their
  //   own property. Entity instances should always inherit it
  //   from their prototype entity and never modify it.
  // - Only hardcoded entity prototypes should have null 'ancestor'.
  private ancestor = null;
  */

  /*
  /// Nakonec asi nebudu explicitně rozlišovat. Každá entita může
  /// být prototypem.
  ///private isPrototypeEntity = false;
  */

  // ------------- Private static methods ---------------

  // We need a static method because in order to load an entity
  // save path needs to be constructed before entity exists.
  private static getSaveDirectory(): string
  {
    return Server.DATA_DIRECTORY + 'entities/';
  }

  // We need a static method because in order to load an entity
  // save path needs to be constructed before entity exists.
  private static getSaveFileName(id: string)
  {
    if (id === null || id === undefined || id === "")
    {
      let errorSaveName = '_SAVE_PATH_CREATION_ERROR.json';

      ERROR("Invalid entity id. Entity save name will be " + errorSaveName);
      return errorSaveName;
    }

    return id + '.json';
  }

  // ------------- Public static methods ----------------

  // Instances of entities are all saved to ./data/entities as
  // <id>.json (the method is static because in order to load an entity,
  // save path needs to be constructed before entity exists).
  public static getSavePath(id: string)
  {
     return Entity.getSaveDirectory() + Entity.getSaveFileName(id);
  }

  // public static isValid(entity: Entity)
  // {
  //   return entity !== null
  //       && entity !== undefined
  //       && entity.isValid() === true;
  // }

  // --------------- Public accessors -------------------

  // public getId()
  // {
  //   // If we don't have own 'id' property, this.id would return
  //   // id of our prototype object (thanks to inheritance), which
  //   // is not our id (id has to be unique for each entity instance).
  //   if (!this.hasOwnProperty(Entity.ID_PROPERTY) || this.id === null)
  //   {
  //     ERROR("Attempt to get 'id' of an entity which doesn't have"
  //       + " an id set, yet");
  //     return null;
  //   }

  //   return this.id;
  // }

  // public setId(id: string)
  // {
  //   // Id can only be set once.
  //   //   We need to check if we have own property 'id'
  //   // (not just the one inherited from our prototype),
  //   // because if we don't, value of 'this.id' would be
  //   // that of our prototype object, which is not null.
  //   if (this.hasOwnProperty(Entity.ID_PROPERTY) && this.id !== null)
  //   {
  //     ERROR("Attempt to set id of entity " + this.getErrorIdString()
  //       + " that already has an id. Id is not set");
  //     return;
  //   }

  //   this.id = id;

  //   if (this.hasOwnProperty('id') === false)
  //     FATAL_ERROR("Property 'id' has been set to prototype object"
  //       + " rather than to the instance. This probably means that"
  //       + " entity proxy has been used as prototype entity instead"
  //       + " of nonproxified entity");
  // }

  // public getPrototypeId() { return this.prototypeId; }

  // public setPrototypeId(prototypeId: string)
  // {
  //   this.prototypeId = prototypeId;
  // }

  // public getInstanceIds()
  // {
  //   return this.instanceIds;
  // }

  // public setInstanceIds(instanceIds: Set<string>)
  // {
  //   this.instanceIds = instanceIds;
  // }

  // public addInstance(instance: Entity)
  // {
  //   let instanceId = instance.getId();

  //   if (instance === null || instance === undefined)
  //   {
  //     ERROR("Invalid parameter 'instance'");
  //     return;
  //   }

  //   // Check that instanceId is not yet present in the list.
  //   if (this.instanceIds.has(instanceId))
  //   {
  //     ERROR("Failed to add instance " + instance.getErrorIdString()
  //       + " to prototype " + this.getErrorIdString() + " because it"
  //       + " is already listed as an instance of this prototype");
  //     return;
  //   }

  //   this.instanceIds.add(instanceId);
  // }

  // ---------------- Public methods --------------------

  // public isPrototype()
  // {
  //   // We have to make sure that we check our own property
  //   // (because we surely have a nonempty 'instanceIds'
  //   //  property inherited from our prototype).
  //   if (!this.hasOwnProperty(Entity.INSTANCE_IDS_PROPERTY))
  //     return false;

  //   // We are a prototype if there is at least one
  //   // entity that use us as it's prototype object.
  //   return this.instanceIds.size !== 0;
  // }

  // public isHardcodedPrototypeEntity()
  // {
  //   // Hardcoded prototype entities are the roots of respective
  //   // prototype trees so they don't have 'prototypeId' themselves.
  //   return this.prototypeId === null;
  // }

  // // Compares entities by string ids.
  // // (You should never compare two references directly, because
  // //  there can be more than one reference for any single entity
  // //  because references to entity proxies are used. Always use
  // //  this method instead.) 
  // public equals(entity: Entity)
  // {
  //   if (entity === null || entity.isValid() === false)
  //   {
  //     ERROR("Attempt to compare entity " + this.getErrorIdString()
  //       + " to an invalid entity");
  //     return false;
  //   }

  //   if (this.isValid() === false)
  //   {
  //     ERROR("Attempt to compare entity " + entity.getErrorIdString()
  //       + " to invalid entity " + this.getErrorIdString());
  //     return false;
  //   }

  //   return this.getId() === entity.getId(); 
  // }

  // // This function exists only for typescript to stop complaining
  // // that it doesn't exist. It should never be executed, however,
  // // because 'dynamicCast()' call should always be trapped by
  // // entity proxy (see EntityProxyHandler.get()).
  // public dynamicCast<T>(typeCast: { new (...args: any[]): T })
  // {
  //   ERROR("Entity.dynamicCast() function should never be called."
  //     + " You somehow managed to get your hands on direct reference"
  //     + " to entity instead of a proxy. That must never happen");

  //   return null;
  // }

  // // This function exists only for typescript to stop complaining
  // // that it doesn't exist. It should never be executed, however,
  // // because 'dynamicTypeCheck()' call should always be trapped by
  // // entity proxy (see EntityProxyHandler.get()).
  // private dynamicTypeCheck<T>(type: { new (...args: any[]): T })
  // {
  //   ERROR("Entity.dynamicTypeCheck() function should never be called."
  //     + " You somehow managed to get your hands on direct reference"
  //     + " to entity instead of a proxy. That must never happen");

  //   return false;
  // }

  // // This function exists only for typescript to stop complaining
  // // that it doesn't exist. It should never be executed, however,
  // // because 'isValid()' call should always be trapped by
  // // entity proxy (see EntityProxyHandler.get()).
  // public isValid(): boolean
  // {
  //   ERROR("Entity.isValid() function should never be called. You"
  //     + " somehow managed to get your hands on direct reference to"
  //     + " entity " + this.getErrorIdString() + " instead of a proxy."
  //     + " That must never happen");

  //   return false;
  // }

  /// Deprecated.
  /*
  protected getPrototypeSaveDirectory(): string
  {
    // Hardcoded prototype entities (like Account) are roots of
    // respective prototype trees (and of respective directory
    // structures).
    if (this.isHardcodedPrototypeEntity())
    {
      ERROR("Attempt to get save directory of hardcoded"
        + " prototype entity" + this.getErrorIdString() + "."
        + " That's not supposed to happen because hardcoded"
        + " prototype entities are not saved directly but"
        + " rather generated from information contained in"
        + " PrototypeManager.hardcodedEntityPrototypes hashmap");
      return './data/prototypes/';
    }

    // Prototype entities are saved to directory structure
    // matching their inheritance.
    let prototype = this.constructor.prototype;

    // If we are for example 'Newbie Area' inherited from
    // hardcoded prototype 'Area', we are going to be saved
    // to './data/prototypes/Area' directory (so our full save
    // name will be './data/prototypes/Area/Newbie Area.json').
    if (prototype.isHardcodedPrototypeEntity())
      return './data/prototypes/' + prototype.className + '/';

    // If we are for example some prototype inherited from 'Newbie Area',
    // we are going to be saved to './data/prototypes/Area/Newbie Area/'
    // directory.
    return prototype.getPrototypeSaveDirectory() + prototype.className + '/';
  }
  */

  // Overrides AutoSaveableObject.getSaveDirectory().
  protected getSaveDirectory(): string
  {
    /// Prozatím volím nejjednodušší řešení - všechny entity
    /// se savují do /data/entities, ať už jsou to prototypy
    /// nebo ne (každá entita může být prototypem nějaké jiné,
    /// takže by to stejně nebylo moc užitečné rozlišit.).
    /*
    // Prototype entities are saved to directory structure
    // matching their inheritance.
    if (this.isPrototype())
      return this.getPrototypeSaveDirectory();

    /// TODO
    // Instances of entities are saved to directory structure matching
    // their location in other containers (so the world is the root,
    // it contains realms, they contain areas, etc.).

    /// Možná:
    //   There are some exceptions - player characters are save to
    // player accounts rather than to the rooms where they are present.
    */

    ///return './data/entities/';

    return Entity.getSaveDirectory();
  }

  protected getSaveFileName(): string
  {
    ///return this.getId() + '.json';
    return Entity.getSaveFileName(this.getId());
  }

  // Overrides AutoSaveableObject.save().
  // - check if entity is valid.
  // - handles correct saving of prototype entities.
  public async save()
  {
    if (this.isValid() === false)
    {
      ERROR("Attemp to save invalid entity " + this.getErrorIdString());
      return;
    }

    await this.saveToFile
    (
      this.getSaveDirectory(),
      this.getSaveFileName()
    );
  }

  // // Returns something like 'Connection (id: d-imt2xk99)'
  // // (indended for use in error messages).
  // public getErrorIdString()
  // {
  //   if (this.getId() === null)
  //     return "{ className: " + this.className + ", id: null }";

  //   return "{ className: " + this.className + ", id: " + this.getId() + " }";
  // }

  /// Tohle možná nepoužiju - entity nejspíš budou do listů přidávat
  /// různé funkce podle aktuální potřeby... 
  /*
  // Entity adds itself to approptiate EntityLists so it can be
  // searched by name, etc. This doesn't add entity to EntityManager.
  // (this method needs to be overriden by descendants)
  public addToLists() { }
  */

  // // Entity removes itself from EntityLists so it can no longer
  // // be searched by name, etc. This doesn't remove entity from EntityManager.
  // // (this method needs to be overriden by descendants)
  // public removeFromLists() {}

  // --------------- Protected methods ------------------

  /*
  // This method exists only to prevent accidental
  // delcaring of 'then' property. See error message
  // inside this method for more info.
  protected then()
  {
    FATAL_ERROR("Attempt to access 'then' property"
      + " of entity " + this.getErrorIdString() + "."
      + " Property 'then' is accessed by async functions"
      + " when they returun value in order to check if"
      + " the value is already a Promise or it needs"
      + " to be promisified. If you see this error, it"
      + " can either mean that you have declared a method"
      + " or class variable named 'then' somewhere - in"
      + " that case just choose another name for it, or"
      + " TODO"
      + "It's an ugly hack, but it"
      + " forces us never to use property named 'then'");
  }
  */
}