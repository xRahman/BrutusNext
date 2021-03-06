/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
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

    (See loadFromJsonObject() and loadPrimitiveObject() methods for details.) 
*/

/*
'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
///import {NamedClass} from '../../../server/lib/class/NamedClass';
///import {InstantiableClass} from '../../../server/lib/class/InstantiableClass';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {SavingManager} from '../../../server/lib/fs/SavingManager';
import {IndirectValue} from '../../../server/lib/fs/IndirectValue';
import {ServerApp} from '../../../server/lib/Server';

let beautify = require('js-beautify').js_beautify;

/// DEBUG:
///let Util = require('util');

export class SaveableObject extends InstantiableClass
{
  //----------------- Protected data --------------------

  // // Version will be checked for. Default behaviour is to trigger
  // // an ERROR when versions don't match. You can override it
  // // by overriding a checkVersion() method;
  // protected version = 0;

  // protected isProxy = false;
  // // (note: This property is not saved)
  // protected static isProxy = { isSaved: false };

  // ------------- Public static methods ----------------

  // Loads a generic (untyped) javascript Object from specified file.
  // Note:
  //   It is a static method because entities need to be able to load
  //   jsonObject first and create an instance of SaveableObject from
  //   type information read from it - so the loading of jsonObject
  //   must be possible without having an instance of SaveableObject.
  // -> Returns 'null' if loading fails.
  public static async loadJsonObjectFromFile(path: string)
  {
    //  Unlike writing the same file while it is saving, loading from
    //  the same file while it is loading is not a problem (according
    //  to node.js filestream documentation). So we don't need to bother
    //  with loading locks.

    // Asynchronous reading from the file.
    // (the rest of the code will execute only after the reading is done)
    let jsonString = await FileSystem.readFile(path);

    // 'path' is passed just so it can be printed to error messages.
    return SaveableObject.loadFromJsonString(jsonString, path); 
  }

  // ------------- Private static methods ---------------

  // // -> Returns 'null' if loading fails.
  // private static loadFromJsonString(jsonString: string, path: string)
  // {
  //   let jsonObject = {};

  //   try
  //   {
  //     jsonObject = JSON.parse(jsonString);
  //   }
  //   catch (e)
  //   {
  //     // Here we need fatal error, because data might already
  //     // be partialy loaded so we could end up with broken entity.
  //     FATAL_ERROR("Syntax error in JSON string: "
  //       + e.message + " in file " + path);
  //     return null;
  //   }

  //   return jsonObject;
  // }

  // ---------------- Public methods --------------------

  // -> Returns 'true' on success.
  public async loadFromFile(path: string): Promise<boolean>
  {
    // Note:
    //  Unlike writing the same file while it is saving, loading from
    //  the same file while it is loading is not a problem (according
    //  to node.js filestream documentation). So we don't need to bother
    //  with loading locks.

    // Static method is used because entities need to be able to load
    // jsonObject first and create an instance of SaveableObject from
    // type information read from it - so the loading of jsonObject
    // must be possible without having an instance of SaveableObject.
    let jsonObject = await SaveableObject.loadJsonObjectFromFile(path);

    if (jsonObject === null)
      return false;

    // 'path' is passed just so it can be printed to error messages.
    return this.loadFromJsonObject(jsonObject, path);
  }

  // -> Returns 'true' on success.
  public async saveToFile(directory: string, fileName: string)
  : Promise<boolean>
  {
    let directoryIsValid = directory !== undefined
                        && directory !== null
                        && directory !== "";

    if (!directoryIsValid)
    {
      ERROR("Invalid 'directory' parameter when saving"
        + " class " + this.className + "." + " Object is"
        + " not saved");
      return false;
    }

    let filenameIsValid = fileName !== undefined
                       && fileName !== null
                       && fileName !== "";

    if (!filenameIsValid)
    {
      ERROR("Invalid 'fileName' parameter when saving"
        + " class " + this.className + ". Object is not"
        + " saved");
      return false;
    }

    if (directory.substr(directory.length - 1) !== '/')
    {
      ERROR("Error when saving class " + this.className + ":"
        + " Directory path '" + directory + "' doesn't end with"
        + " '/'. Object is not saved");
      return;
    }

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;

    return await this.saveContentsToFile(directory + fileName);
  }

  // // -> Returns 'false' if loading fails.
  // public loadFromJsonObject(jsonObject: Object, path: string): boolean
  // {
  //   if (!this.loadFromJsonObjectCheck(jsonObject, path))
  //     return false;

  //   // Now copy the data.
  //   for (let propertyName in jsonObject)
  //   {
  //     // Property 'className' will not be assigned (it's read-only
  //     // and static so it wouldn't make sense anyways), but we will
  //     // check that we are loading ourselves into a class with matching
  //     // className.
  //     if (propertyName === NamedClass.CLASS_NAME_PROPERTY)
  //     {
  //       if (!this.loadClassNameCheck(jsonObject, propertyName, path))
  //         return false;
  //     }
  //     else
  //     {
  //       // Note:
  //       //   Only properties that exist on the class that is being loaded
  //       // are loaded from save. It means that you can remove properties
  //       // from existing classes without converting existing save files.
  //       // (no syslog message is generated)
  //       if (this[propertyName] !== undefined)
  //         // Note:
  //         //   We are cycling over properties in JSON object, not in
  //         // SaveableObject that is being loaded. It means that properties
  //         // that are not present in the save will not get overwritten.
  //         // This allows adding new properties to existing classes without
  //         // the need to convert all save files.
  //         this.loadPropertyFromJsonObject(jsonObject, propertyName, path);
  //     }
  //   }

  //   return true;
  // }

  // -------------- Protected methods -------------------

  // protected checkVersion(jsonObject: Object, path: string): boolean
  // {
  //   if (!('version' in jsonObject))
  //   {
  //     ERROR("Missing 'version' property in JSON data"
  //       + " in file " + path);
  //     return false;
  //   }

  //   if (jsonObject['version'] !== this.version)
  //   {
  //     ERROR("Version of JSON data (" + jsonObject['version'] + ")"
  //       + " in file " + path + " doesn't match required"
  //       + " version (" + this.version + ")");
  //     return false;
  //   }

  //   return true;
  // }

  // // Override this method if you need to load property of nonstandard type.
  // // (see class Flags for example)
  // protected loadPropertyFromJsonObject
  // (
  //   jsonObject: Object,
  //   propertyName: string,
  //   path: string
  // )
  // {
  //   this[propertyName] = this.loadVariable
  //   (
  //     propertyName,
  //     this[propertyName],
  //     jsonObject[propertyName],
  //     path
  //   );
  // }

  // // Override this method if you need to save property of nonstandard type.
  // // (see class Flags for example)
  // protected savePropertyToJsonObject(jsonObject: Object, propertyName: string)
  // {
  //   jsonObject[propertyName] =
  //     this.saveVariable(this[propertyName], propertyName, this.className);
  // }

  // --------------- Private methods --------------------

  // This is just a generic async function that will finish
  // when 'promise' parameter gets resolved.
  // (This only makes sense if you also store 'resolve' callback
  //  of the promise so you can call it to finish this awaiter.
  //  See SavingRecord.addRequest() for example how is it done.)
  private saveAwaiter(promise: Promise<void>)
  {
    return promise;
  }

  // -> Returns 'true' if contents was succesfully written.
  //    Returns 'false' otherwise.
  private async saveContentsToFile(path: string): Promise<boolean>
  {
    // Following code is addresing 'feature' of node.js file saving
    // functions, which says that we must not attempt saving the same
    // file until any previous saving finishes (otherwise it is not
    // guaranteed that file will be saved correctly).
    //   To ensure this, we use SavingRegister to register all saving
    // that is being done to each file and buffer saving requests if
    // necessary.   
    let promise = SavingManager.requestSaving(path);

    // If SavingRegister.requestSaving returned 'null', it
    // means that 'path' is not being saved right now
    // so we can start saving right away.
    //   Otherwise we need to wait (using the promise we have
    // just obtained) for our turn.
    // Note:
    //   saveAwaiter() function will get finished by SavingRegister
    // by calling resolve callback of the promise we have just been
    // issued when previous saving finishes. 
    if (promise !== null)
      await this.saveAwaiter(promise);

    // Now it's our turn so we can save ourselves.
    let jsonString = this.saveToJsonString();

    let success = await FileSystem.writeFile(path, jsonString);

    // Remove the lock.
    // (it will also trigger calling of resolve callback
    //  of whoever might be waiting after us)
    SavingManager.finishSaving(path);

    return success;
  }

  // private saveToJsonString(): string
  // {
  //   let jsonString = JSON.stringify(this.saveToJsonObject());

  //   jsonString = beautify
  //   (
  //     jsonString,
  //     {
  //       "indent_size": 2,
  //       "indent_char": " ",
  //       "eol": "\n",
  //       "brace_style": "expand",
  //       "keep_array_indentation": true,
  //       "end_with_newline": false
  //     }
  //   );

  //   return jsonString;
  // }

  // // -> Returns 'false' if check fails.
  // private loadFromJsonObjectCheck
  // (
  //   jsonObject: Object,
  //   path: string
  // )
  // : boolean
  // {
  //   // 'path' is passed just so it can be printed to error messages.
  //   if (!this.checkVersion(jsonObject, path))
  //     return false;

  //   // 'className' must be the same as it's saved value.
  //   if (!this.checkClassName(jsonObject, path))
  //     return false;

  //   // Using 'in' operator on object with null value would cause crash.
  //   if (jsonObject === null)
  //   {
  //     // Here we need fatal error, because data might already
  //     // be partialy loaded so we could end up with broken entity.
  //     ERROR("Invalid json object loaded from file " + path);
  //     return false;
  //   }

  //   return true;
  // }

  // // -> Returns 'false' if check fails.
  // private loadClassNameCheck
  // (
  //   jsonObject: Object,
  //   propertyName: string,
  //   path: string
  // ): boolean
  // {
  //   if (this.className === undefined)
  //   {
  //     ERROR("Loading object with saved"
  //       + " '" + NamedClass.CLASS_NAME_PROPERTY + "'"
  //       + " property into an instance that doesn't have"
  //       + " a '" + NamedClass.CLASS_NAME_PROPERTY + "'"
  //       + " property. This should never happen");
  //     return false;
  //   }

  //   if (jsonObject[propertyName] !== this.className)
  //   {
  //     ERROR("Loading object with"
  //       + " '" + NamedClass.CLASS_NAME_PROPERTY + "'"
  //       + " property saved as '" + jsonObject[propertyName] + "'"
  //       + " into an instance with '" + NamedClass.CLASS_NAME_PROPERTY + "'"
  //       + " " + this.className + ". This should never happen, types must"
  //       + " match");
  //     return false;
  //   }

  //   return true;
  // }

  // private saveToJsonObject(): Object
  // {
  //   let jsonObject: Object = {};

  //   // A little hack - save 'name' property first (out of order)
  //   // to make saved JSON files more readable.
  //   if ('name' in this)
  //   {
  //     jsonObject['name'] = this['name'];
  //   }

  //   // Anoter hack - save 'className' property.
  //   // (We need to save 'className' maually, because it is an accessor,
  //   // so it's not enumerable - which means that it won't get iterated
  //   // over in following cycle that iterates properties.)
  //   let className = this.className;

  //   if (className === undefined)
  //   {
  //     FATAL_ERROR("Attempt to save a SaveableObject that doesn't"
  //       + " have a " + NamedClass.CLASS_NAME_PROPERTY + " property."
  //       + " I'd like to know how did you manage to do it - SaveableObject"
  //       + " is inherited from NamedClass which does have it");
  //   }

  //   jsonObject[NamedClass.CLASS_NAME_PROPERTY] = className;

  //   // If 'this' is a proxy, 'for .. in' operator won't work on it,
  //   // because 'handler.enumerate()' which used to trap it has been
  //   // deprecated in ES7. So we have to use a hack - directly access
  //   // internal entity of proxy by trapping access to '_internalEntity'
  //   // property and use 'for .. in' operator on it.
  //   let sourceObject = this;

  //   if (this.isProxy === true)
  //     sourceObject = this['_internalEntity'];

  //   // Cycle through all properties in source object.
  //   for (let property in sourceObject)
  //   {
  //     // Skip 'name' property because it's already saved thanks to
  //     // previous hack.
  //     // (this.isSaved() checks static attribute property.isSaved)
  //     // (className is passed only for more specific error messages)
  //     if (property !== 'name' && sourceObject.isSaved(property, className))
  //       sourceObject.savePropertyToJsonObject(jsonObject, property);
  //   }

  //   return jsonObject;
  // }

  // // -> Returns 'true' on success.
  // private checkClassName (jsonObject: Object, path: string): boolean
  // {
  //   if (!(NamedClass.CLASS_NAME_PROPERTY in jsonObject))
  //   {
  //     ERROR("There is no '" + NamedClass.CLASS_NAME_PROPERTY + "'"
  //       + " property in JSON data in file " + path);
  //     return false;
  //   }

  //   if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] !== this.className)
  //   {
  //     ERROR("Attempt to load JSON data of class"
  //       + " (" + jsonObject[NamedClass.CLASS_NAME_PROPERTY] + ")"
  //       + " in file " + path + " into instance of incompatible"
  //       + " class (" + this.className + ")");
  //     return false;
  //   }

  //   return true;
  // }

  // // Loads a single variable from corresponding JSON object.
  // private loadVariable
  // (
  //   variableName: string,
  //   variable: any,
  //   jsonVariable: any,
  //   path: string
  // )
  // : any
  // {
  //   // First handle the case that property in JSON has null value. In that
  //   // case our property will also be null, no matter what type it is.
  //   if (jsonVariable === null)
  //     return null;

  //   // Attempt to load variable as Date object.
  //   let result: any = this.loadAsDate
  //   (
  //     variableName,
  //     variable,
  //     jsonVariable,
  //     path
  //   );

  //   if (result !== null)
  //     return result;

  //   // Attempt to load variable as Set object.
  //   result = this.loadAsSet
  //   (
  //     variableName,
  //     variable,
  //     jsonVariable,
  //     path
  //   );

  //   if (result !== null)
  //     return result;

  //   // Attempt to load variable as Map object.
  //   result = this.loadAsMap
  //   (
  //     variableName,
  //     variable,
  //     jsonVariable,
  //     path
  //   );

  //   if (result !== null)
  //     return result;

  //   // Attempt to load variable as entity reference.
  //   result = this.loadAsEntityReference
  //   (
  //     variableName,
  //     variable,
  //     jsonVariable,
  //     path
  //   );

  //   if (result !== null)
  //     return result;

  //   // Attempt to load variable as Array.
  //   result = this.loadAsArray
  //   (
  //     variableName,
  //     variable,
  //     jsonVariable,
  //     path
  //   );

  //   if (result !== null)
  //     return result;

  //   // Attempt to load variable as Object.
  //   result = this.loadAsObject
  //   (
  //     variableName,
  //     variable,
  //     jsonVariable,
  //     path
  //   );

  //   if (result !== null)
  //     return result;
    
  //   // If variable has neither of types we have just tried,
  //   // we load it as primitive type (variables of primitive
  //   // types are simply assigned).
  //   return jsonVariable;
  // }

  // // If myProperty is null, a new instance of correct type will be
  // // created and returned (type is read from jsonObject.className).
  // private createNewIfNull
  // (
  //   propertyName: string,
  //   myProperty: any,
  //   jsonObject: Object,
  //   path: string
  // )
  // {
  //   if (myProperty === null)
  //   {
  //     // Read class name from JSON.
  //     let className = jsonObject[NamedClass.CLASS_NAME_PROPERTY];

  //     if (className === undefined)
  //     {
  //       // If there isn't a 'className' property in jsonObject,
  //       // property is a basic javascript object.
  //       // Note:
  //       //   This doesn't always have to be true and it will lead to
  //       // errors if someone creates a new class not inherited
  //       // from SaveableObject and puts it in saveable class - it will
  //       // get loaded, but it won't have correct type (it will be just
  //       // a basic javascript object).
  //       myProperty = {};
  //     }
  //     else
  //     {
  //       // If there is a 'className' property in JSON, create a new instance
  //       // of that type.

  //       let prototypeObject =
  //         Server.prototypeManager.getPrototypeObject(className);

  //       if (prototypeObject === undefined)
  //       {
  //         ERROR("Property '" + propertyName + "' loaded from"
  //           + " file '" + path + "' is of type '" + className + "'"
  //           + " which doesn't exist in Classes. It probably"
  //           + " means that you forgot to add class '" + className + "'"
  //           + " to DynamicClasses.ts");
  //         myProperty = null;
  //       }
  //       else
  //       {
  //         myProperty = Server.prototypeManager.createInstance(prototypeObject);
  //       }
  //     }
  //   }

  //   return myProperty;
  // }

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
      jsonArray.push(this.saveVariable(array[i], itemDescription, className));
    }

    return jsonArray;
  }

  // Saves a single variable to a corresponding JSON object.
  // -> Returns JSON Object representing 'variable'. 
  private saveVariable
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

    // Variable is of primitive type (number or string).
    if (this.isPrimitiveValue(variable))
      // Primitive values are just assigned.
      return variable;

    if (Array.isArray(variable))
      return this.saveArray(variable, description, className);
    
    // Access to 'isEntity' property is trapped by proxy.
    // (see EntityProxyHandler.get()).
    if (variable.isEntity === true)
      // Entities are saved to a separate files. Only a string
      // id of an entity is saved here.
      return IndirectValue.createEntitySaver(variable).saveToJsonObject();

    // 'variable' is a saveableObject (but not an entity).
    if (this.isSaveableObject(variable))
      return variable.saveToJsonObject();

    if (this.isTypeDate(variable))
      //return this.saveDate(variable);
      return IndirectValue.createDateSaver(variable).saveToJsonObject();

    if (this.isTypeMap(variable))
      return IndirectValue.createMapSaver(variable).saveToJsonObject();

    if (this.isTypeSet(variable))
      return IndirectValue.createSetSaver(variable).saveToJsonObject();

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
        this.saveVariable(sourceObject[property], property, 'Object');
    }

    return jsonObject;
  }

  // The purpose of manual loading of properties of primitive Objects
  // is to determine if some of them are SaveableObjects so they need
  // to be loaded using their loadFromJsonObject() method.
  // (this check is done within this.loadVariable() call)
  private loadPrimitiveObject
  (
    primitiveObject: any,
    jsonObject: any,
    path: string
  )
  {
    // Now copy the data.
    for (let propertyName in jsonObject)
    {
      /// Tohle je blbost.
      /// - když loaduju hashmapu nebo pole, tak všechny
      ///   prvky téměř určitě před loadem neexistujou,
      ///   tzn. objekty do nich vnořené určitě nemají.
      ///   žádné properties. Tohle pak vede k tomu, že
      //    se do hashmapy loadnou prázdné objekty.
      // // Note:
      // //   Only properties that exist on the object that is being loaded
      // // are loaded from save. It means that you can remove properties
      // // from existing objects without converting existing save files.
      // // (no syslog message is generated)
      // if (primitiveObject[propertyName] !== undefined)
      // {
        // Note:
        //   We are cycling over properties in JSON object, not in
        // object that is being loaded. It means that properties
        // that are not present in the save will not get overwritten.
        // This allows adding new properties to existing classes without
        // the need to convert all save files.
        primitiveObject[propertyName] = this.loadVariable
        (
          propertyName,
          primitiveObject[propertyName],
          jsonObject[propertyName],
          path
        );
      //}
    }

    return primitiveObject;
  }

  // Variable is of primitive type (number or string).
  private isPrimitiveValue(variable: any): boolean
  {
    return typeof variable !== 'object';
  }

  // private isEntity(variable: any): boolean
  // {
  //   // Note:
  //   //   Access to 'isEntity' property is trapped by proxy.
  //   // (see EntityProxyHandler.get()). If variable doesn't
  //   // have 'isEntity' property, the value is 'undefined'
  //   // which, compared to 'true', will return 'false.
  //   return variable.isEntity === true;
  // }

  private isSaveableObject(variable: any): boolean
  {
    return ('saveToJsonObject' in variable);
  }

  private isPrimitiveObject(variable: any): boolean
  {
    if (variable === null)
    {
      ERROR("Null varible");
      return false;
    }

    return variable.constructor.name === 'Object';
  }

  // Note: This method should not be named 'isSet', because it would
  //   collide with 'isSet()' method of class Flags.
  private isTypeDate(variable: any): boolean
  {
    if (variable === null)
    {
      ERROR("Null varible");
      return false;
    }

    // Dirty hack to check if object is of type 'Date'.
    return variable.constructor.name === 'Date';
  }

  private isTypeSet(variable: any): boolean
  {
    if (variable === null)
    {
      ERROR("Null varible");
      return false;
    }

    // Dirty hack to check if object is of type 'Set'.
    return variable.constructor.name === 'Set';
  }

  private isTypeMap(variable: any): boolean
  {
    if (variable === null)
    {
      ERROR("Null varible");
      return false;
    }

    // Dirty hack to check if object is of type 'Map'.
    return variable.constructor.name === 'Map';
  }

  private validJsonObjectCheck
  (
    propertyName: string,
    jsonObject: any,
    path: string
  )
  : boolean
  {
    if (jsonObject === null)
    {
      ERROR("Null jsonObject when loading property"
        + " '" + propertyName + "' from file"
        + " " + path + ". Property not loaded");
      return false;
    }

    return true;
  }

  // -> Returns 'null' if jsonVariable is not a Date or if loading failed.
  private loadAsDate
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    path: string
  )
  {
    if (!IndirectValue.isDate(jsonVariable))
      return null;

    if (variable !== null && variable !== undefined && !this.isTypeDate(variable))
    {
      ERROR("Attempt to load Date property '" + variableName + "'"
        + " from file " + path + " to a non-Date property");
      return null;
    }

    return this.loadDateFromJsonObject
    (
      variableName,
      jsonVariable,
      path
    );
  }

  private loadDateFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    path: string
  )
  : Date
  {
    if (!this.validJsonObjectCheck(propertyName, jsonObject, path))
      return null;

    let date = jsonObject.date;

    if (date === undefined || date === null)
    {
      ERROR("Missing or invalid 'date' when loading date record"
        + " '" + propertyName + "' from JSON file " + path);
      return null;
    }

    return new Date(date);
  }

  // -> Returns 'null' if jsonVariable is not a Set or if loading failed.
  private loadAsSet
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    path: string
  )
  {
    if (!IndirectValue.isSet(jsonVariable))
      return null;

    if (variable !== null && variable !== undefined && !this.isTypeSet(variable))
    {
      ERROR("Attempt to load Set property '" + variableName + "'"
        + " from file " + path + " to a non-Set property");
      return null;
    }

    return this.loadSetFromJsonObject
    (
      variableName,
      jsonVariable,
      path
    );
  }

  // -> Returns 'null' if jsonVariable is not a Map or if loading failed.
  private loadAsMap
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    path: string
  )
  {
    if (!IndirectValue.isMap(jsonVariable))
      return null;

    if (variable !== null && variable !== undefined && !this.isTypeMap(variable))
    {
      ERROR("Attempt to load Map property '" + variableName + "'"
        + " from file " + path + " to a non-Map property");
      return null;
    }

    return this.loadMapFromJsonObject
    (
      variableName,
      jsonVariable,
      path
    );
  }

  private loadSetFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    path: string
  )
  : Set<any>
  {
    if (!this.validJsonObjectCheck(propertyName, jsonObject, path))
      return null;

    // Our set is stored as array in jsonObject.set property.
    let setData = jsonObject.set;

    if (setData === undefined || setData === null)
    {
      ERROR("Missing or invalid 'set' property when loading"
        + " Set record '" + propertyName + "' from JSON file"
        + " " + path);
      return null;
    }
    
    // We need to properly load items within 'setData' array,
    // because they may be SaveableObjects or special records.
    let setArray = this.loadArray(propertyName, setData, path);

    return new Set(setArray);
  }

  private loadMapFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    path: string
  )
  : Map<any, any>
  {
    if (!this.validJsonObjectCheck(propertyName, jsonObject, path))
      return null;

    // Our map is stored as array in jsonObject.set property.
    let mapData = jsonObject.map;

    if (mapData === undefined || mapData === null)
    {
      ERROR("Missing or invalid 'map' property when loading"
        + " Map record '" + propertyName + "' from JSON file"
        + " " + path);
      return null;
    }

    // We need to properly load items within 'mapData' array,
    // because they may be SaveableObjects or special records.
    let mapArray = this.loadArray(propertyName, mapData, path);

    return new Map(mapArray);
  }

  // -> Returns 'null' if jsonVariable is not an entity reference
  //    or if loading failed.
  private loadAsEntityReference
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    path: string
  )
  {
    if (!IndirectValue.isReference(jsonVariable))
      return null;

    return this.loadReference
    (
      variableName,
      jsonVariable,
      path
    );
  }

  // If 'id' loaded from JSON already exists in Entities,
  // existing entity proxy will be returned. Otherwise an 'invalid'
  // entity proxy will be created and returned.
  // Note:
  //   This method doesn't actualy load an entity. If you want
  // to load an entity from file, call load() on what's returned
  // by this method.
  // -> Retuns an entity proxy object (possibly referencing an invalid entity).
  public loadReference
  (
    propertyName: string,
    jsonObject: any,
    path: string
  )
  : Entity
  {
    if (!this.validJsonObjectCheck(propertyName, jsonObject, path))
      return null;

    let id = jsonObject.id;

    if (id === undefined || id === null)
    {
      ERROR("Missing or invalid 'id' property when loading"
        + " entity reference '" + propertyName + "' from JSON"
        + " file " + path);
    }

    // Return an existing entity proxy if entity exists in
    // entityManager, invalid entity proxy otherwise.
    return ServerApp.entityManager.createReference(id);
  }

  // -> Returns 'null' if jsonVariable is not an Array or if loading failed.
  private loadAsArray
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    path: string
  )
  {
    if (!Array.isArray(jsonVariable))
      return null;

    if
    (
      variable !== null
      && variable !== undefined
      && !Array.isArray(variable)
    )
    {
      ERROR("Attempt to load Array property '" + variableName + "'"
        + " from file " + path + " to a non-Array property");
      return null;
    }

    return this.loadArray(variableName, jsonVariable, path)
  }

  // Loads a property of type Array from a JSON Array object.
  private loadArray
  (
    propertyName: string,
    jsonArray: Array<any>,
    path: string
  )
  {
    if (jsonArray === null || jsonArray === undefined)
    {
      ERROR("Attempt to loadArray from invalid jsonObject"
        + " '" + propertyName + "' loaded from file " + path);
      return null;
    }
    
    if (!Array.isArray(jsonArray))
    {
      ERROR("Attempt to loadArray from non-array jsonObject"
        + " '" + propertyName + "' loaded from file " + path);
      return null;
    }

    let newArray = [];

    for (let i = 0; i < jsonArray.length; i++)
    {
      let item = this.loadVariable
      (
        "Array Item",
        // We need to pass 'null' as 'variable' so an instance
        // of corect type will be created (by createNewIfNull()).
        null,
        jsonArray[i],
        path
      );

      newArray.push(item);
    }

    return newArray;
  }

  // -> Returns 'null' if jsonVariable is not an Object or if loading failed.
  private loadAsObject
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    path: string
  )
  {
    if (typeof jsonVariable !== 'object')
      return null;

    if
    (
      variable !== null
      && variable !== undefined
      && typeof variable !== 'object'
    )
    {
      ERROR("Attempt to load Object property '" + variableName + "'"
        + " from file " + path + " to a non-Object property");
      return null;
    }

    return this.loadObjectVariable
    (
      variableName,
      variable,
      jsonVariable,
      path
    );
  }

  private loadObjectVariable
  (
    propertyName: string,
    myProperty: any,
    jsonObject: any,
    path: string
  )
  : any
  {
    // If our corresponding property is null, it wouldn't be able to
    // load itself from JSON, because you can't call methods on null
    // object. So we first need to assign a new instance of correct
    // type to it - the type is saved in JSON in 'className' property.
    myProperty = this.createNewIfNull
    (
      propertyName,
      myProperty,
      jsonObject,
      path
    );

    if (myProperty === null || myProperty === undefined)
    {
      ERROR("Failed to instantiate property '" + propertyName + "'"
        + " when loading from file '" + path + "'");
      return null;
    }

    // Now we are sure that myProperty isn't null (either it wasn't
    // null or we have just assigned a new instance of correct type in
    // it). So we can safely load it from corresponding JSON.

    if ('loadFromJsonObject' in myProperty)
    {
      // If we are loading into a saveable object, do it using it's
      // loadFromJsonObject() method.
      myProperty.loadFromJsonObject(jsonObject, path);

      return myProperty;
    }

    // We are loading object that is neither Date, Map nor SaveableObject.
    return this.loadPrimitiveObject
    (
      myProperty,
      jsonObject,
      path
    );
  }
}
*/