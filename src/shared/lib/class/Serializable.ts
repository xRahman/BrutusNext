/*
  Part of BrutusNEXT

  Allows serializing to and from JSON format.
*/

/*
  Note:
    Only saved properties are loaded. Properties that are not present in the
    save will not get overwritten. It means that you can add new properties
    to existing classes without converting existing save files (but you should
    initialize them with default values of course).

  Note:
    Only properties that exist on the class that is being loaded are loaded
    from save. It means that you can remove properties from existing classes
    without converting existing save files.
      This does not apply to primitive Javascript Object properties (including
    properties defined using a Typescript Interface) because we need to be able
    to create properties in empty Javascript Objects when we are loading Array
    items (which never exist prior to loading).

    (See deserialize() and deserializePlainObject() methods for details.) 
*/

/*
  Pozn:
    Momentálně se static properties checkují jen pro přímé properties
    Serializable instance. Tj. když do entity dám plain {}, tak u jeho
    properties nemůžu říct, jestli se mají serializovat a jak se mají
    editovat. Můžu ale místo něj udělat classu zděděnou ze Serializable,
    u té to opět říct můžu.

    Když bych to chtěl změnit, tak by to asi znamenalo do SerializeParam
    přidat staticAttributes, do kterých se budu rekurzivně zanořovat.
    (A samozřejmě tuhle funkcionalitu přidat do Attributable class).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Classes} from '../../../shared/lib/class/Classes';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {Attributable} from '../../../shared/lib/class/Attributable';

/// DEBUG:
///let Util = require('util');

// 3rd party modules.
let FastBitSet = require('fastbitset');

export class Serializable extends Attributable
{
  public static get ID_PROPERTY()         { return 'id'; }
  public static get VERSION_PROPERTY()    { return 'version'; }
  public static get CLASS_NAME_PROPERTY() { return 'className'; }

  // These are 'dummy' class names. They are only written to JSON
  // but they don't really exists in code (Date, Set and Map are
  // build-in javascript classes, Bitvector translates to a FastBitArray
  // class and Reference is not a class at all but a reference to
  // an Entity.
  private static get BITVECTOR_CLASS_NAME()   { return 'Bitvector'; }
  private static get DATE_CLASS_NAME()        { return 'Date'; }
  private static get SET_CLASS_NAME()         { return 'Set'; }
  private static get MAP_CLASS_NAME()         { return 'Map'; }

  // These special property names are only written to serialized data.
  // For example 'map' property holds an Array that represents serialized
  // data of a Map object.
  private static get BITVECTOR_PROPERTY()     { return 'bitvector'; }
  private static get DATE_PROPERTY()          { return 'date'; }
  private static get MAP_PROPERTY()           { return 'map'; }
  private static get SET_PROPERTY()           { return 'set'; }
  protected static get REFERENCE_CLASS_NAME() { return 'Reference'; }

  //----------------- Protected data --------------------

  // Version will be checked for. Default behaviour is to trigger
  // an ERROR when versions don't match. You can change it by
  // overriding a checkVersion() method.
  //   It is also a good idea to override 'version' property in
  // descendant classes and increment it when you change the properties.
  protected version = 0;

  // ---------------- Public methods --------------------

  public serialize(mode: Serializable.Mode): string
  {
    let jsonObject = this.saveToJsonObject(this, mode);

    if (jsonObject === undefined)
      return "";

    return JsonObject.stringify(jsonObject);
  }

  // Extracts data from plain javascript Object to this instance.
  // -> Returns 'null' on failure.
  public deserialize(jsonObject: Object, path: string = null)
  {
    // Check version and input data validity.
    if (!this.deserializeCheck(jsonObject, path))
      return null;

    // Copy all properties from 'jsonObject'.
    for (let propertyName in jsonObject)
    {
      if
      (
        // Property 'className' isn't assigned (it represents the
        // name of the javascript class which cannot be changed).
        propertyName !== Serializable.CLASS_NAME_PROPERTY
        // Only properties that exist on the class that is being loaded
        // are loaded from save. It means that you can remove properties
        // from existing classes without converting existing save files
        // (no syslog message is generated).
        && this[propertyName] !== undefined
      )
      {
        let param: DeserializeParam =
        {
          propertyName: propertyName,
          targetProperty: this[propertyName],
          sourceProperty: jsonObject[propertyName],
          path: path
        }

        // We are cycling over properties in JSON object, not in Serializable
        // that is being loaded. It means that properties that are not present
        // in the save will not get overwritten with 'undefined'. This allows
        // adding new properties to existing classes without the need to
        // convert all save files.
        this[propertyName] = this.deserializeProperty(param);
      }
    }

    return this;
  }

  public isProxy()
  {
    // If this entity is behind Proxy, EntityProxyHandler traps
    // acces to isProxy() and returns 'true'.
    return false;
  }

  // -------------- Protected methods -------------------

//+
  protected checkVersion(jsonObject: Object, path: string = null): boolean
  {
    if (!(Serializable.VERSION_PROPERTY in jsonObject))
    {
      let pathString = this.composePathString(path);

      ERROR("Missing '" + Serializable.VERSION_PROPERTY + "' property"
        + " in JSON data" + pathString);
      return false;
    }

    if (jsonObject[Serializable.VERSION_PROPERTY] !== this.version)
    {
      let pathString = this.composePathString(path);

      ERROR("Version of JSON data"
        + " (" + jsonObject[Serializable.VERSION_PROPERTY] + ")"
        + pathString + " doesn't match required version"
        + " (" + this.version + ")");
      return false;
    }

    return true;
  }

  // --------------- Private methods --------------------

  /// Tohle je nejspíš potřeba jen v Saveable (zatím si to tu nechám).
  // // This is just a generic async function that will finish
  // // when 'promise' parameter gets resolved.
  // // (This only makes sense if you also store 'resolve' callback
  // //  of the promise so you can call it to finish this awaiter.
  // //  See SavingRecord.addRequest() for example how is it done.)
  // private saveAwaiter(promise: Promise<void>)
  // {
  //   return promise;
  // }

  ///////////////////////////////////////////////////////
  ///////////////////// JsonSaver ///////////////////////
  ///////////////////////////////////////////////////////

//+
  // Creates a primitive Javascript Object and fills it with serialized
  // properties of 'this'. Data types that can't be directly serialized
  // to JSON (like Set or Map) are converted to their serializable
  // equivalents (Array, string, etc).
  //   Properties with static attribute matching given serialization 'mode'
  // set to 'false' are not serialized.
  // -> Returns 'undefined' if serialization fails.
  protected saveToJsonObject
  (
    instance: Serializable,
    mode: Serializable.Mode
  )
  : Object
  {
    let jsonObject: Object = {};

    // A little hack - save 'name' property first (out of order)
    // to make saved JSON files more readable.
    if ('name' in this)
      jsonObject['name'] = this['name'];

    // Anoter hack - save 'className'.
    // (There is no 'className' property on Serializable objects,
    //  it is used to save the name of the javascript class - which
    //  is the 'name' property of the class constructor.)
    jsonObject[Serializable.CLASS_NAME_PROPERTY] = this.getClassName();

    // Cycle through all properties in source object.
    for (let propertyName in instance)
    {
      // Skip 'name' property because it's already saved by hack.
      if (propertyName === 'name')
        continue;

      // Check if property is to be serialized in this serialization mode.
      if (!this.isToBeSerialized(propertyName, mode))
        continue;

      let serializeParam: SerializeParam =
      {
        sourceProperty: instance[propertyName],
        description: propertyName,
        className: instance.getClassName(),
        mode: mode
      }
      
      jsonObject[propertyName] =
        instance.serializeProperty(serializeParam);
    }

    return jsonObject;
  }

//+
  // Determines if property 'propertyName' is to be serialized
  // in given serializable 'mode'.
  private isToBeSerialized(propertyName: string, mode: Serializable.Mode)
  {
    // Access static variable named the same as property.
    let attributes = this.getPropertyAttributes(propertyName);

    // If static attributes for this property don't exist, it means
    // it should always be serialized.
    if (attributes === undefined)
      return true;

    // Default value is always 'true', so if for example attributs.saved
    // isn't defined (it's not 'false'), we will return 'true'.
    switch (mode)
    {
      case Serializable.Mode.SAVE_TO_FILE:
        return attributes.saved !== false;

      case Serializable.Mode.SEND_TO_CLIENT:
        return attributes.sentToClient !== false;

      case Serializable.Mode.SEND_TO_SERVER:
        return attributes.sentToServer !== false;

      case Serializable.Mode.SEND_TO_EDITOR:
        return attributes.edited !== false;

      default:
        ERROR('Unhandled Serializable.Mode');
        break;
    }

    // Once again, default value is 'true'.
    return true;
  }

  // Writes a single property to a corresponding JSON object.
  // -> Returns JSON Object representing 'param.sourceProperty'. 
  private serializeProperty(param: SerializeParam)
  {
    let property = param.sourceProperty;
    let mode = param.mode;

    if (property === null)
      return null;

    if (Utils.isPrimitiveType(property))
      // Primitive values (number, string, etc.) are just assigned.
      return property;

    if (Array.isArray(property))
      return this.serializeArray(param, property);

    // If there is an 'id' in the property, we treat it as Entity.
    if (property[Serializable.ID_PROPERTY] !== undefined)
      // Entities are saved to a separate files. Only a reference
      // (using a string id) to an entity will be saved.
      return this.createEntitySaver(property).saveToJsonObject(mode);

    // property is a Serializable object (but not an entity).
    if (this.isSerializable(property))
      return property.saveToJsonObject(mode);

    if (Utils.isDate(property))
      return this.createDateSaver(property).saveToJsonObject(mode);

    if (Utils.isMap(property))
      return this.createMapSaver(property).saveToJsonObject(mode);

    if (Utils.isBitvector(property))
      return this.createBitvectorSaver(property).saveToJsonObject(mode);

    if (Utils.isSet(property))
      return this.createSetSaver(property).saveToJsonObject(mode);

    if (Utils.isPlainObject(property))
      return this.serializePlainObject(property);

    ERROR("Property '" + param.description + "' in class"
      + " '" + param.className + "' (or inherited from one of it's"
      + " ancestors) is a class but is neither inherited from"
      + " Serializable nor has a type that we know how to save."
      + " Make sure that you only use primitive types (numbers,"
      + " strings, etc.), Arrays, primitive javascript Objects,"
      + " Dates, Maps or classes inherited from Serializable"
      + " as properties of classes inherited from Serializable."
      + " If you want a new type to be saved, you need to add this"
      + " functionality to Serializable.ts. Property is not saved");
    return null;
  }

  // ------------------------------------------------- //
  //          Data type serialization methods          //
  // ------------------------------------------------- //

//+
  // Saves a property of type Array to a corresponding JSON Array object.
  private serializeArray(param: SerializeParam, sourceArray: Array<any>)
  {
    let jsonArray = [];

    // To serialize an Array we need to serialize all of it's items.
    for (let i = 0; i < sourceArray.length; i++)
    {
      // Note: 'saved' static attribute is not tested for members of an array.
      // Either the whole array is saved, or it's not saved at all. Having
      // 'holes' in an array after loading (probably with <null> values) would
      // certainly be confusing.

      // Setup a new serialize param.
      let serializeParam: SerializeParam =
      {
        sourceProperty: sourceArray[i],
        description: "Array item [" + i + "]",
        className: param.className,
        mode: param.mode
      }

      jsonArray.push(this.serializeProperty(serializeParam));
    }

    return jsonArray;
  }

//+
  // The purpose of manual saving of properties of primitive Objects
  // is to determine if some of them are SaveableObjects so they need
  // to be saved using their saveToJsonObject() method.
  // (this check is done within this.saveVariable() call)
  private serializePlainObject(param: SerializeParam): Object
  {
    let sourceObject = param.sourceProperty;

    if (sourceObject === null)
      return null;
    
    /// Asi jsem byl zbytečně moc důsledný - plain Object snad nemá důvod
    /// být za proxy...
    /*
    // If 'property' is a proxy, 'for .. in' operator won't work on it,
    // because 'handler.enumerate()' which used to trap it has been
    // deprecated in ES7. So we have to use a hack - directly access
    // internal entity of proxy by trapping access to '_internalEntity'
    // property and use 'for .. in' operator on it.
    let sourceObject = variable;

    if (variable.isProxy === true)
      sourceObject = variable['_internalEntity'];
    */

    let jsonObject: Object = {};

    // Serialize all properties of sourceObject.
    for (let propertyName in sourceObject)
    {
      // Setup a new serialize param.
      let serializeParam: SerializeParam =
      {
        sourceProperty: sourceObject[propertyName],
        description: propertyName,
        className: 'Object',
        mode: param.mode
      }

      jsonObject[propertyName] = this.serializeProperty(serializeParam);
    }

    return jsonObject;
  }

  // ------------------------------------------------- //
  //                 Auxiliary methods                 //
  // ------------------------------------------------- //

//+
  private isSerializable(variable: any): boolean
  {
    return ('saveToJsonObject' in variable);
  }

  ///////////////////////////////////////////////////////
  ///////////////////// JsonLoader //////////////////////
  ///////////////////////////////////////////////////////

//+
  // Deserializes a single property from corresponding JSON object.
  // Converts from serializable format to original data type as needed
  // (for example Set class is saved to JSON as an Array so it has to be
  //  reconstructed here).
  private deserializeProperty(param: DeserializeParam): any
  {
    let result: any;

    // First handle the case that property in JSON has null value. In that
    // case target property will also be null, no matter what type it is.
    if (param.targetProperty === null)
      return null;

    // Attempt to load property as FastBitSet object.
    if (result = this.deserializeAsBitvector(param))
      return result;

    // Attempt to load property as Date object.
    if (result = this.deserializeAsDate(param))
      return result;

    // Attempt to load property as Set object.
    if (result = this.deserializeAsSet(param))
      return result;

    // Attempt to load property as Map object.
    if (result = this.deserializeAsMap(param))
      return result;

    // Attempt to load property as a reference to an Entity.
    if (result = this.deserializeAsEntityReference(param))
      return result;

    // Attempt to load property as Array
    if (result = this.deserializeAsArray(param))
      return result;

    // Attempt to load property as an object
    // (including custom classes).
    //   Note that this would also mean Dates, Arrrays and all other
    // nonprimitive types, so they must be handled before this.
    if (result = this.deserializeAsObject(param))
      return result;
    
    // If propety has neither of types we have just tried,
    // we load it as primitive type (primitive properties
    // are simply assigned).
    return param.sourceProperty;
  }

  // ------------------------------------------------- //
  //        Version and data checking methods          //
  // ------------------------------------------------- //

//+
  // Checks that version and className match and that 'jsonObject' isn't null.
  // -> Returns 'false' if check fails.
  private deserializeCheck
  (
    jsonObject: Object,
    path: string = null
  )
  : boolean
  {
    // Using 'in' operator on object with null value would cause crash.
    if (jsonObject === null)
    {
      let pathString = this.composePathString(path);

      // Here we need fatal error, because data might already
      // be partialy loaded so we could end up with broken entity.
      ERROR("Invalid JSON object" + pathString);
      return false;
    }

    // 'path' is passed just so it can be printed to error messages.
    if (!this.checkVersion(jsonObject, path))
      return false;

    // 'className' must be the same as it's saved value.
    if (!this.checkClassName(jsonObject, path))
      return false;

    return true;
  }

//+
  // Checks that 'jsonObject' contains property 'className'.
  private checkClassName(jsonObject: Object, path: string = null): boolean
  {
    let jsonClassName = jsonObject[Serializable.CLASS_NAME_PROPERTY];

    if (jsonClassName === undefined)
    {
      let pathString = this.composePathString(path);

      ERROR("There is no '" + Serializable.CLASS_NAME_PROPERTY + "'"
        + " property in JSON data" + pathString);
      return false;
    }

    if (jsonClassName !== this.getClassName())
    {
      let pathString = this.composePathString(path);

      ERROR("Attempt to load JSON data of class"
        + " (" + jsonObject[Serializable.CLASS_NAME_PROPERTY] + ")"
        + pathString + " into instance of different"
        + " class (" + this.getClassName() + ")");
      return false;
    }

    return true;
  }

  // ------------------------------------------------- //
  //   Following methods check serialized data and     //
  //   deserialize it if it matches their data type    //
  // ------------------------------------------------- //

//+
  // Attempts to convert 'param.sourceProperty' to FastBitSet object.
  // -> Returns 'null' if 'param'.sourceVariable is not a bitvector
  //    record or if loading failed.
  private deserializeAsBitvector(param: DeserializeParam)
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

//+
  // Attempts to convert 'param.sourceProperty' to Date object.
  // -> Returns 'null' if 'param'.sourceVariable is not a Date
  //    record or if loading failed.
  private deserializeAsDate(param: DeserializeParam)
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

//+
  // Attempts to convert 'param.sourceProperty' to Set object.
  // -> Returns 'null' if 'param'.sourceVariable is not a Set
  //    record or if loading failed.
  private deserializeAsSet(param: DeserializeParam)
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

//+
  // Attempts to convert 'param.sourceProperty' to Map object.
  // -> Returns 'null' if 'param'.sourceVariable is not a Map
  //    record or if loading failed.
  private deserializeAsMap(param: DeserializeParam)
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

//+
  // Attempts to convert 'param.sourceProperty' to the reference
  // to an Entity.
  // -> Returns 'null' if 'param'.sourceVariable is not an entity
  //    reference record or if loading failed.
  private deserializeAsEntityReference(param: DeserializeParam)
  {
    if (!this.isReference(param.sourceProperty))
      return null;

    return this.readEntityReference
    (
      param.sourceProperty,
      param.propertyName,
      this.composePathString(param.path)
    );
  }

//+
  // Attempts to convert 'param.sourceProperty' to Array.
  // -> Returns 'null' if 'param'.sourceVariable is not an
  //    Array or if loading failed.
  private deserializeAsArray(param: DeserializeParam)
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

//+
  // Attempts to convert 'param.sourceProperty' to a respective object.
  // -> Returns 'null' if 'param'.sourceVariable is not an object
  //    or if loading failed.
  private deserializeAsObject(param: DeserializeParam)
  {
    if (Utils.isPrimitiveType(param.sourceProperty))
      return null;

    if
    (
      param.targetProperty !== null
      && param.targetProperty !== undefined
      && Utils.isPrimitiveType(param.targetProperty)
    )
    {
      let pathString = this.composePathString(param.path);

      ERROR("Attempt to load nonprimitive property"
        + " '" + param.propertyName + "'" + pathString
        + " to a primitive property");
      return null;
    }

    return this.readObject(param);
  }

//+
  private readObject(param: DeserializeParam)
  {
    // If our corresponding property is null, it wouldn't be able to
    // load itself from JSON, because you can't call methods on null
    // object. So we first need to assign a new instance of correct
    // type to it - the type is saved in JSON as 'className' property.
    let instance = this.createNewIfNull(param);

    if (instance === null || instance === undefined)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Failed to instantiate property '" + param.propertyName + "'"
        + pathString);
      return null;
    }

    // Handle Serializable objects.
    if (this.isDeserializable(instance))
    {
      // If we are loading into a Serializable object, do it using it's
      // deserialize() method.
      instance.deserialize(param.sourceProperty, param.path);

      return instance;
    }

    if (!Utils.isPlainObject(instance))
    {
      ERROR("Attempt to deserialize a nonprimitive property which"
        + " is neither an instance of Serializable class nor a plain"
        + " Javascript Object. This means that you have a class inherited"
        + " from Serializable and you put a property in it which is"
        + " neither inherited from Serializable nor a special type"
        + " handler in Serializable.ts (like Set, Map, etc.). You either"
        + " have to exnted this property from Serializable or add code"
        + " to Serializable to handle it's serialization");
      return null;
    }

    // Update load 'param' so it contains possibly newly created {}.
    param.targetProperty = instance;

    // We are loading a primitive Javascript Object.
    return this.deserializePlainObject(param);
  }

  // -> Returns 'param.targetProperty' if it's not 'null'.
  //    Creates and returns a new instance otherwise
  //    (type is read from 'param.sourceProperty.className').
  private createNewIfNull(param: DeserializeParam)
  {
    let instance = param.targetProperty;

    // If the target property exists, we will be loading into it.
    if (instance !== null)
      return instance;

    // If target property doesn't exist, we have to create a new instance
    // (because 'null' has no properties so we can't call deserialize() on it).
    return this.createNew(param);
  }

  // Reads property 'className' from 'param.sourceProperty' and creates
  // an instance of that class.
  private createNew(param: DeserializeParam)
  {
    // Read class name from JSON.
    let className = param.sourceProperty[Serializable.CLASS_NAME_PROPERTY];

    // If there isn't a 'className' property in jsonObject,
    // we will load into a plain Object.
    if (className === undefined)
      return {};

    // Otherwise we create an instance of such class.
    //   We don't have to check if 'className' is an Entity class,
    // because entities are always serialized as a reference. So if
    // there is an instance of some Serializable class saved directly
    // in Json, it can't be an entity class.

    let Class = Classes.serializables.get(className);

    if (!Class)
    {
      let pathString = this.composePathString(param.path);

      // We can't safely recover from this error, it could corrupt the
      // data.
      FATAL_ERROR("Unable to create instance of class '" + className + "'"
        + " when deserializing property '" + param.propertyName + "'"
        + pathString + " because no such class is registered in Classes");
    }

    return new Class;
  }

//+
  private deserializePlainObject(param: DeserializeParam)
  {
    let instance = param.targetProperty;

    // Copy the data from sourceProperty.
    //   We are cycling over properties in JSON object, not in
    // object that is being loaded. It means that properties
    // that are not present in the save will not get overwritten.
    // This allows adding new properties to existing classes without
    // the need to convert all save files.
    for (let propertyName in param.sourceProperty)
    {
      // Here we do not enforce that properties from JSON exist
      // in target property, because that would prevent loading
      // plain Javascript Objects to a 'null' value (properties
      // with 'null' value are instantiated as {} before loading
      // into them).
      //   The same is true for loading Array items (the don't exist
      // prior to loading) which applies to Map and Set objects as well
      // (because they are serialized as Arrays).

      // Setup a new deserialize param.
      let deserializeParam: DeserializeParam =
      {
        propertyName: param.propertyName,
        // We need to pass 'null' as 'sourceProperty' so an instance
        // of corect type will be created (by createNewIfNull()).
        targetProperty: null,
        sourceProperty: param.sourceProperty[propertyName],
        path: param.path
      }

      // Deserializing of each property may require special handling
      // so we use readProperty() which will do it for us.
      instance[propertyName] = this.deserializeProperty(deserializeParam);
    }

    return instance;
  }

  // ------------------------------------------------- //
  //         Methods detecting 'fake' types            //
  //             of serialized records                 //
  // ------------------------------------------------- //

//+
  // Checks if 'param.sourceProperty' represents a saved FastBitSet object.
  private isBitvectorRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Bitvector'?
    if (jsonObject[Serializable.CLASS_NAME_PROPERTY]
        === Serializable.BITVECTOR_CLASS_NAME)
      return true;

    return false;
  }

//+
  // Checks if 'param.sourceProperty' represents a saved Date object.
  private isDateRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Date'?
    if (jsonObject[Serializable.CLASS_NAME_PROPERTY]
        === Serializable.DATE_CLASS_NAME)
      return true;

    return false;
  }

//+
  // Checks if 'param.sourceProperty' represents a saved Set object.
  private isSetRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Set'?
    if (jsonObject[Serializable.CLASS_NAME_PROPERTY]
        === Serializable.SET_CLASS_NAME)
      return true;

    return false;
  }

//+
  // Checks if 'param.sourceProperty' represents a saved Map object.
  private isMapRecord(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object
    // with value 'Map'?
    if (jsonObject[Serializable.CLASS_NAME_PROPERTY]
        === Serializable.MAP_CLASS_NAME)
      return true;

    return false;
  }

//+
  // Checks if 'param.sourceProperty' represents a saved reference to
  // an entity.
  private isReference(jsonObject: Object): boolean
  {
    if (this.isObjectValid(jsonObject) === false)
      return false;

    // Is there a 'className' property in JSON object with value
    // 'Reference'?
    if (jsonObject[Serializable.CLASS_NAME_PROPERTY]
        === Serializable.REFERENCE_CLASS_NAME)
      return true;

    return false;
  }

  // ------------------------------------------------- //
  //      Methods converting serialized data into      //
  //       original structures (Set, Map, etc.).       //
  // ------------------------------------------------- //

//+
  // Converts 'param.sourceProperty' to a FastBitSet object.
  private readBitvector(param: DeserializeParam)
  {
    let sourceRecord =
      this.readSourceRecord(param, Serializable.BITVECTOR_PROPERTY);

    if (sourceRecord === null)
      return null;

    return new FastBitSet(sourceRecord);
  }

//+
  // Converts 'param.sourceProperty' to a Date object.
  private readDate(param: DeserializeParam): Date
  {
    let sourceRecord =
      this.readSourceRecord(param, Serializable.DATE_PROPERTY);

    if (sourceRecord === null)
      return null;

    return new Date(sourceRecord);
  }

  // Converts 'param.sourceProperty' to a Set object.
  private readSet(param: DeserializeParam): Set<any>
  {
    let sourceRecord = this.readSourceRecord(param, Serializable.SET_PROPERTY);

    if (sourceRecord === null)
      return null;

    // In order to deserialize a Set object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselvs (for example if you put
    // another Set into your Set).

    // Setup a new deserialize param.
    let deserializeParam: DeserializeParam =
    {
      propertyName: 'Serialized record: Set',
      // We need to pass 'null' as 'sourceProperty' so an instance
      // of corect type will be created (by createNewIfNull()).
      targetProperty: null,
      sourceProperty: sourceRecord,
      path: param.path
    }

    // Load serialized array as if it were a regular array property
    // (readArray() will handle correct loading for us).
    let loadedArray = this.readArray(deserializeParam);

    // And let the constructor of class Set to convert it to Set object.
    return new Set(loadedArray);
  }

//+
  // Converts 'param.sourceProperty' to a Map object.
  private readMap(param: DeserializeParam): Map<any, any>
  {
    let sourceRecord = this.readSourceRecord(param, Serializable.MAP_PROPERTY);

    if (sourceRecord === null)
      return null;

    // In order to deserialize a Map object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselvs (for example if you put
    // another Map into your Map).

    // Setup a new deserialize param.
    let deserializeParam: DeserializeParam =
    {
      propertyName: 'Serialized record: Map',
      // We need to pass 'null' as 'sourceProperty' so an instance
      // of corect type will be created (by createNewIfNull()).
      targetProperty: null,
      sourceProperty: sourceRecord,
      path: param.path
    }

    // Load serialized array as if it were a regular array property
    // (readArray() will handle correct loading for us).
    let loadedArray = this.readArray(deserializeParam);

    // And let the constructor of class Map to convert it to Map object.
    return new Map(loadedArray);
  }

//+
  // Converts 'param.sourceProperty' to a reference to an Entity.
  // If 'id' loaded from JSON already exists in Entities,
  // existing entity proxy will be returned. Otherwise an 'invalid'
  // entity proxy will be created and returned.
  // -> Retuns an entity proxy object (possibly referencing an invalid entity).
  protected readEntityReference
  (
    sourceProperty: Object,
    propertyName: string,
    pathString: string
  )
  {
    // Note: This method is overriden in Entity class. In order for
    //   the override to be used, root object that is being deserialized
    //   must be an instance of Entity.
    FATAL_ERROR("Attempt to deserialize reference to an Entity from"
      + " Serializable object which is not an instance of Entity"
      + " class");

    return null;
  }

//+
  // Converts 'param.sourceProperty' to Array.
  private readArray(param: DeserializeParam): Array<any>
  {
    // Note:
    //   Array doesn't have a serialized record, because it's
    // a directly serializable class. We don't have to have a
    // special handling for deserializing of an Array, we need
    // special handling for deserializing it's CONTENTS (because
    // there may be Sets, Maps, custom classes or similar objects
    // in the Array that need to be deserialized in a special way).
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

    return this.readArrayContents(sourceArray, param.path);
  }

//+
  // Deserializes contents of an Array property.
  private readArrayContents(sourceArray: Array<any>, path: string)
  {
    let newArray = [];

    for (let i = 0; i < sourceArray.length; i++)
    {
      let item = this.readArrayItem(sourceArray[i], i, path);

      newArray.push(item);
    }

    return newArray;
  }

//+
  // Deserializes contents of a single Array item
  // ('index' and 'path' are used only for error messages).
  private readArrayItem(item: any, index: number, path: string)
  {
    // Setup a new deserialize param.
    let deserializeParam: DeserializeParam =
    {
      propertyName: 'Array item [' + index + ']',
      // We need to pass 'null' as 'sourceProperty' so an instance
      // of corect type will be created (by createNewIfNull()).
      targetProperty: null,
      sourceProperty: item,
      path: path
    }

    // Let 'readProperty()' method load the contents of an array item.
    return this.deserializeProperty(deserializeParam);
  }

  // ------------------------------------------------- //
  //                 Auxiliary methods                 //
  // ------------------------------------------------- //

//+
  private isDeserializable(instance: any): boolean
  {
    return ('deserialize' in instance);
  }  

//+
  // -> Returns 'param.sourceProperty[recordName]' if it exists,
  //   'null' otherwise.
  private readSourceRecord(param: DeserializeParam, recordName: string)
  {
    if (!param.sourceProperty)
      return null;
    
    let sourceRecord = param.sourceProperty[recordName];

    if (sourceRecord === undefined || sourceRecord === null)
    {
      let pathString = this.composePathString(param.path);

      ERROR("Missing or invalid '" + recordName + "' property when"
        + " loading " + recordName + " record '" + param.propertyName + "'"
        + pathString);
      return null;
    }

    return sourceRecord;
  }

//+
  // -> Returns 'false' if 'jsonObject' is 'null' or 'undefined
  //    ('null' value is not considered an error, 'undefined' is).
  private isObjectValid(jsonObject: Object): boolean
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

  // ------------ Protected static methods -------------- 

  // ------------- Private static methods ---------------

  // -> Returns a SaveableObject which saves Set to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Set' and property 'set' containing
  //      an Array representation of Set contents.  
  private createSetSaver(set: Set<any>)
  {
    if (set === null)
    {
      FATAL_ERROR("Null set");
      return;
    }

    let saver = new Serializable();

    // Set is saved as it's Array representation to property 'set'.
    saver[Serializable.SET_PROPERTY] = this.saveSetToArray(set);

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Set' instead of 'Serializable'.
    return this.createSaveProxy(saver, Serializable.SET_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves Map to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Map' and property 'map' containing
  //      an Array representation of hashmap contents.  
  private createMapSaver(map: Map<any, any>)
  {
    if (map === null)
    {
      FATAL_ERROR("Null map");
      return;
    }

    let saver = new Serializable();

    // Map is saved as it's Array representation to property 'map'.
    saver[Serializable.MAP_PROPERTY] = this.saveMapToArray(map);

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Map' instead of 'Serializable'.
    return this.createSaveProxy(saver, Serializable.MAP_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves FastBitSet to Json
  //      object (using it's saveToJsonObject()) as a special object
  //      with className 'Bitvector' and property 'bitvector' containing
  //      a string represenation of FastBitSet object.
  private createBitvectorSaver(bitvector: Date)
  {
    if (bitvector === null)
    {
      FATAL_ERROR("Null bitvector");
      return;
    }

    let saver = new Serializable();

    // Date is saved as it's JSON string representation to property 'date'.
    saver[Serializable.BITVECTOR_PROPERTY] = bitvector.toJSON();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Bitvector' instead of 'Serializable'.
    return this.createSaveProxy(saver, Serializable.BITVECTOR_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves Date to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Date' and property 'date' containing
  //      a string represenation of Date object.  
  private createDateSaver(date: Date)
  {
    if (date === null)
    {
      FATAL_ERROR("Null date");
      return;
    }

    let saver = new Serializable();

    // Date is saved as it's JSON string representation to property 'date'.
    saver[Serializable.DATE_PROPERTY] = date.toJSON();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Date' instead of 'Serializable'.
    return this.createSaveProxy(saver, Serializable.DATE_CLASS_NAME);
  }

  // -> Returns a SaveableObject which saves Entity to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Reference' and property 'id' containing
  //      an Array representation of hashmap contents.  
  protected createEntitySaver(entity: Serializable)
  {
    // Note: This method is overriden in Entity class. In order for
    //   the override to be used, root object that is being serialized
    //   must be an instance of Entity.
    FATAL_ERROR("Attempt to serialize reference to an Entity from"
      + " Serializable object which is not an instance of Entity"
      + " class");

    return null;
    /*
    if (entity === null)
    {
      FATAL_ERROR("Null entity");
      return;
    }

    let saver = new Serializable();

    // Entity is saved as it's string id to property 'id'.
    saver[Serializable.ID_PROPERTY] = entity.getId();

    // We can't override 'className' property, because it's an accessor
    // (see NamedClass.className), so we use Proxy to trap acces to
    // 'className' to return our desired value instead.
    //   This is done so that our return value will save with 'className'
    // 'Reference' instead of 'Serializable'.
    return this.createSaveProxy(saver, Serializable.REFERENCE_CLASS_NAME);
    */
  }

  // -> Returns an Array representation of Set object.
  private saveBitvectorToArray(bitvector: any): Array<any>
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
  private saveSetToArray(set: Set<any>): Array<any>
  {
    let result = [];

    for (let entry of set.values())
      result.push(entry);
    
    return result;
  }

  // -> Returns an Array representation of Map object.
  private saveMapToArray(map: Map<any, any>): Array<any>
  {
    let result = [];

    for (let entry of map.entries())
      result.push(entry);
    
    return result;
  }

//+
  // -> Returns a Proxy object that traps access to 'className' property
  //      on 'object' to return 'className' param instead of original value. 
  protected createSaveProxy(saver: Serializable, className: string)
  {
    // This function will be passed to Proxy handler as it's 'get' trap.
    let get = function(target: any, property: any)
    {
      // Here we are trapping access to 'className' property.
      if (property === Serializable.CLASS_NAME_PROPERTY)
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

  private objectValidityCheck(jsonObject: Object): boolean
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

//+
  // -> Returns string informing about file location or empty string
  //    if 'path' is not available.
  private composePathString(path: string)
  {
    if (path === null)
      return "";

    return " in file " + path;
  }
}

// ------------------ Type declarations ----------------------

// Used as parameter of deserialization methods.
interface DeserializeParam
{
  propertyName: string,
  targetProperty: any,
  sourceProperty: any,
  path: string
}

// Used as parameter of serialization methodse.
interface SerializeParam
{
  // Data to be saved.
  sourceProperty: any,
  // String used for error messages.
  // (It should describe the property as well as
  //  possible - what's it's name, what it's in, etc.)
  description: string,
  // Name of the class we are just saving.
  className: string,
  // Serialization mode (SAVE_TO_FILE, SEND_TO_CLIENT, etc.).
  mode: Serializable.Mode
}

export module Serializable
{
  export enum Mode
  {
    SAVE_TO_FILE,
    SEND_TO_CLIENT,
    SEND_TO_SERVER,
    SEND_TO_EDITOR
  }
}