/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember it's EntityId.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';
import {NamedClass} from '../../shared/NamedClass';
import {SaveableObject} from '../../shared/fs/SaveableObject';
import {AutoSaveableObject} from '../../shared/fs/AutoSaveableObject';
import {Server} from '../../server/Server';

/*
/// TODO: Hmm, takhle asi ne. Bude se to savovat na disk, takze tu asi
/// muze byt jen informace VALID/DELETED, protoze idcko muze byt savnute
/// mnohokrat a pri loadu by se mohl loadnout nejakej divnej state.
/// - a vubec nejlepsi asi bude, kdyz to udelam proste jako bool.
enum State
{
  // Entity has been instantiated but neither loaded from file
  // nor initiated manually.
  NOT_LOADED,
  // Entity is loaded from disk and valid (not deleted).
  VALID,
  // Entity has been deleted from both memory and disk, you can't access
  // it anymore.
  DELETED
}
*/

export class Entity extends AutoSaveableObject
{
  /*
  // Enum cannot be declared inside a class in current version of Typescript,
  // but it can be assigned as static class variable. This allows using
  // Entity.State as if enum had been declared right here.
  // (Note that this enum is actually used in EntityId, not here in Entity.
  //  it's because id might still persist in save files even if entity itself
  //  had been deleted.)
  public static State = State;
  */

  public static get ENTITY_REFERENCE_CLASS_NAME()
  {
    return 'Reference';
  }

  // ----------------- Private data ----------------------

  ///private id: EntityId = null;
  private id: string = null;
  // Property 'id' is not saved to file, because it is saved
  // as the name of the saved file (like 7-iu5by22s.json).
  private static id = { isSaved: false };

  /*
  Mozna spis jinak:
  - parametrem konstruktoru bude id.
      Kdyz dostanu id (nebude undefined), tak to znamena, ze se budu
    pod timhle idckem loadovat.
      Kydz id nedostanu, tak se vytvari nova entita.
  - hmm, pujde to takhle, kdyz se volaji konstruktory dynamickych class?
  */
  /*
    Tak nakonec ani to ne. Entity vyrabi EntityManager. Holt se musim
    spolehnout, ze nikdo nebude delat veci jako new Entity();
  */
  /*
  constructor(id: string)
  {
    super();

    if (id === undefined)
    {
      // We are creating a new instance of entity. A new id will be generated.
      this.id = null;
    }
    else
    {
      // We are loading an existing entity. Existing id will be used.
      this.id = id;
    }

    // Constructor of Entity dosn't return the entity but rather a javascript
    // proxy object through which the entity is accessed.
    return Server.entityManager.add(this);
  }
  */

  // ------------- Public static methods ----------------

  // -> If loading fails, result.jsonObject will be null.
  public static async loadJsonOject(id: string)
  {
    // Return value of this method.
    let result = { jsonObject: null, className: null };

    let path = Entity.getSavePath(id);

    // First we load data from file into generic (untyped)
    // javascript Object.
    result.jsonObject = await SaveableObject.loadJsonObjectFromFile(path);

    // Then we extract 'className' property from jsonObject
    // that we have just loaded, so we know what class do we
    //  need to create an instance of.
    result.className = result.jsonObject[NamedClass.CLASS_NAME_PROPERTY]; 

    if (result.className === null || result.className === undefined)
    {
      ERROR("Invalid or missing className in " + path + "."
        + " Unable to load entity");
      result.className = null
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

  public saveReferenceToJsonObject()
  {
    let jsonObject =
    {
      // No class 'Reference' actually exists. When this record
      // is loaded, an entity proxy is created.
      className: Entity.ENTITY_REFERENCE_CLASS_NAME,
      id: this.getId()
    };

    return jsonObject;
  }

  // Overrides AutoSaveableObject.getSaveDirectory().
  protected getSaveDirectory(): string
  {
    /*
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
    */

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

  /*
  // Constructs a save directory for an entity of type 'className'
  // by appending it to 'rootDirectory' (which should be something
  // like './data/prototypes/')
  // -> Returns 'null' if path cannot be composed.
  public static getPrototypeSaveDirectory
  (
    className: string,
    rootDirectory: string
  )
  {
    let PrototypeClass = Server.classFactory.getClass(className);

    /// let errorPath =
    ///  rootDirectory + "_SAVE_PATH_CREATION_ERROR/" + className + "/";

    if (PrototypeClass === undefined)
    {
      /// ERROR("Unable to compose prototype save path for"
      ///   + " prototype '" + className + "' because dynamic"
      ///   + " class '" + className + "' doesn't exist. Prototype"
      ///   + " will be saved to " + errorPath + " instead");
      /// return errorPath;

      ERROR("Unable to compose prototype save path for"
        + " prototype '" + className + "' because dynamic"
        + " class '" + className + "' doesn't exist");
      return null;
    }

    if (PrototypeClass['getSaveSubDirectory'] === undefined)
    {
      /// ERROR("Unable to compose prototype save path for"
      ///   + " prototype '" + className + "' because dynamic"
      ///   + " class '" + className + "' doesn't have static"
      ///   + " method 'getSaveSubDirectory'. Prototype will"
      ///   + " be saved to " + errorPath + " instead");
      /// return errorPath;

      ERROR("Unable to compose prototype save path for"
        + " prototype '" + className + "' because dynamic"
        + " class '" + className + "' doesn't have static"
        + " method 'getSaveSubDirectory'");
      return null;
    }

    return rootDirectory + PrototypeClass.getSaveSubDirectory();
  }

  protected static getSaveSubDirectory()
  {
    // We return empty string, because it will be added to
    // './data/entities/' or to './data/prototypes/'. only
    // our descendants (like Account) create subdirectories
    // (like './data/entities/Account').
    return "";
  }
  */

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

  // Entity adds itself to approptiate IdList
  // (so it can be searched by name, etc).
  // Note:
  //   This method is overriden by descendants which are inserted to IdList.
  public addToIdList() { }

  // --------------- Protected methods ------------------

  /*
  // This is used for creating save file names.
  protected getIdStringValue(): string
  {
    return this.id.getStringId();
  }
  */

  /*
  protected getPrototypeSaveDirectory(): string
  {
    /// TODO: Možná ten prefix schovat na nějaké lepší místo...
    /// (třeba k hashmapě, která bude mapovat idčka na entity)
    return Entity.getPrototypeSaveDirectory(this.className, './data/entities/');
  }
  */

  /*
  protected getSaveFileName(): string
  {
    return this.id + '.json';
  }
  */

  /*
  protected getSaveDirectory(): string
  {
    // This trick dynamically accesses static class variable.
    // (so it's the same as AutoSaveableOcject.SAVE_DIRECTORY,
    //  but when this method is called from for example Room,
    //  it will mean Room.SAVE_DIRECTORY)
    let saveDirectory = this.constructor['SAVE_DIRECTORY'];

    if (!ASSERT(saveDirectory !== undefined,
      "Missing static SAVE_DIRECTORY property on class " + this.className))
    {
      // If static variable SAVE_DIRECTORY is missing,, data will be saved
      // to directory './data/_MISSING_SAVE_DIRECTORY_ERROR'.
      return "./data/_MISSING_SAVE_DIRECTORY_ERROR";
    }

    return saveDirectory
  }

  
  /// Pozn: V GameEntity je to přetížené a vrací to idčko pro neunikátní
  /// entity a jméno pro unikátní
  /// TODO: Z GameEntity to zrušit a dát to sem (nebo ještě lépe do statické
  /// metody)
  protected getSaveFileName(): string
  {
    return this.getIdStringValue() + ".json";
  }
  */

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