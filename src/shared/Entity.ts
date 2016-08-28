/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember it's EntityId.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
///import {EntityId} from '../shared/EntityId';
import {SaveableObject} from '../shared/SaveableObject';
import {AutoSaveableObject} from '../shared/AutoSaveableObject';
import {Server} from '../server/Server';

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

  ///public static get ID_PROPERTY() { return 'id'; }
  public static get ENTITY_REFERENCE_CLASS_NAME()
  {
    return 'EntityReference';
  }

  // ----------------- Private data ----------------------

  ///private id: EntityId = null;
  private id: string = null;

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

  // --------------- Public accessors -------------------

  public getId() { return this.id; }
  ///public setId(id: EntityId) { this.id = id; }
  public setId(id: string) { this.id = id; }

  // ---------------- Public methods --------------------

  public dynamicCast<T>(type: { new (...args: any[]): T })
  {
    // Dynamic type check - we make sure that entity is inherited from
    // requested class (or an instance of the class itself).
    ASSERT_FATAL(this instanceof type,
      "Type cast error: Newly created entity "
      + "of type '" + this.className + "' is not an instance"
      + " of requested type (" + type.name + ")");

    // Here we typecast to <any> in order to pass entity
    // as type T (you can't typecast directly to template type but you can
    // typecast to <any> which is then automatically cast to template type).
    return <any>this;
  }

  public isValid(): boolean
  {
    // This function exists only for typescript to stop complaing
    // that it doesn't exist. It should never be called, however,
    // because 'isValid()' call should always be trapped by
    // entity proxy (see EntityProxyHandler.get()).
    ASSERT(false,
      "Entity.isValid() function should never be called");

    return false;
  }

  public saveIdToJsonObject()
  {
    let jsonObject =
    {
      // No class 'EntityReference' actually exists. When this record
      // is loaded, an entity proxy is created.
      className: Entity.ENTITY_REFERENCE_CLASS_NAME,
      type: this.className,
      id: this.getId()
    };

    return jsonObject;
  }

  // Constructs a save directory for an entity of type 'className'
  // by appending it to 'rootDirectory' (which should be something
  // like './data/prototypes/')
  public static getSaveDirectory(className: string, rootDirectory: string)
  {
    // Prototype classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];
    let PrototypeClass = dynamicClasses[className];
    let errorPath =
      rootDirectory + "_SAVE_PATH_CREATION_ERROR/" + className + "/";

    if (!ASSERT(PrototypeClass !== undefined,
      "Unable to compose prototype save path for prototype"
      + " '" + className + "' because dynamic class"
      + " '" + className + "' doesn't exist."
      + " Prototype will be saved to " + errorPath + " instead"))
      return errorPath;

    if (!ASSERT(PrototypeClass['getSaveSubDirectory'] !== undefined,
      "Unable to compose prototype save path for prototype"
      + " '" + className + "' because dynamic class"
      + " '" + className + "' doesn't have static method"
      + " 'getSaveSubDirectory'. Prototype will be saved"
      + " to " + errorPath + " instead"))
      return errorPath;

    return rootDirectory + PrototypeClass.getSaveSubDirectory();
  }

  protected static getSaveSubDirectory()
  {
    /// Prázdný string, protože se to přilepuje k './data/entities/' případně
    /// k './data/prototypes/' a až teprve potomci (např. Account nebo
    /// GameEntity) mají nějaké podadresáře (/Account).
    return "";
  }

  // Overrides AutoSaveableObject.save() to skip saving
  // if entity had been deleted.
  public async save()
  {
    /*
    // 'entityDeleted' flag is on id, not on entity (because id
    // may persist even after entity is deleted).
    if (!ASSERT(this.getId().isEntityDeleted() === false,
        "Attemp to save deleted entity " + this.getErrorIdString()))
      return;
    */

    if (!ASSERT(this.isValid(),
        "Attemp to save invalid entity " + this.getErrorIdString()))
      return;

    await this.saveToFile(this.getSaveDirectory(), this.getSaveFileName());
  }

  // Returns something like 'Connection (id: d-imt2xk99)'
  // (indended for use in error messages).
  public getErrorIdString()
  {
    if (this.getId() === null)
      return this.className;

    return this.className + " (id: " + this.getId() + ")";
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

  protected getSaveDirectory(): string
  {
    /// TODO: Možná ten prefix schovat na nějaké lepší místo...
    /// (třeba k hashmapě, která bude mapovat idčka na entity)
    return Entity.getSaveDirectory(this.className, './data/entities/');
  }

  protected getSaveFileName(): string
  {
    return this.id + '.json';
  }

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
}