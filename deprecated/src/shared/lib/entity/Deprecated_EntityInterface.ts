
import {NameCathegory} from '../../../shared/lib/entity/NameCathegory';

export interface EntityInterface
{
  /*
  public static get ID_PROPERTY()         { return 'id'; }
  public static get NAME_PROPERTY()             { return "name"; }
  public static get PROTOTYPE_ENTITY_PROPERTY() { return "prototypeEntity"; }
  private static get INSTANCE_IDS_PROPERTY()    { return "instanceIds"; }
  */

  // ----------------- Private data ----------------------

  prototypeName: string;

  /*
  public static isValid(entity: Entity)
  {
    return entity !== null
        && entity !== undefined
        // This will be trapped by EntityProxyHandler.
        && entity.isValid() === true;
  }*/

  // --------------- Public accessors -------------------

  getName();

  // -> Returns 'false' if name isn't available.
  setName
  (
    name: string,
    cathegory: NameCathegory,
    // This should only be 'false' if you have created
    // a name lock file prior to calling setName().
    createNameLock
  );

  getNameCathegory(): NameCathegory;

  getId(): string;

  // -> Returns 'true' on success, 'false' on failure.
  setId(id: string): boolean;

  getPrototypeEntity(): EntityInterface;

  setPrototypeEntity
  (
    prototypeEntity: EntityInterface,
    isPrototype: boolean
  );

  getInstanceIds(): Set<string>;

  getDescendantIds(): Set<string>;

  hasDescendant(entity: EntityInterface): boolean;

  isPrototypeEntity(): boolean;

  // Called after an entity is saved to file.
  postSave();

  // Called after an entity is loaded from file.
  postLoad();

  isPrototype(): boolean;

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'dynamicCast()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  dynamicCast<T>(typeCast: { new (...args: any[]): T }): T;

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'isValid()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  isValid(): boolean;

  // Returns something like 'Connection (id: d-imt2xk99)'
  // (indended for use in error messages).
  getErrorIdString(): string;

  // Entity adds itself to all relevant lists (except to Entities)
  // so it can be searched for by name, abbreviations, etc.
  // (this method needs to be overriden by descendants).
  addToLists();

  // Entity removes itself from all lists (except from Entities)
  // so it can no longer be searched for by name, abbreviations, etc.
  // (this method needs to be overriden by descendants).
  removeFromLists();
}