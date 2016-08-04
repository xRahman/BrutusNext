/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember id and to save
  and load to the file.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {NamedClass} from '../shared/NamedClass';
import {SaveableObject} from '../shared/SaveableObject';
import {AutoSaveableObject} from '../shared/AutoSaveableObject';
import {Server} from '../server/Server';

export abstract class IdableObject extends AutoSaveableObject
{
  public static get ID_PROPERTY() { return 'id'; }

  // ----------------- Private data ----------------------

  private id: Id = null;

  // ---------------- Public methods --------------------

  public getId() { return this.id; }
  public setId(id: Id) { this.id = id; }

  // --------------- Protected methods ------------------

  // This is used for creating save file names.
  protected getIdStringValue(): string { return this.id.getStringId(); }

  // Overrides SaveableObject::loadPropertyFromJsonObject() to be
  // able to correctly save properties of type Id (or it's descendants).
  protected loadPropertyFromJsonObject
  (
    jsonObject: Object,
    propertyName: string,
    filePath: string
  )
  {
    if (this.isId(jsonObject[propertyName]))
    {
      // Id's are loaded in a special way because then need to be
      // registered by IdProvider.
      this.loadIdPropertyFromJsonObject
      (
        propertyName,
        this[propertyName],
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
    // but in that case we don't have to load it as Id, because
    // it will be null anyways.
    if (jsonObject === null)
      return false;

    if (!ASSERT(jsonObject !== undefined,
        "Invalid jsonObject"))
      return false;

    // Json object doesn't have a type (it's a plain javascript Object),
    // so we can't use instanceOf. We could test className, but that wouldn't
    // work for ancestors of Id class (anyone who would have inherited from
    // class Id would have to add a special case here), so instead we use
    // 'stringId' property which all ancestors of Id inherit.
    if (jsonObject[Id.STRING_ID_PROPERTY] === undefined)
      return false;

    return true;
  }

  private loadIdPropertyFromJsonObject
  (
    propertyName: string,
    myProperty: any,
    jsonObject: any,
    filePath: string
  )
  : Id
  {
    let stringId = jsonObject[Id.STRING_ID_PROPERTY];

    if (!ASSERT(stringId !== undefined && stringId !== null,
      "Errow while loading id from file " + filePath + ": Unable"
      + " to load id, because passed 'jsonObject' doesn't contain"
      + "property '" + Id.STRING_ID_PROPERTY + "'"))
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
      return id;
    }
    else
    {
      // This id doesn't exist in idProvider yet, so we need to
      // create a new id.
      id = SaveableObject.createInstance
      (
        {
          className: jsonObject[NamedClass.CLASS_NAME_PROPERTY],
          typeCast: Id
        }
      );

      // Load it from it from json object.
      id.loadFromJsonObject(jsonObject, filePath);

      // And register it in idProvider.
      Server.idProvider.registerLoadedId(id);
    }
  }
}