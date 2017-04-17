/*
  Part of BrutusNEXT

  Auxiliary static class that serializes data types to JSON.
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
import {Nameable} from '../../../shared/lib/class/Nameable';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity'; 

export class JsonSaver
{
  // These are 'dummy' class names. They are only written to JSON
  // but they don't really exists in code (Date, Set and Map are
  // build-in javascript classes, Bitvector translates to a FastBitArray
  // class and Reference is not a class at all but a reference to
  // an Entity.
  public static get BITVECTOR_CLASS_NAME() { return 'Bitvector'; }
  public static get DATE_CLASS_NAME()      { return 'Date'; }
  public static get SET_CLASS_NAME()       { return 'Set'; }
  public static get MAP_CLASS_NAME()       { return 'Map'; }
  public static get REFERENCE_CLASS_NAME() { return 'Reference'; }

  // These special property names are only written to serialized data.
  // For example 'map' property holds an Array that represents serialized
  // data of a Map object.
  public static get BITVECTOR_PROPERTY()   { return 'bitvector'; }
  public static get DATE_PROPERTY()        { return 'date'; }
  public static get MAP_PROPERTY()         { return 'map'; }
  public static get SET_PROPERTY()         { return 'set'; }

  // ---------------- Public methods --------------------

  // -> Returns a SaveableObject which saves Set to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Set' and property 'set' containing
  //      an Array representation of Set contents.  
  public static createSetSaver(set: Set<any>)
  {
    if (set === null)
    {
      FATAL_ERROR("Null set");
      return;
    }

    let saver = new Serializable();

    // Set is saved as it's Array representation to property 'set'.
    saver[JsonSaver.SET_PROPERTY] = this.saveSetToArray(set);

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Set' instead of 'Serializable'.
    return this.createSaveProxy(saver, JsonSaver.SET_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves Map to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Map' and property 'map' containing
  //      an Array representation of hashmap contents.  
  public static createMapSaver(map: Map<any, any>)
  {
    if (map === null)
    {
      FATAL_ERROR("Null map");
      return;
    }

    let saver = new Serializable();

    // Map is saved as it's Array representation to property 'map'.
    saver[JsonSaver.MAP_PROPERTY] = this.saveMapToArray(map);

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Map' instead of 'Serializable'.
    return this.createSaveProxy(saver, JsonSaver.MAP_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves FastBitSet to Json
  //      object (using it's saveToJsonObject()) as a special object
  //      with className 'Bitvector' and property 'bitvector' containing
  //      a string represenation of FastBitSet object.
  public static createBitvectorSaver(bitvector: Date)
  {
    if (bitvector === null)
    {
      FATAL_ERROR("Null bitvector");
      return;
    }

    let saver = new Serializable();

    // Date is saved as it's JSON string representation to property 'date'.
    saver[JsonSaver.BITVECTOR_PROPERTY] = bitvector.toJSON();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Bitvector' instead of 'Serializable'.
    return this.createSaveProxy(saver, JsonSaver.BITVECTOR_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves Date to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Date' and property 'date' containing
  //      a string represenation of Date object.  
  public static createDateSaver(date: Date)
  {
    if (date === null)
    {
      FATAL_ERROR("Null date");
      return;
    }

    let saver = new Serializable();

    // Date is saved as it's JSON string representation to property 'date'.
    saver[JsonSaver.DATE_PROPERTY] = date.toJSON();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Date' instead of 'Serializable'.
    return this.createSaveProxy(saver, JsonSaver.DATE_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves Entity to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Reference' and property 'id' containing
  //      an Array representation of hashmap contents.  
  public static createEntitySaver(entity: Entity)
  {
    if (entity === null)
    {
      FATAL_ERROR("Null entity");
      return;
    }

    let saver = new Serializable();

    // Entity is saved as it's string id to property 'id'.
    saver[Entity.ID_PROPERTY] = entity.getId();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Reference' instead of 'Serializable'.
    return this.createSaveProxy(saver, JsonSaver.REFERENCE_CLASS_NAME);
  }

  // ---------------- Private methods -------------------

  // -> Returns an Array representation of Set object.
  private static saveBitvectorToArray(bitvector: any): Array<any>
  {
    if (!('array' in bitvector))
    {
      ERROR('Attempt to save bitvector to array that is'
        + ' not of type FastBitSet. Empty array is saved');
      return [];
    }

    // FastBitSet already contains method to convert bitvector to Array,
    // so we just call it.
    return bitvector.array();
  }

  // -> Returns an Array representation of Set object.
  private static saveSetToArray(set: Set<any>): Array<any>
  {
    let result = [];

    for (let entry of set.values())
      result.push(entry);
    
    return result;
  }

  // -> Returns an Array representation of Map object.
  private static saveMapToArray(map: Map<any, any>): Array<any>
  {
    let result = [];

    for (let entry of map.entries())
      result.push(entry);
    
    return result;
  }

//+
  // -> Returns a Proxy object that traps access to 'className' property
  //      on 'object' to return 'className' param instead of original value. 
  private static createSaveProxy(saver: Serializable, className: string)
  {
    // This function will be passed to Proxy handler as it's 'get' trap.
    let get = function(target: any, property: any)
    {
      // Here we are trapping access to 'className' property.
      if (property === Nameable.CLASS_NAME_PROPERTY)
        // Which will return our parameter 'className' instead
        // of target's 'className'.
        return className;

      // Any other property access is just forwarded to the proxified object.
      return target[property];
    }

    // Create a new Proxy what will trap acces to 'object' using object
    // passed as second parameter as proxy handler (it will trap access
    // to object's properties using our 'get' function).
    return new Proxy(saver, { get: get })
  }

  private static objectValidityCheck(jsonObject: Object): boolean
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
}