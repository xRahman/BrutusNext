/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember id and to save
  and load to the file.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {EntityId} from '../shared/EntityId';
import {NamedClass} from '../shared/NamedClass';
import {SaveableObject} from '../shared/SaveableObject';
import {AutoSaveableObject} from '../shared/AutoSaveableObject';
import {Server} from '../server/Server';

export class Entity extends AutoSaveableObject
{
  public static get ID_PROPERTY() { return 'id'; }

  // ----------------- Private data ----------------------

  private id: EntityId = null;

  // ---------------- Static methods --------------------

  // Creates a new instance of game entity of type saved in id.
  static createInstanceFromId(id: EntityId, ...args: any[]): Entity
  {
    ASSERT_FATAL(id !== null,
      "Invalid (null) id passed to GameEntity::createInstance()");

    let newEntity = SaveableObject
      .createInstance({ className: id.getType(), typeCast: Entity }, args);

    newEntity.setId(id);

    return newEntity;
  }

  // --------------- Public accessors -------------------

  public getId() { return this.id; }
  public setId(id: EntityId) { this.id = id; }

  // ---------------- Public methods --------------------

  // Entity adds itself to approptiate IdList
  // (so it can be searched by name, etc).
  // Note:
  //   This method is overriden by descendants which are inserted to IdList.
  public addToIdList() { }

  // --------------- Protected methods ------------------

  // This is used for creating save file names.
  protected getIdStringValue(): string { return this.id.getStringId(); }

  // Overrides SaveableObject::loadPropertyFromJsonObject() to be
  // able to correctly save properties of type EntityId (or it's descendants).
  protected loadPropertyFromJsonObject
  (
    jsonObject: Object,
    propertyName: string,
    filePath: string
  )
  {
    if (this.isId(jsonObject[propertyName]))
    {
      // EntityId's are loaded in a special way because then need to be
      // registered by IdProvider.
      this.loadIdPropertyFromJsonObject
      (
        propertyName,
        jsonObject[propertyName],
        filePath
      );
    }
    else
    {
      // Other (non-id) properties are loaded the regular way.
      super.loadPropertyFromJsonObject(jsonObject, propertyName, filePath);
    }
  }

  // --------------- Private methods --------------------

  private isId(jsonObject: Object): boolean
  {
    // Technically there can be an id saved with a 'null' value,
    // but in that case we don't have to load it as EntityId, because
    // it will be null anyways.
    if (jsonObject === null)
      return false;

    if (!ASSERT(jsonObject !== undefined,
        "Invalid jsonObject"))
      return false;

    // Json objects don't have a type (they are plain javascript Objects),
    // so we can't use instanceOf. We could test className, but that wouldn't
    // work for ancestors of EntityId class (anyone who would inherit from
    // class EntityId would have to add a special case here), so instead we
    // check 'stringId' property which all ancestors of EntityId inherit.
    if (jsonObject[EntityId.STRING_ID_PROPERTY] === undefined)
      return false;

    return true;
  }

  private loadIdPropertyFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    filePath: string
  )
  {
    let stringId = jsonObject[EntityId.STRING_ID_PROPERTY];

    if (!ASSERT(stringId !== undefined && stringId !== null,
      "Errow while loading id from file " + filePath + ": Unable"
      + " to load id, because passed 'jsonObject' doesn't contain"
      + "property '" + EntityId.STRING_ID_PROPERTY + "'"))
      return null;

    let id = Server.idProvider.get(stringId);

    // If this id already exists in idProvider, we must not load it again.
    // (There must only be at most one id for each entity so it can
    // be used to track if entity exists).
    if (id !== undefined)
    {
      // Check that all properties of loaded id match existing id.
      id.checkAgainstJsonObject(jsonObject, filePath);

      // We are going to use existing id iven if loaded id doesn't
      // match perfecly (if there were errors, they have been
      // reported by id.checkAgainstJsonObject()).
      this[propertyName] = id;
      ///return id;
    }
    else
    {
      // This id doesn't exist in idProvider yet, so we need to
      // create a new instance of EntityId.
      this[propertyName] = SaveableObject.createInstance
      (
        {
          className: jsonObject[NamedClass.CLASS_NAME_PROPERTY],
          typeCast: EntityId
        }
      );

      // Load it from it from json object.
      this.loadPropertyFromJsonObject
      (
        jsonObject,
        propertyName,
        filePath
      );

      // And register it in idProvider.
      Server.idProvider.registerLoadedId(this[propertyName]);
    }
  }
}