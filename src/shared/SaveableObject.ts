/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';
import {Mudlog} from '../server/Mudlog';
import {Server} from '../server/Server';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

// 3rd party modules.
let promisifiedFS = require('fs-promise');
let beautify = require('js-beautify').js_beautify;

export class SaveableObject extends NamedClass
{
  // Creates a new instance of game entity of type saved in id.
  static createInstance(className: string, ...args: any[])
  {
    // Here we are going to dynamically create an instance of a class
    // className. We will use global object to acces respective class
    //constructor.

    ASSERT_FATAL
    (
      typeof className !== 'undefined'
      && className !== null
      && className != "",
      "Invalid class name passed to SaveableObject::createInstance()"
    );

    // In order to dynamically create a class from class name, we need it's
    // constructor. It means you need to add it as a property to 'global'
    // object, because it's not done automatically in node.js.
    ASSERT_FATAL
    (
      typeof global[className] !== 'undefined',
      "Attempt to createInstance() of unknown type"
      + " '" + className + "'. You probably forgot to add"
      + " a record to DynamicClasses.ts file for your new class."
    );

    // This accesses a class constructor by it's name. Consctructor of
    // each class that is supposed to be dynamically loaded here needs
    // to be added to 'global' object in DynamicClasses.ts file.
    let newObject = new global[className](...args);

    // Type cast to <SaveableObject> is here for TypeScript to be roughly
    // aware what can it expect from newly created variable - otherwise it
    // would be of type <any>.
    return <SaveableObject>newObject;
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

    let jsonString = "";

    try
    {
      // Asynchronous reading from the file.
      // (the rest of the code will execute only after the reading is done)
      jsonString = await promisifiedFS.readFile(filePath, 'utf8');
    }
    catch (error)
    {
      Mudlog.log
      (
        "Error loading file '" + filePath + "': " + error.code,
        Mudlog.msgType.SYSTEM_ERROR,
        Mudlog.levels.IMMORTAL
      );

      // Throw the exception so the mud will get terminated with error
      // message.
      // (Create a new Error object, because the one we have cought here
      // doesn't contain stack trace)
      throw new Error;
    }

    // filePath is passed just so it can be printed to error messages.
    this.loadFromJsonString(jsonString, filePath);
  }

  protected async saveToFile(directory: string, fileName: string)
  {
    ASSERT_FATAL(directory.substr(directory.length - 1) === '/',
      "Directory path '" + directory + "' doesn't end with '/'");

    // Directory might not yet exist, so we better make sure it does.
    await promisifiedFS.ensureDir(directory);

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
    let regExp: RegExp;

    jsonString =
      beautify
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
        this.loadProperty
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
      //   Also skip 'saveRequests' property, because it's an auxiliary
      // buffer which doesn't need to be saved.
      if
      (
        property !== 'name'
        && property !== 'saveRequests'
        && this.shouldBeSaved(this[property])
      )
      {
        jsonObject[property] = this.saveProperty(this[property]);
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

      try
      {
        // Asynchronous saving to file.
        // (the rest of the code will execute only after the saving is done)
        await promisifiedFS
          .writeFile(this.saveRequests[i], jsonString, 'utf8');
      }
      catch (error)
      {
        Mudlog.log(
          "Error saving file '" + this.saveRequests[i] + "': " + error.code,
          Mudlog.msgType.SYSTEM_ERROR,
          Mudlog.levels.IMMORTAL);

        // Throw the exception so the mud will get terminated with error
        // message.
        // (create a new Error object, because the one we have cought here
        // doesn't contain stack trace)
        throw new Error;
      }
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
  private loadArrayProperty
  (
    propertyName: string,
    jsonProperty: Array<any>,
    filePath: string
  )
  {
    let newArray = [];

    for (let i = 0; i < jsonProperty.length; i++)
    {
      // newProperty needs to be set to null prior to calling loadProperty(),
      // so an instance of the correct type will be created.
      let newProperty = null;

      newProperty =
        this.loadProperty
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

  // Loads a single property from JSON object.
  private loadProperty
  (
    propertyName: string,
    myProperty: any,
    jsonProperty: Object,
    filePath: string
  )
  {
    // First handle the case that property in JSON has null value. In that
    // case our property also needs to be null, no matter what type it is.
    if (jsonProperty === null)
      return null;

    if (Array.isArray(jsonProperty))
    {
      return this.loadArrayProperty(propertyName, jsonProperty, filePath);
    }
    else
    {
      return this.loadNonArrayProperty
      (
        propertyName,
        myProperty,
        jsonProperty,
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
        typeof jsonProperty['className'] !== 'undefined',
        "Missing 'className' property in a nested object in file "
        + filePath
       );

      // Initiate our property to a new instance of correct type.
      // (Type is saved as 'className' property)
      myProperty =
        SaveableObject.createInstance(jsonProperty['className']);
    }

    return myProperty;
  }

  private loadNonArrayProperty
  (
    propertyName: string,
    myProperty: any,
    jsonProperty: Object,
    filePath: string
  )
  {
    if (typeof jsonProperty === 'object')
    {
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

      ASSERT_FATAL('loadFromJsonObject' in myProperty,
        "Attempt to load a nested object from file " + filePath + " into"
        + " a property '" + propertyName + "' which is not a saveable object."
        + " Maybe you forgot to extend your class from SaveableObject?");

      myProperty.loadFromJsonObject(jsonProperty, filePath);
    }
    else  // We are loading simple (non-object) property.
    {
      myProperty = jsonProperty;
    }

    return myProperty;
  }

  // Saves a property of type Array to a corresponding JSON Array object.
  private saveArrayProperty(myProperty: Array<any>)
  {
    let jsonArray = [];

    for (let i = 0; i < myProperty.length; i++)
    {
      if (this.shouldBeSaved(myProperty[i]))
      {
        let arrayItem = this.saveProperty(myProperty[i]);

        jsonArray.push(arrayItem);
      }
      else
      {
        // This means that items in array that should not be saved
        // will be saved as null values (so the indexes will match).
        jsonArray.push(null);
      }
    }

    return jsonArray;
  }

  // Saves a single property to a corresponding JSON object.
  private saveProperty(myProperty: any)
  {
    if (myProperty === null)
      return null;

    if (Array.isArray(myProperty))
    {
      return this.saveArrayProperty(myProperty);
    }
    else if (typeof myProperty === 'object')
    {
      return myProperty.saveToJsonObject();
    }
    else
    {
      return myProperty;
    }
  }

  // Property should not be saved only if it's a non-array object and there
  // is not a 'saveToJsonObject' property in it (so it can't be saved).
  private shouldBeSaved(myProperty: any)
  {
    // Searching for properties in <null> would lead to a crash, so better
    // check it.
    if (myProperty === null)
      return true;

    // We definitely want to save arrays.
    if (Array.isArray(myProperty))
      return true;

    // Note: If 'isSaved' property is not present on a saveable object,
    // it will be saved (because value of 'isSaved' will be <undefined>
    // so (myProperty.isSaved === false) will be false).
    // This is intended, it saves memory because we much more often want
    // saveable objects to be saved than not.
    if (myProperty.isSaved === false)
      return false;

    // This is the only case that should not be saved (note that we checked
    // if myProperty is array previously).
    if (typeof myProperty === 'object' && !('saveToJsonObject' in myProperty))
      return false;
 
    // This means it's a simple, nonobject property - so we want to save it.
    return true;
  }
}