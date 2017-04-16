/*
  Part of BrutusNEXT

  Auxiliary static class that deserializes data types from JSON.
*/

/*
  Some data types, like Map or Date need to be converted to string or
  Array before serializing to JSON.
    By doing so, however, we loose type information - string is
  a primitive value, not a Date object. We could read type information
  from an object we are saving into, bud it wouldn't work for properties
  with 'null' value, because if you assing 'null' into a property, you
  loose type information as well.
    So instead of saving string (or Array, etc.) directly, we instead
  create and save a dummy Serializable object with fake 'className'
  property (because you can't declare another class Date or Map) and read
  type information from it when deserializing back from JSON. 

  Another special case is a reference to an Entity (any object inherited
  from class Entity). Entity references are not saved directly like
  regular javascript Objects (by saving all its properties), because
  that would often lead to endless cycles that cannot be saved to JSON.
  So instead we only save a string 'id' of an entity and recreate the
  reference when loading from JSON.
    That makes it the same case as with Dates and Maps, however, because
  'id' is a string and we wouldn't know that an entity reference needs to
  be re-created. Instead, a dummy Serializable object with 'className'
  'Reference' is created and saved so we know that we need to recreate
  an entity reference when loading it.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {SharedUtils} from '../../../shared/lib/utils/SharedUtils';
import {Nameable} from '../../../shared/lib/class/Nameable';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {JsonSaver} from '../../../shared/lib/json/JsonSaver';
///import {SaveableObject} from '../../../server/lib/fs/SaveableObject';

// 3rd party modules.
let FastBitSet = require('fastbitset');

export class JsonLoader
{
  // ---------------- Public methods --------------------
  /*
  // Reads property 'prototypeId' from 'jsonObject',
  // handles possible errors.
  public static getPrototypeId(jsonObject: Object, path: string = null): string
  {
    /// TODO
    /// - Čtení 'prototypeId' z jsonObjectu

    if (jsonObject === null || jsonObject === undefined)
    {
      let pathString = this.composePathString(path);

      ERROR("Invalid json object" + pathString);
      return null;
    }

    /// Proč je PROTOTYPE_ID_PROPERTY proboha ve ScriptableEntity?
    /// TODO: Dát to někam jinam.
    let prototypeId = jsonObject[ScriptableEntity.PROTOTYPE_ID_PROPERTY]; 

    if (prototypeId === undefined || prototypeId === null)
    {
      ERROR("Missing or uninitialized property 'prototypeId' in file"
        + " " + path + ". Entity is not loaded");
      return null;
    }

    return prototypeId;
  }

  // Attempts to convert 'param.sourceProperty' to FastBitSet object.
  // -> Returns 'null' if 'param'.sourceVariable is not a bitvector
  //    record or if loading failed.
  public static readAsBitvector(param: Serializable.ReadParam)
  {
    if (!this.isBitvectorRecord(param.sourceProperty))
      return null;

    if (!Utils.isBitvector(param.targetProperty))
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to load bitvector property '" + param.propertyName + "'"
        + pathString + " to a non-bitvector property");
      return null;
    }

    return this.readBitvector(param);
  }

  // Attempts to convert 'param.sourceProperty' to Date object.
  // -> Returns 'null' if 'param'.sourceVariable is not a Date
  //    record or if loading failed.
  public static readAsDate(param: Serializable.ReadParam)
  {
    if (!this.isDateRecord(param.sourceProperty))
      return null;

    if (!Utils.isDate(param.targetProperty))
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to load Date property '" + param.propertyName + "'"
        + pathString + " to a non-Date property");
      return null;
    }

    return this.readDate(param);
  }

  // Attempts to convert 'param.sourceProperty' to Set object.
  // -> Returns 'null' if 'param'.sourceVariable is not a Set
  //    record or if loading failed.
  public static readAsSet(param: Serializable.ReadParam)
  {
    if (!this.isSetRecord(param.sourceProperty))
      return null;

    if (!Utils.isSet(param.targetProperty))
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to load Set property '" + param.propertyName + "'"
        + pathString + " to a non-Set property");
      return null;
    }

    return this.readSet(param);
  }

  // Attempts to convert 'param.sourceProperty' to Map object.
  // -> Returns 'null' if 'param'.sourceVariable is not a Map
  //    record or if loading failed.
  public static readAsMap(param: Serializable.ReadParam)
  {
    if (!this.isMapRecord(param.sourceProperty))
      return null;

    if (!Utils.isMap(param.targetProperty))
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to load Map property '" + param.propertyName + "'"
        + pathString + " to a non-Map property");
      return null;
    }

    return this.readMap(param);
  }

  // Attempts to convert 'param.sourceProperty' to the reference
  // to an Entity.
  // -> Returns 'null' if 'param'.sourceVariable is not an entity
  //    reference record or if loading failed.
  public static readAsEntityReference(param: Serializable.ReadParam)
  {
    if (!this.isReference(param.sourceProperty))
      return null;

    return this.readEntityReference(param);
  }

  // Attempts to convert 'param.sourceProperty' to Array.
  // -> Returns 'null' if 'param'.sourceVariable is not an
  //    Array or if loading failed.
  public static readAsArray(param: Serializable.ReadParam)
  {
    if (!Array.isArray(param.sourceProperty))
      return null;

    if (!Array.isArray(param.targetProperty))
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to load Array property '" + param.propertyName + "'"
        + pathString + " to a non-Array property");
      return null;
    }

    return this.readArray(param);
  }

  // ---------------- Private methods -------------------

  private static isBitvector(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Bitvector'?
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY] === 'Bitvector')
      return true;

    return false;
  }

  // Checks if 'param.sourceProperty' represents a saved FastBitSet object.
  private static isBitvectorRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Bitvector'?
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY] === 'Bitvector')
      return true;

    return false;
  }

  // Checks if 'param.sourceProperty' represents a saved Date object.
  private static isDateRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Date'?
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY] === 'Date')
      return true;

    return false;
  }

  // Checks if 'param.sourceProperty' represents a saved Set object.
  private static isSetRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Set'?
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY] === 'Set')
      return true;

    return false;
  }

  // Checks if 'param.sourceProperty' represents a saved Map object.
  private static isMapRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Map'?
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY] === 'Map')
      return true;

    return false;
  }

  // Checks if 'param.sourceProperty' represents a saved reference to
  // an entity.
  private static isReference(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object with value
    // 'Reference'?
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY] === 'Reference')
      return true;

    return false;
  }

  // Converts 'param.sourceProperty' to a FastBitSet object.
  private static readBitvector(param: Serializable.ReadParam)
  {
    if (!param.sourceProperty)
      return null;

    let bitvector = param.sourceProperty[JsonSaver.BITVECTOR_PROPERTY];

    if (bitvector === undefined || bitvector === null)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Missing or invalid 'bitvector' property when loading bitvector"
        + " record '" + param.propertyName + "'" + pathString);
      return null;
    }

    return new FastBitSet(bitvector);
  }

  // Converts 'param.sourceProperty' to a Date object.
  private static readDate(param: Serializable.ReadParam): Date
  {
    if (!param.sourceProperty)
      return null;

    let date = param.sourceProperty[JsonSaver.DATE_PROPERTY];

    if (date === undefined || date === null)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Missing or invalid 'date' property when loading date record"
        + " '" + param.propertyName + "'" + pathString);
      return null;
    }

    return new Date(date);
  }

  // Converts 'param.sourceProperty' to a Set object.
  private static readSet(param: Serializable.ReadParam): Set
  {
    if (!param.sourceProperty)
      return null;

    let set = param.sourceProperty[JsonSaver.SET_PROPERTY];

    if (set === undefined || set === null)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Missing or invalid 'set' property when loading set record"
        + " '" + param.propertyName + "'" + pathString);
      return null;
    }

    return new Set(set);
  }

  // Converts 'param.sourceProperty' to a Map object.
  private static readMap(param: Serializable.ReadParam): Map<any, any>
  {
    if (!param.sourceProperty)
      return null;

    let map = param.sourceProperty[JsonSaver.MAP_PROPERTY];

    if (map === undefined || map === null)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Missing or invalid 'map' property when loading map record"
        + " '" + param.propertyName + "'" + pathString);
      return null;
    }

    return new Map(map);
  }

  // Converts 'param.sourceProperty' to a reference to an Entity.
  // If 'id' loaded from JSON already exists in EntityManager,
  // existing entity proxy will be returned. Otherwise an 'invalid'
  // entity proxy will be created and returned.
  // -> Retuns an entity proxy object (possibly referencing an invalid entity).
  private static readEntityReference(param: Serializable.ReadParam): Entity
  {
    if (!param.sourceProperty)
      return null;
    
    let id = param.sourceProperty[Entity.ID_PROPERTY];

    if (id === undefined || id === null)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Missing or invalid 'id' property when loading entity"
        + " reference '" + param.propertyName + "'" + pathString);
    }

    // Return an existing entity proxy if entity exists in
    // entityManager, invalid entity proxy otherwise.
    return App.entityManager.createReference(id);
  }

  // Converts 'param.sourceProperty' to Array.
  private static readArray(param: Serializable.ReadParam): Array<any>
  {
    if (!param.sourceProperty)
      return null;

    let sourceArray = param.sourceProperty;

    if (sourceArray === null || sourceArray === undefined)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to loadArray from invalid JSON property"
        + " '" + param.propertyName + "'" + pathString);
      return null;
    }
    
    if (!Array.isArray(sourceArray))
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to read Array from non-Array json property"
        + " '" + param.propertyName + "'" + pathString);
      return null;
    }

    let newArray = [];

    for (let i = 0; i < sourceArray.length; i++)
    {
      let item = this.readProperty
      (
        "Array Item",
        // We need to pass 'null' as 'variable' so an instance
        // of corect type will be created (by createNewIfNull()).
        null,
        sourceArray[i],
        path
      );

      newArray.push(item);
    }

    return newArray;
  }

  // // Loads a property of type Array from a JSON Array object.
  // private loadArray
  // (
  //   propertyName: string,
  //   jsonArray: Array<any>,
  //   path: string
  // )
  // {
  //   if (jsonArray === null || jsonArray === undefined)
  //   {
  //     let pathString = this.composePathString(path);

  //     ERROR("Attempt to loadArray from invalid jsonObject"
  //       + " '" + propertyName + "'" + pathString);
  //     return null;
  //   }
    
  //   if (!Array.isArray(jsonArray))
  //   {
  //     let pathString = this.composePathString(path);

  //     ERROR("Attempt to loadArray from non-array jsonObject"
  //       + " '" + propertyName + "'" + pathString);
  //     return null;
  //   }

  //   let newArray = [];

  //   for (let i = 0; i < jsonArray.length; i++)
  //   {
  //     let item = this.readProperty
  //     (
  //       "Array Item",
  //       // We need to pass 'null' as 'variable' so an instance
  //       // of corect type will be created (by createNewIfNull()).
  //       null,
  //       jsonArray[i],
  //       path
  //     );

  //     newArray.push(item);
  //   }

  //   return newArray;
  // }

  // -> Returns 'false' if 'jsonObject' is 'null' or 'undefined
  //    ('null' value is not considered an error, 'undefined' is).
  private static isObjectValid(jsonObject: Object): boolean
  {
    // Technically there can be a special record (entity reference,
    // date record or map record) saved with 'null' value, but in
    // that case we don't have to load it as special record, because
    // it will be null anyways.
    if (jsonObject === null)
      return false;

    if (jsonObject === undefined)
    {
      ERROR("Invalid jsonObject");
      return false;
    }

    return true;
  }

  // Auxiliary function used for error reporting.
  // -> Returns string informing about file location or empty string
  //    if 'path' is not available.
  private static composePathString(path: string)
  {
    if (path === null)
      return "";

    return " in file " + path;
  }
  */
}