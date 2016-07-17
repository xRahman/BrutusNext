/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';
import {AttributableClass} from '../shared/AttributableClass';
import {FileSystem} from '../shared/fs/FileSystem';
import {Mudlog} from '../server/Mudlog';
import {Server} from '../server/Server';

let beautify = require('js-beautify').js_beautify;

export class SaveableObject extends AttributableClass
{
  // Creates a new instance of type className.
  static createInstance<T>
  (
    param:
    {
      className: string,
      typeCast: { new (...args: any[]): T }
    },
    // Any extra arguments are passed to the class constructor.
    ...args: any[]
  )
  {
    // Here we are going to dynamically create an instance of a class
    // className. We will use global object to acces respective class
    //constructor.

    ASSERT_FATAL
    (
      typeof param.className !== 'undefined'
          && param.className !== null
          && param.className != "",
      "Invalid class name passed to SaveableObject::createInstance()"
    );

    // In order to dynamically create a class from class name, we need it's
    // constructor. It means you need to add it as a property to 'global'
    // object, because it's not done automatically in node.js.
    ASSERT_FATAL
    (
      typeof global[param.className] !== 'undefined',
      "Attempt to createInstance() of unknown type"
      + " '" + param.className + "'. You probably forgot to add"
      + " a record to DynamicClasses.ts file for your new class."
    );

    // This accesses a class constructor by it's name. Consctructor of
    // each class that is supposed to be dynamically loaded here needs
    // to be added to 'global' object in DynamicClasses.ts file.
    let newObject = new global[param.className](...args);

    // Type cast to <SaveableObject> is here for TypeScript to be roughly
    // aware what can it expect from newly created variable - otherwise it
    // would be of type <any>.
    return <SaveableObject>newObject;


    // Dynamic type check - we make sure that our newly created object
    // is inherited from requested class (or an instance of the class itself).
    if (newObject instanceof param.typeCast)
      // Here we typecast to <any> in order to pass newObject
      // as type T (you can't typecast directly to template type but you can
      // typecast to <any> which is then automatically cast to template type).
      return <any>newObject;

    ASSERT(false,
      "Type cast error: Newly created object "
      + "of type '" + param.className + "' is not an instance"
      + " of requested type (" + param.typeCast.name + ")");

    return null;
  }

  // -------------- Protected class data ----------------

  // Version will be checked for. Default behaviour is to trigger
  // a FATAL_ASSERT when versions don't match. You can override it
  // by overriding a checkVersion() method;
  protected version = 0;

  // Buffer to stack save requests issued while already saving ourselves.
  // Also serves as lock - if it's not null, it means we are already saving
  // ourselves.
  // (note: This property is not saved)
  protected saveRequests: Array<string> = [];
  protected static saveRequests = { isSaved: false };

  // -------------- Protected methods -------------------

  protected checkVersion(jsonObject: Object, filePath: string)
  {
    ASSERT_FATAL('version' in jsonObject,
      "There is no 'version' property in JSON data in file " + filePath);

    ASSERT_FATAL(jsonObject['version'] === this.version,
      "Version of JSON data (" + jsonObject['version'] + ")"
      + " in file " + filePath + " doesn't match required"
      + " version (" + this.version + ")");
  }

  protected async loadFromFile(filePath: string)
  {
    //  Unlike writing the same file while it is saving, loading from
    //  the same file while it is loading is not a problem (according
    //  to node.js filestream documentation). So we don't need to bother
    //  with loading locks.

    // Asynchronous reading from the file.
    // (the rest of the code will execute only after the reading is done)
    //jsonString = await promisifiedFS.readFile(filePath, 'utf8');
    let jsonString = await FileSystem.readFile(filePath);

    // filePath is passed just so it can be printed to error messages.
    this.loadFromJsonString(jsonString, filePath);
  }

  protected async saveToFile(directory: string, fileName: string)
  {
    ASSERT_FATAL(directory.substr(directory.length - 1) === '/',
      "Directory path '" + directory + "' doesn't end with '/'");

    // Directory might not yet exist, so we better make sure it does.
    await FileSystem.ensureDirectoryExists(directory);
    await this.saveContentsToFile(directory + fileName);
  }

  protected async saveContentsToFile(filePath: string)
  {
    // If we are already saving ourselves, the request will be added
    // to the buffer and processed after ongoing saving ends.
    if (this.bufferSaveRequest(filePath))
      return;
    
    // If we are not saving ourselves right now, process buffered requests.

    // Asynchronous saving to file.
    // (the rest of the code will execute only after the saving is done)
    await this.processBufferedSavingRequests();

    // All save requests are processed, mark the buffer as empty.
    // (if will also hopefully flag allocated data for freeing from memory)
    this.saveRequests = [];
  }

  protected loadFromJsonString(jsonString: string, filePath: string)
  {
    let jsonObject = {};

    try
    {
      jsonObject = JSON.parse(jsonString);
    }
    catch (e)
    {
      ASSERT_FATAL(false, "Syntax error in JSON string: "
        + e.message + " in file " + filePath);
    }

    // filePath is passed just so it can be printed to error messages.
    this.loadFromJsonObject(jsonObject, filePath);
  }

  protected saveToJsonString(): string
  {
    let jsonString = JSON.stringify(this.saveToJsonObject());

    jsonString = beautify
    (
      jsonString,
      {
        "indent_size": 2,
        "indent_char": " ",
        "eol": "\n",
        "brace_style": "expand",
        "keep_array_indentation": true,
        "end_with_newline": false
      }
    );

    return jsonString;
  }

  protected loadFromJsonObject(jsonObject: Object, filePath: string)
  {
    // filePath is passed just so it can be printed to error messages.
    this.checkVersion(jsonObject, filePath);

    // className must be the same as it's saved value.
    this.checkClassName(jsonObject, filePath);

    // filePath is passed just so it can be printed to error messages.
    this.checkThatAllPropertiesInJsonExistInThis(jsonObject, filePath);

    // Using 'in' operator on object with null value would cause crash.
    ASSERT_FATAL(jsonObject !== null,
      "Invalid json object loaded from file " + filePath);

    // Now copy the data.
    for (let property in jsonObject)
    {
      this[property] =
        this.loadVariable
        (
          property,
          this[property],
          jsonObject[property],
          filePath
        );
    }
  }

  protected saveToJsonObject(): Object
  {
    let jsonObject: Object = {};

    // A little hack - save 'name' property first (out of order). This is to
    // make saved JSON files more readable.
    if ('name' in this)
    {
      jsonObject['name'] = this['name'];
    }

    // Cycle through all properties in this object.
    for (let property in this)
    {
      // Skip 'name' property because it's already saved thanks to
      // previous hack.
      // (isToBeSaved() checks static attribute property.isSaved)
      if (property !== 'name' && this.isToBeSaved(property))
      {
        jsonObject[property] =
          this.saveVariable(this[property], property, this.className);
      }
    }

    return jsonObject;
  }

  // --------------- Private methods --------------------

  private checkClassName (jsonObject: Object, filePath: string)
  {
    ASSERT_FATAL('className' in jsonObject,
      "There is no 'className' property in JSON data in file " + filePath);

    ASSERT_FATAL(jsonObject['className'] === this.className,
      "Attempt to load JSON data of class (" + jsonObject['className'] + ")"
      + " in file " + filePath
      + " into instance of incompatible class (" + this.className + ")");
  }

  private async processBufferedSavingRequests()
  {
    for (let i = 0; i < this.saveRequests.length; i++)
    {
      // Save ourselves to json string each time we are saving ourselves,
      // because our current stat might change while we were saving (remember
      // this is an async function so next step in this for cycle will be
      // processed only after the previous saving ended).
      let jsonString = this.saveToJsonString();

      // Asynchronous saving to file.
      // (the rest of the code will execute only after the saving is done)
      await FileSystem.writeFile(this.saveRequests[i], jsonString);
    }
  }

  // Returns true when request is buffered and there is no need to process
  // it right now.
  private bufferSaveRequest(filePath: string): boolean
  {
    // saveRequests serves both as buffer for request and as lock indicating
    // that we are already saving something (it it contains something).
    if (this.saveRequests.length !== 0)
    {
      // Saving to the same file while it is still being saved is not safe
      // (according to node.js filestream documentation). So if this occurs,
      // we won't initiate another save at once, just remember that a request
      // has been issued (and where are we supposed to save ourselves).

      // Only push requests to save to different path.
      // (there is no point in future resaving to the same file multiple times)
      if (this.saveRequests.indexOf(filePath) !== -1)
        this.saveRequests.push(filePath);

      return true;
    }

    // If saving is not going on right now, push the request to the
    // buffer,
    this.saveRequests.push(filePath);

    // and return false to indicate, that it needs to be processed right away.
    return false;
  }

  private checkThatAllPropertiesInJsonExistInThis
  (
    jsonObject: Object,
    filePath: string
  )
  {
    let property = "";

    for (property in jsonObject)
    {
      ASSERT_FATAL(property in this,
        "Property '" + property + "' exists in JSON data in file " + filePath
        + " we are trying to load ourselves from but we don't have it."
        + " Maybe you forgot to change the version and convert JSON files"
        + " to a new format?");
    }
  }

  // Loads a property of type Array from a JSON Array object.
  private loadArray
  (
    propertyName: string,
    jsonProperty: Array<any>,
    filePath: string
  )
  {
    let newArray = [];

    for (let i = 0; i < jsonProperty.length; i++)
    {
      // newProperty needs to be set to null prior to calling loadVariable(),
      // so an instance of the correct type will be created.
      let newProperty = null;

      newProperty =
        this.loadVariable
         (
          "Array Item",
          newProperty,
          jsonProperty[i],
          filePath
        );

      newArray.push(newProperty);
    }

    return newArray;
  }

  // Loads a single variable from JSON object.
  private loadVariable
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    filePath: string
  ): any
  {
    // First handle the case that property in JSON has null value. In that
    // case our property also needs to be null, no matter what type it is.
    if (jsonVariable === null)
      return null;

    if (Array.isArray(jsonVariable))
    {
      ASSERT_FATAL(variable === null || Array.isArray(variable),
        "Attempt to load array property '" + variableName + "' to"
        + " a non-array property.");

      return this.loadArray(variableName, jsonVariable, filePath);
    }
    else
    {
      return this.loadNonArrayVariable
      (
        variableName,
        variable,
        jsonVariable,
        filePath
      );
    }
  }

  // If myProperty is null, a new instance of correct type will be
  // created and returned.
  // (Type is read from jsonProperty.className)
  private createNewIfNull
  (
    propertyName: string,
    myProperty: any,
    jsonProperty: Object,
    filePath: string
  )
  {
    if (myProperty === null)
    {
      ASSERT_FATAL
      (
        jsonProperty['className'] !== undefined,
        "Missing 'className' property in a nested object in file "
        + filePath + ". You probably assigned <null> to a property"
        + " of some generic object type (default javascript Object,"
        + " Date or Array) or of a class type not inherited from"
        + " NamedClass. Make sure that properties of these types are"
        + " never assigned <null> value or inicialized to <null>."
      );

      // Initiate our property to a new instance of correct type.
      // (Type is saved as 'className' property)
      myProperty =
        SaveableObject.createInstance(jsonProperty['className']);
    }

    return myProperty;
  }

  private loadNonArrayVariable
  (
    propertyName: string,
    myProperty: any,
    jsonProperty: any,
    filePath: string
  )
  {
    // If we are loading property of primitive type (Number or String),
    // we just assign the value.
    if (typeof jsonProperty !== 'object')
    {
      // Note: Date object is actually saved as value of primitive type
      // (string), not as an object.
      // In order to recognize that we are loading a date, we will check
      // the type of property we are loading the date to.
      // (This wouldn't work if value of Date property we are loading the
      //  date to would be <null> - which is why it's not allowed to assign
      //  <null> to Date properties or initialize them with <null>)
      if (this.isDate(myProperty))
      {
        // Date object is not automatically created by JSON.parse(),
        // only it's string representation. So we need to pass the JSON
        // string representing value of date to a constructor of Date
        // object to convert it to Date object.
        return new Date(jsonProperty);
      }
      else
      {
        return jsonProperty;
      }
    }

    // Here we are sure that jsonProperty is an Object.

    // If our corresponding property is null, it wouldn't be able to
    // load itself from JSON, because you can't call methods on null
    // object. So we first need to assign a new instance of correct
    // type to it - the type is saved in JSON in 'className' property.
    myProperty =
      this.createNewIfNull
      (
        propertyName,
        myProperty,
        jsonProperty,
        filePath
      );

    // Now we are sure that myProperty isn't null (either it wasn't
    // null or we have just assigned a new instance of correct type in
    // it). So we can safely load it from corresponding JSON.

    if ('loadFromJsonObject' in myProperty)
    {
      // If we are loading into a saveable object, do it using it's
      // loadFromJsonObject() method.
      myProperty.loadFromJsonObject(jsonProperty, filePath);

      return myProperty;
    }
    else  // We are loading object that is neither Date nor SaveableObject.
    {
      return this.loadPrimitiveObjectFromJson
      (
        propertyName,
        myProperty,
        jsonProperty,
        filePath
      );
    }
  }

  // Saves a property of type Array to a corresponding JSON Array object.
  private saveArray(array: Array<any>, arrayName: string, className: string)
  {
    let jsonArray = [];

    // Note: isSaved static attribute is not tested for members of an array.
    // Either the whole array is saved, or it's not saved at all. Having
    // 'holes' in an array after loading (probably with <null> values) would
    // certainly be confusing after all.
    for (let i = 0; i < array.length; i++)
    {
      let itemDescription = "an item of an array '" + arrayName + "'"
        + " at position " + i;
      jsonArray.push(this.saveVariable(array[i], itemDescription, className));
    }

    return jsonArray;
  }

  // Saves a single variable to a corresponding JSON object.
  // (description is a string used for error message. It should describe
  //  the property as well as possible - what's it's name, what it's in, etc.)
  private saveVariable(variable: any, description: string, className: string)
  {
    if (variable === null)
      return null;

    if (Array.isArray(variable))
    {
      return this.saveArray(variable, description, className);
    }
    else if (typeof variable === 'object')
    {
      // myProperty is a saveableObject
      if ('saveToJsonObject' in variable)
        return variable.saveToJsonObject();

      if (this.isDate(variable))
        return variable;

      if (this.isPrimitiveJavascriptObject(variable))
        return this.savePrimitiveObjectToJson(variable);

      ASSERT_FATAL(false,
        "Variable '" + description + "' in class '" + className + "'"
        + " (or some of it's ancestors) is a class but is not inherited"
        + " from SaveableObject. Make sure that you only use primitive"
        + " types (numbers, strings), Arrays, basic javascript Objects"
        + " or classes inherited from SaveableObject as a properties of"
        + " class inherited from SaveableObject.");
    }
    else  // Variable is of primitive type (number or string).
    {
      return variable;
    }
  }

  // Check if there is a static property named the same as property,
  // an if it's value contains: { isSaved = false; }
  private isToBeSaved(property: string): boolean
  {
    // Access static variable named the same as property.
    let propertyAttributes = this.getPropertyAttributes(this, property);

    // If attributes for our property exist.
    if (propertyAttributes !== undefined)
    {
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
  private savePrimitiveObjectToJson(variable: any): Object
  {
    let jsonObject: Object = {};
    
    for (let property in variable)
    {
      jsonObject[property] =
        this.saveVariable(variable[property], property, 'Object');
    }

    return jsonObject;
  }

  // The purpose of manual loading of properties of primitive Objects
  // is to determine if some of them are SaveableObjects so they need
  // to be loaded using their loadFromJsonObject() method.
  // (this check is done within this.loadVariable() call)
  private loadPrimitiveObjectFromJson
  (
    propertyName: string,
    primitiveObject: any,
    jsonObject: any,
    filePath: string
  )
  {
    // Now copy the data.
    for (let property in jsonObject)
    {
      primitiveObject[property] =
        this.loadVariable
        (
          property,
          primitiveObject[property],
          jsonObject[property],
          filePath
        );
    }

    return primitiveObject;
  }

  private isPrimitiveJavascriptObject(variable: any): boolean
  {
    return variable.constructor.name === 'Object';
  }

  private isDate(variable: any): boolean
  {
    // Dirty hack to check if object is of type 'Date'.
    return Object.prototype.toString.call(variable) === '[object Date]';
  }
}