/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember it's EntityId.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';
///import {NamedClass} from '../../shared/NamedClass';
import {PrototypeEntity} from '../../shared/entity/PrototypeEntity';
import {SaveableObject} from '../../shared/fs/SaveableObject';
import {AutoSaveableObject} from '../../shared/fs/AutoSaveableObject';
import {Server} from '../../server/Server';

export class Entity extends AutoSaveableObject
{
  // ----------------- Private data ----------------------

  ///private id: EntityId = null;
  private id: string = null;
  // Property 'id' is not saved to file, because it is saved
  // as the name of the saved file (like 7-iu5by22s.json).
  private static id = { isSaved: false };

  // ------------- Public static methods ----------------

  // -> If loading fails, result.jsonObject will be null.
  public static async loadJsonOject(id: string)
  {
    // Return value of this method.
    let result = { jsonObject: null, prototypeId: null, path: null };

    result.path = Entity.getSavePath(id);

    // First we load data from file into generic (untyped)
    // javascript Object.
    result.jsonObject =
      await SaveableObject.loadJsonObjectFromFile(result.path);

    // Then we extract 'className' property from jsonObject
    // that we have just loaded, so we know what class do we
    //  need to create an instance of.
    result.prototypeId =
      result.jsonObject[PrototypeEntity.PROTOTYPE_ID_PROPERTY]; 

    // Note: 'null' prototypeId is allowed, because the root prototype
    // entity doesn't have any prototype.
    if (result.prototypeId === undefined)
    {
      ERROR("Missing className in " + result.path + "."
        + " Unable to load entity");
      result.prototypeId = null
      result.jsonObject = null;
    }

    return result;
  }

  // Instances of entities are all saved to ./data/entities as <id>.json
  // (the method is static because in order to load an entity, save path
  //  needs to be constructed before entity exists).
  public static getSavePath(id: string)
  {
    if (id === null || id === undefined || id === "")
    {
      let invalidPath = './data/entities/_SAVE_PATH_CREATION_ERROR.json';

      ERROR("Invalid id, " + invalidPath + " will be used");
      return invalidPath; 
    }

     return "./data/entities/" + id + ".json";
  }

  public static isValid(entity: Entity)
  {
    return entity !== null
        && entity !== undefined
        && entity.isValid() === true;
  }

  // --------------- Public accessors -------------------

  public getId() { return this.id; }
  public setId(id: string)
  {
    // Id can only be set once.
    if (this.id !== null)
    {
      ERROR("Attempt to set id of entity " + this.getErrorIdString
        + " that already has an id. Id is not set");
      return;
    }

    this.id = id;
  }

  // ---------------- Public methods --------------------

  // Compares entity to give entity reference by string ids.
  // (You should never compare two references directly, because
  //  there can be more than one reference for any single entity
  //  because references to entity proxies are used. Always use
  //  this method instead.) 
  public equals(entity: Entity)
  {
    if (entity === null || entity.isValid() === false)
    {
      ERROR("Attempt to compare entity " + this.getErrorIdString()
        + " to an invalid entity");
      return false;
    }

    if (this.isValid() === false)
    {
      ERROR("Attempt to compare entity " + entity.getErrorIdString()
        + " to invalid entity " + this.getErrorIdString());
      return false;
    }

    return this.getId() === entity.getId(); 
  }

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'dynamicCast()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  public dynamicCast<T>(typeCast: { new (...args: any[]): T })
  {
    ERROR("Entity.dynamicCast() function should never be called."
      + " You somehow managed to get your hands on direct reference"
      + " to entity instead of a proxy. That must never happen");

    return null;
  }

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'dynamicTypeCheck()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  private dynamicTypeCheck<T>(type: { new (...args: any[]): T })
  {
    ERROR("Entity.dynamicTypeCheck() function should never be called."
      + " You somehow managed to get your hands on direct reference"
      + " to entity instead of a proxy. That must never happen");

    return false;
  }

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'isValid()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  public isValid(): boolean
  {
    ERROR("Entity.isValid() function should never be called. You"
      + " somehow managed to get your hands on direct reference to"
      + " entity " + this.getErrorIdString() + " instead of a proxy."
      + " That must never happen");

    return false;
  }

  // Overrides AutoSaveableObject.getSaveDirectory().
  protected getSaveDirectory(): string
  {
    return './data/entities/';
  }

  protected getSaveFileName(): string
  {
    let idIsValid = this.getId() !== null
                 && this.getId() !== undefined
                 && this.getId() !== "";

    if (!idIsValid)
    {
      ERROR("Unable to compose save directory, because"
        + " entity " + this.getErrorIdString() + " has"
        + " an invalid id");
      return null;
    }

    return this.getId() + '.json';
  }

  // Overrides AutoSaveableObject.save() to skip saving
  // if entity has been deleted.
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

  // Returns something like 'Connection (id: d-imt2xk99)'
  // (indended for use in error messages).
  public getErrorIdString()
  {
    if (this.getId() === null)
      return "{ className: " + this.className + ", id: null }";

    return "{ className: " + this.className + ", id: " + this.getId() + " }";
  }

  /// Tohle možná nepoužiju - entity nejspíš budou do listů přidávat
  /// různé funkce podle aktuální potřeby... 
  /*
  // Entity adds itself to approptiate EntityLists so it can be
  // searched by name, etc. This doesn't add entity to EntityManager.
  // (this method needs to be overriden by descendants)
  public addToLists() { }
  */

  // Entity removes itself from EntityLists so it can no longer
  // be searched by name, etc. This doesn't remove entity from EntityManager.
  // (this method needs to be overriden by descendants)
  public removeFromLists() {}

  // --------------- Protected methods ------------------

  // This method exists only to prevent accidental
  // delcaring of 'then' property. See error message
  // inside this method for more info.
  protected then()
  {
    FATAL_ERROR("Attempt to access 'then' property"
      + " of entity " + this.getErrorIdString() + "."
      + " Property 'then' is accessed by async functions"
      + " when their returun value in order to check if"
      + " return value is already a Promise or it needs"
      + " to be promisified. It's an ugly hack, but it"
      + " forces us never to use property named 'then'");
  }
}