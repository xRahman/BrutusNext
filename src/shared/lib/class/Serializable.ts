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

    (See deserialize() and readPrimitiveObject() methods for details.) 
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {SharedUtils} from '../../../shared/lib/utils/SharedUtils';
import {Attributes} from '../../../shared/lib/class/Attributes';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {JsonSaver} from '../../../shared/lib/json/JsonSaver';
//import {JsonLoader} from '../../../shared/lib/json/JsonLoader';
///import {Entity} from '../../../server/lib/entity/Entity';
///import {EntityManager} from '../../../server/lib/entity/EntityManager';
import {Nameable} from '../../../shared/lib/class/Nameable';
import {Instantiable} from '../../../shared/lib/class/Instantiable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityProxyHandler} from
  '../../../server/lib/entity/EntityProxyHandler';
///import {FileSystem} from '../../../server/lib/fs/FileSystem';
///import {SavingManager} from '../../../server/lib/fs/SavingManager';
///import {Server} from '../../../server/lib/Server';

/// DEBUG:
///let Util = require('util');

// 3rd party modules.
let FastBitSet = require('fastbitset');

export class Serializable extends Instantiable
{
  public static get VERSION_PROPERTY()      { return 'version'; }

  // These special property names are only written to serialized data.
  // For example 'map' property holds an Array that represents serialized
  // data of a Map object.
  public static get BITVECTOR_PROPERTY()    { return 'bitvector'; }
  public static get DATE_PROPERTY()         { return 'date'; }
  public static get MAP_PROPERTY()          { return 'map'; }
  public static get SET_PROPERTY()          { return 'set'; }

  // These are 'dummy' class names. They are only written to JSON
  // but they don't really exists in code (Date, Set and Map are
  // build-in javascript classes, Bitvector translates to a FastBitArray
  // class and Reference is not a class at all but a reference to
  // an Entity.
  private static get BITVECTOR_CLASS_NAME() { return 'Bitvector'; }
  private static get DATE_CLASS_NAME()      { return 'Date'; }
  private static get SET_CLASS_NAME()       { return 'Set'; }
  private static get MAP_CLASS_NAME()       { return 'Map'; }
  private static get REFERENCE_CLASS_NAME() { return 'Reference'; }

  //----------------- Protected data --------------------

  // Version will be checked for. Default behaviour is to trigger
  // an ERROR when versions don't match. You can change it by
  // overriding a checkVersion() method.
  //   It is also a good idea to override 'version' property in
  // descendant classes and increment it when you change the properties.
  protected version = 0;

  // ------------- Public static methods ----------------

  // ------------ Protected static methods --------------

  // ---------------- Public methods --------------------

  public serialize(mode: Serializable.Mode): string
  {
    let jsonObject = this.saveToJsonObject(mode);

    return JsonObject.stringify(jsonObject);
  }

//+
  // Extracts data from plain javascript Object to this instance.
  // -> Returns 'false' on failure.
  public deserialize(jsonObject: Object, path: string = null): boolean
  {
    // Check version and input data validity.
    if (!this.deserializeCheck(jsonObject, path))
      return false;

    // Copy all properties from 'jsonObject'.
    for (let propertyName in jsonObject)
    {
      if
      (
        // Property 'className' isn't assigned (it's read-only
        // and static so it wouldn't make sense anyways. And we
        // have also already checked that it's the same in 'this'
        // as in JSON object).
        propertyName !== Nameable.CLASS_NAME_PROPERTY
        // Only properties that exist on the class that is being loaded
        // are loaded from save. It means that you can remove properties
        // from existing classes without converting existing save files
        // (no syslog message is generated).
        && this[propertyName] !== undefined
      )
      {
        let param: ReadParam =
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
        this[propertyName] = this.readProperty(param);
      }
    }

    return true;
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


  /// Deprecated
  /*
  // Override this method if you need to save property of nonstandard type
  // (see class Flags for example).
  protected saveProperty(jsonObject: Object, propertyName: string)
  {
    jsonObject[propertyName] =
      this.writeProperty(this[propertyName], propertyName, this.className);
  }
  */

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

  // Creates a generic Javascript Object and fills it with properties of
  // 'this' that are to be serialized. Data types that can't be directly
  // serialized to JSON (like Set or Map) are converted to their serializable
  // equivalents (Array, string, etc).
  private saveToJsonObject(mode: Serializable.Mode): Object
  {
    let jsonObject: Object = {};

    // A little hack - save 'name' property first (out of order)
    // to make saved JSON files more readable.
    if ('name' in this)
      jsonObject['name'] = this['name'];

    // Anoter hack - save 'className' property.
    // (We need to save 'className' maually, because it is an accessor,
    // so it's not enumerable - which means that it won't get iterated
    // over in following cycle that iterates properties.)
    if (this.className === undefined)
    {
      FATAL_ERROR("Attempt to save a SaveableObject that doesn't"
        + " have a " + Nameable.CLASS_NAME_PROPERTY + " property."
        + " I'd like to know how did you manage to do it - Serializable"
        + " is inherited from Nameable which does have it");
    }

    jsonObject[Nameable.CLASS_NAME_PROPERTY] = this.className;

    // If 'this' is a proxy, 'for .. in' operator won't work on it,
    // because 'handler.enumerate()' which used to trap it has been
    // deprecated in ES7. So we have to use a hack - directly access
    // internal entity of proxy by trapping access to '_internalEntity'
    // property and use 'for .. in' operator on it.
    let instance = this;

    // Note: 'isProxy' is trapped by proxy handler to return 'true'.
    //  If the instance isn't a proxy, value of 'isProxy' is 'undefined'.
    if (this['isProxy'] === true)
      instance = this[EntityProxyHandler.INTERNAL_ENTITY_PROPERTY];

    // Cycle through all properties in source object.
    for (let propertyName in instance)
    {
      // Skip 'name' property because it's already saved by hack.
      if (propertyName === 'name')
        continue;

TODO, TODO, TO DO TO DO TO DO, todotodooooooo.... todotodo...
      let writeParam: WriteParam =
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
        mode: mode
      }
      
      /// TODO: Handle multiple serialization modes
      // (toFile, toClient, toServer, toEditor...)
      /// Tak nakonec ne, přesunu to až do writeProperty(),
      /// protože tady by se to netestovalo pro vnořené properties.

      /*
      // (this.isSaved() checks static property attribute 'saved')
      // (className is passed only for more specific error messages)
      if (instance.isSaved(propertyName, this.className))
        instance.saveProperty(jsonObject, propertyName);
      */
      instance.writeProperty();
    }

    return jsonObject;
  }

  // Saves a property of type Array to a corresponding JSON Array object.
  private saveArray(array: Array<any>, arrayName: string, className: string)
  {
    let jsonArray = [];

    // Note: isSaved static attribute is not tested for members of an array.
    // Either the whole array is saved, or it's not saved at all. Having
    // 'holes' in an array after loading (probably with <null> values) would
    // certainly be confusing.
    for (let i = 0; i < array.length; i++)
    {
      let itemDescription = "an item of an array '" + arrayName + "'"
        + " at position " + i;
      jsonArray.push(this.writeProperty(array[i], itemDescription, className));
    }

    return jsonArray;
  }

  // Saves a single variable to a corresponding JSON object.
  // -> Returns JSON Object representing 'variable'. 
  private writeProperty
  (
    // Data to be saved.
    variable: any,
    // String used for error messages.
    // (It should describe the property as well as
    //  possible - what's it's name, what it's in, etc.)
    description: string,
    // Name of the class we are just saving.
    className: string
  )
  {
    if (variable === null)
      return null;

    // Variable is of primitive type (number, string, etc.).
    if (SharedUtils.isPrimitiveType(variable))
      // Primitive values are just assigned.
      return variable;

    if (Array.isArray(variable))
      return this.saveArray(variable, description, className);
    
    // Access to 'isEntity' property is trapped by proxy.
    // (see EntityProxyHandler.get()).
    if (variable.isEntity === true)
      // Entities are saved to a separate files. Only a string
      // id of an entity is saved here.
      return JsonObject.createEntitySaver(variable).saveToJsonObject();

    // 'variable' is a saveableObject (but not an entity).
    if (this.isSaveableObject(variable))
      return variable.saveToJsonObject();

    if (this.isTypeDate(variable))
      //return this.saveDate(variable);
      return JsonObject.createDateSaver(variable).saveToJsonObject();

    if (this.isTypeMap(variable))
      return JsonObject.createMapSaver(variable).saveToJsonObject();

    if (this.isTypeSet(variable))
      return JsonObject.createSetSaver(variable).saveToJsonObject();

    if (this.isPrimitiveObject(variable))
      return this.savePrimitiveObject(variable);

    FATAL_ERROR("Variable '" + description + "' in class '" + className + "'"
      + " (or inherited from some of it's ancestors) is a class but"
      + " is neither inherited from SaveableObject nor has a type that"
      + " we know how to save. Make sure that you only use primitive"
      + " types (numbers, strings), Arrays, primitive javascript Objects,"
      + " Dates, Maps or classes inherited from SaveableObject as properties"
      + " of classes inherited from SaveableObject. Or, if you want a new"
      + " type to be saved, you need to add saving and loading functionality"
      + " for it to SaveableObject.ts");
  }

  // Check if there is a static property named the same as property,
  // an if it's value contains: { isSaved = false; }
  private isSaved(propertyName: string, className: string): boolean
  {
    // Access static variable named the same as property.
    let propertyAttributes = this.getPropertyAttributes(propertyName);

    // If attributes for our property exist.
    if (propertyAttributes !== undefined)
    {
      if (propertyAttributes === null)
      {
        FATAL_ERROR("'null' propertyAtributes for property"
          + " '" + propertyName + "'. Make sure that 'static"
          + " " + propertyName + "' declared in class"
          + " " + className + " (or in some of it's ancestors)"
          + " is not null");
      }

      // And if there is 'isSaved' property in atributes.
      // (so something like: static property = { issaved: false };
      //  has been declared).
      if (propertyAttributes.isSaved !== undefined)
      {
        // And it's set to false.
        if (propertyAttributes.isSaved === false)
          // Then property is not to be saved.
          return false;
      }
    }

    return true;
  }

  // The purpose of manual saving of properties of primitive Objects
  // is to determine if some of them are SaveableObjects so they need
  // to be saved using their saveToJsonObject() method.
  // (this check is done within this.saveVariable() call)
  private savePrimitiveObject(variable: any): Object
  {
    if (variable === null)
    {
      ERROR("Null varible. Primitive Object is not saved to JSON");
      return false;
    }

    let jsonObject: Object = {};
     
    // If 'variable' is a proxy, 'for .. in' operator won't work on it,
    // because 'handler.enumerate()' which used to trap it has been
    // deprecated in ES7. So we have to use a hack - directly access
    // internal entity of proxy by trapping access to '_internalEntity'
    // property and use 'for .. in' operator on it.
    let sourceObject = variable;

    if (variable.isProxy === true)
      sourceObject = variable['_internalEntity'];

    for (let property in sourceObject)
    {
      jsonObject[property] =
        this.writeProperty(sourceObject[property], property, 'Object');
    }

    return jsonObject;
  }

  /// Moved to SharedUtils.
  /*
  // Variable is of primitive type (number or string).
  private isPrimitiveValue(variable: any): boolean
  {
    return typeof variable !== 'object';
  }
  */

  /*
  private isEntity(variable: any): boolean
  {
    // Note:
    //   Access to 'isEntity' property is trapped by proxy.
    // (see EntityProxyHandler.get()). If variable doesn't
    // have 'isEntity' property, the value is 'undefined'
    // which, compared to 'true', will return 'false.
    return variable.isEntity === true;
  }
  */

  /// TODO: Tohle asi bude muset být public.
  /// Jestli to vůbec k něčemu použiju.
  /// PS: v metodě readObject() testuju 'deserialize' přímo...
  private isSaveableObject(variable: any): boolean
  {
    return ('saveToJsonObject' in variable);
  }

  ///////////////////////////////////////////////////////
  ///////////////////// JsonLoader //////////////////////
  ///////////////////////////////////////////////////////

  /// BIG TODO
  // Reads property 'prototypeId' from 'jsonObject',
  // handles possible errors.
  private getPrototypeId(jsonObject: Object, path: string = null): string
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

//+
  // Reads a single property from corresponding JSON object.
  // Converts from serializable format to original data type as needed
  // (for example Set class is saved to JSON as an Array so it has to be
  //  reconstructed here).
  private readProperty(param: ReadParam): any
  {
    let result: any;

    // First handle the case that property in JSON has null value. In that
    // case target property will also be null, no matter what type it is.
    if (param.targetProperty === null)
      return null;

    // Attempt to load property as FastBitSet object.
    if (result = this.readAsBitvector(param))
      return result;

    // Attempt to load 'param.sourceProperty' as Date object.
    if (result = this.readAsDate(param))
      return result;

    // Attempt to load 'param.sourceProperty' as Set object.
    if (result = this.readAsSet(param))
      return result;

    // Attempt to load 'param.sourceProperty' as Map object.
    if (result = this.readAsMap(param))
      return result;

    // Attempt to load 'param.sourceProperty' as a reference to an Entity.
    if (result = this.readAsEntityReference(param))
      return result;

    // Attempt to load 'param.sourceProperty' as Array
    if (result = this.readAsArray(param))
      return result;

    // Attempt to load 'param.sourceProperty' as an object
    // (including custom classes).
    //   Note that this would also mean Dates, Arrrays and all other
    // nonprimitive types, so they must be handled before this.
    if (result = this.readAsObject(param))
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
    let jsonClassName = jsonObject[Nameable.CLASS_NAME_PROPERTY];

    if (jsonClassName === undefined)
    {
      let pathString = this.composePathString(path);

      ERROR("There is no '" + Nameable.CLASS_NAME_PROPERTY + "'"
        + " property in JSON data" + pathString);
      return false;
    }

    if (jsonClassName !== this.className)
    {
      let pathString = this.composePathString(path);

      ERROR("Attempt to load JSON data of class"
        + " (" + jsonObject[Nameable.CLASS_NAME_PROPERTY] + ")"
        + pathString + " into instance of incompatible"
        + " class (" + this.className + ")");
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
  private readAsBitvector(param: ReadParam)
  {
    if (!this.isBitvectorRecord(param.sourceProperty))
      return null;

    if (!SharedUtils.isBitvector(param.targetProperty))
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
  private readAsDate(param: ReadParam)
  {
    if (!this.isDateRecord(param.sourceProperty))
      return null;

    if (!SharedUtils.isDate(param.targetProperty))
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
  private readAsSet(param: ReadParam)
  {
    if (!this.isSetRecord(param.sourceProperty))
      return null;

    if (!SharedUtils.isSet(param.targetProperty))
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
  private readAsMap(param: ReadParam)
  {
    if (!this.isMapRecord(param.sourceProperty))
      return null;

    if (!SharedUtils.isMap(param.targetProperty))
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
  private readAsEntityReference(param: ReadParam)
  {
    if (!this.isReference(param.sourceProperty))
      return null;

    return this.readEntityReference(param);
  }

//+
  // Attempts to convert 'param.sourceProperty' to Array.
  // -> Returns 'null' if 'param'.sourceVariable is not an
  //    Array or if loading failed.
  private readAsArray(param: ReadParam)
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
  private readAsObject(param: ReadParam)
  {
    if (SharedUtils.isPrimitiveType(param.sourceProperty))
      return null;

    if
    (
      param.targetProperty !== null
      && param.targetProperty !== undefined
      && SharedUtils.isPrimitiveType(param.targetProperty)
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
  private readObject(param: ReadParam)
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
    if ('deserialize' in instance)
    {
      // If we are loading into a Serializable object, do it using it's
      // deserialize() method.
      instance.deserialize(param.sourceProperty, param.path);

      return instance;
    }

    if (!SharedUtils.isJavascriptObject(instance))
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
    return this.readPrimitiveObject(param);
  }

/// TODO
  // -> Returns 'param.targetProperty' if it's not 'null'.
  //    Creates and returns a new instance otherwise
  //    (type is read from 'param.sourceProperty.className').
  private createNewIfNull(param: ReadParam)
  {
    // If the target property exists, we will be loading into it.
    let instance = param.targetProperty;

    // If it doesn't we have to create a new instance (because 'null'
    // has no properties so we can't call deserialize() on it).
    if (instance === null)
    {
      // Read class name from JSON.
      let className = param.sourceProperty[Nameable.CLASS_NAME_PROPERTY];

      if (className === undefined)
      {
        // If there isn't a 'className' property in jsonObject,
        // we will load into a plain Javascript Object.
        instance = {};
      }
      else
      {
        /// BIG TODO:

        // If there is a 'className' property in JSON, create a new instance
        // of that type.
        let prototypeObject =
          App.prototypeManager.getPrototypeObject(className);

        if (prototypeObject === undefined)
        {
          let pathString = this.composePathString(param.path);
          
          ERROR("Property '" + param.propertyName + "'" + pathString
            + " is of type '" + className + "' which doesn't"
            + " exist in ClassFactory. It probably means that"
            + " you forgot to add class '" + className + "'"
            + " to ClassFactory");
          instance = null;
        }
        else
        {
          instance = App.prototypeManager.createInstance(prototypeObject);
        }
      }
    }

    return instance;
  }

//+
  private readPrimitiveObject(param: ReadParam)
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

      // Setup a new read param.
      let readParam: ReadParam =
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
      instance[propertyName] = this.readProperty(readParam);
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
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY]
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
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY]
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
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY]
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
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY]
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
    if (jsonObject[Nameable.CLASS_NAME_PROPERTY]
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
  private readBitvector(param: ReadParam)
  {
    let sourceRecord =
      this.readSourceRecord(param, Serializable.BITVECTOR_PROPERTY);

    if (sourceRecord === null)
      return null;

    return new FastBitSet(sourceRecord);
  }

//+
  // Converts 'param.sourceProperty' to a Date object.
  private readDate(param: ReadParam): Date
  {
    let sourceRecord =
      this.readSourceRecord(param, Serializable.DATE_PROPERTY);

    if (sourceRecord === null)
      return null;

    return new Date(sourceRecord);
  }

  // Converts 'param.sourceProperty' to a Set object.
  private readSet(param: ReadParam): Set<any>
  {
    let sourceRecord = this.readSourceRecord(param, Serializable.SET_PROPERTY);

    if (sourceRecord === null)
      return null;

    // In order to deserialize a Set object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselvs (for example if you put
    // another Set into your Set).

    // Setup a new read param.
    let readParam: ReadParam =
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
    let loadedArray = this.readArray(readParam);

    // And let the constructor of class Set to convert it to Set object.
    return new Set(loadedArray);
  }

//+
  // Converts 'param.sourceProperty' to a Map object.
  private readMap(param: ReadParam): Map<any, any>
  {
    let sourceRecord = this.readSourceRecord(param, Serializable.MAP_PROPERTY);

    if (sourceRecord === null)
      return null;

    // In order to deserialize a Map object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselvs (for example if you put
    // another Map into your Map).

    // Setup a new read param.
    let readParam: ReadParam =
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
    let loadedArray = this.readArray(readParam);

    // And let the constructor of class Map to convert it to Map object.
    return new Map(loadedArray);
  }

//+
  // Converts 'param.sourceProperty' to a reference to an Entity.
  // If 'id' loaded from JSON already exists in EntityManager,
  // existing entity proxy will be returned. Otherwise an 'invalid'
  // entity proxy will be created and returned.
  // -> Retuns an entity proxy object (possibly referencing an invalid entity).
  private readEntityReference(param: ReadParam): Entity
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

//+
  // Converts 'param.sourceProperty' to Array.
  private readArray(param: ReadParam): Array<any>
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
    // Setup a new read param.
    let readParam: ReadParam =
    {
      propertyName: 'Array item [' + index + ']',
      // We need to pass 'null' as 'sourceProperty' so an instance
      // of corect type will be created (by createNewIfNull()).
      targetProperty: null,
      sourceProperty: item,
      path: path
    }

    // Let 'readProperty()' method load the contents of an array item.
    return this.readProperty(readParam);
  }

  // ------------------------------------------------- //
  //                 Auxiliary methods                 //
  // ------------------------------------------------- //

//+
  // -> Returns 'param.sourceProperty[recordName]' if it exists,
  //   'null' otherwise.
  private readSourceRecord(param: ReadParam, recordName: string)
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

// Used as parameter of deserialization methods to save lots of code.
interface ReadParam
{
  propertyName: string,
  targetProperty: any,
  sourceProperty: any,
  path: string
}

// Used as parameter of serialization methods to save lots of code.
interface WriteParam
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
    SENT_TO_SERVER,
    SEND_TO_EDITOR
  }
}