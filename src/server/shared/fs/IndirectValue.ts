/*
  Part of BrutusNEXT

  Auxiliary class that saves and loads properties that
   cannot be direcly saved to JSON.
*/

/*
  Some data types, like Map or Date, can't be save to JSON file
  direcly, they need to be converted to string or Array respectively.
    By doing so, however, we loose type information - string is
  a primitive value, not a Date object. We could read type information
  from an object we are saving into, bud it wouldn't work for properties
  with 'null' value, because if you assing 'null' into a property, you
  loose type information as well.
    So instead of saving string (or Array, etc.) directly, we instead
  create and save a dummy SaveableObject with fake 'className' property
  (because you can't declare another class Date or Map) and read type
  information from it when loading JSON back to memory. 

  Another special case is reference to an Entity (any object inherited
  from class Entity). Entity references are not saved directly like
  regular javascript Objects (by saving all its properties), because
  that would often lead to endless cycles that cannot be saved to JSON.
  So instead we only save a string 'id' of an entity and recreate the
  reference when loading from JSON.
    That makes it the same case as with Dates and Maps, however, because
  'id' is a string and we wouldn't know that an entity reference needs to
  be re-created. Instead, a dummy SaveableObject with className 'Reference'
  is created and saved so we know that we need to recreate an entity
  reference when loading it.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';
import {NamedClass} from '../../shared/NamedClass';
import {Entity} from '../../shared/entity/Entity'; 
import {SaveableObject} from '../../shared/fs/SaveableObject';

export class IndirectValue
{
  // ---------------- Public methods --------------------

  // -> Returns a SaveableObject which saves Set to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Set' and property 'set' containing
  //      an Array representation of set contents.  
  public static createSetSaver(set: Set<any>)
  {
    if (set === null)
    {
      FATAL_ERROR("Null set");
      return;
    }

    let saveableObject = new SaveableObject();

    // Set is saved as it's Array representation to property 'set'.
    saveableObject['set'] = IndirectValue.saveSetToArray(set);

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Set' instead of 'SaveableObject'.
    return IndirectValue.createSaveableProxy(saveableObject, 'Set');
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

    let saveableObject = new SaveableObject();

    // Map is saved as it's Array representation to property 'map'.
    saveableObject['map'] = IndirectValue.saveMapToArray(map);

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Map' instead of 'SaveableObject'.
    return IndirectValue.createSaveableProxy(saveableObject, 'Map');
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

    let saveableObject = new SaveableObject();

    // Date is saved as it's JSON string representation to property 'date'.
    saveableObject['date'] = date.toJSON();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Date' instead of 'SaveableObject'.
    return IndirectValue.createSaveableProxy(saveableObject, 'Date');
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

    let saveableObject = new SaveableObject();

    // Entity is saved as it's string id to property 'id'.
    saveableObject['id'] = entity.getId();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Reference' instead of 'SaveableObject'.
    return IndirectValue.createSaveableProxy(saveableObject, 'Reference');
  }

  public static isDate(jsonObject: Object): boolean
  {
    if (IndirectValue.objectValidityCheck(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Date'?
    if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] === 'Date')
      return true;

    return false;
  }

  public static isSet(jsonObject: Object): boolean
  {
    if (IndirectValue.objectValidityCheck(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Set'?
    if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] === 'Set')
      return true;

    return false;
  }

  public static isMap(jsonObject: Object): boolean
  {
    if (IndirectValue.objectValidityCheck(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Map'?
    if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] === 'Map')
      return true;

    return false;
  }

  public static isReference(jsonObject: Object): boolean
  {
    if (IndirectValue.objectValidityCheck(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object with value
    // 'Reference'?
    if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] === 'Reference')
      return true;

    return false;
  }

  // ---------------- Private methods -------------------

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

  // -> Returns a Proxy object that traps access to 'className' property
  //      on 'object' to return 'className' param instead of original value. 
  private static createSaveableProxy(object: SaveableObject, className: string)
  {
    // This function will be passed to Proxy handler as it's 'get' trap.
    let get = function(target: any, property: any)
    {
      // Here we are trapping access to 'className' property.
      if (property === 'className')
        // Which will return our parameter 'className' instead
        // of target's 'className'.
        return className;

      // Any other property access is just forwarded to the proxified object.
      return target[property];
    }

    // Create a new Proxy what will trap acces to 'object' using object
    // passed as second parameter as proxy handler (it will trap access
    // to object's properties using our 'get' function).
    return new Proxy(object, { get: get })
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
}