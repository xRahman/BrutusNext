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
  // -------------- Protected class data ----------------

  // Version will be checked for. Default behaviour is to trigger
  // a FATAL_ASSERT when versions don't match. You can override it
  // by overriding a checkVersion() method;
  protected version = 0;

  // Buffer to stack save requests issued while already saving ourselves.
  // Also serves as lock - if it's not null, it means we are already saving
  // ourselves.
  // (note: This property is not saved)
  protected mySaveRequests: Array<string> = [];

  // You can set this flag to false to prevent saving of SaveableObject.
  public isSaved = true;

  // -------------- Protected methods -------------------

  protected checkVersion(jsonObject: Object, filePath: string)
  {
    ASSERT_FATAL('version' in jsonObject,
      "There is no 'version' property in JSON data in file " + filePath);

    ASSERT_FATAL(jsonObject['version'] === this.version,
      "Version of JSON data (" + jsonObject['version'] + ")"
      + " in file " + filePath
      + " doesn't match required version (" + this.version + ")");
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
      // (create a new Error object, because the one we have cought here
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
    // (According to node.js documentation, it's ok not to check if
    // directory exist prior to calling mkdir(), the check is done by it)
    try
    {
      await promisifiedFS.mkdir(directory);
    }
    catch (e)
    {
      // It's ok if the directory exists, it's what we wanted to ensure.
      // So just do nothing.
    }

    // lastIssuedId needs to be saved each time we are saved because we might
    // be saving ids that were issued after last lastIssuedId save.
    await Server.idProvider.saveLastIssuedId();

    await this.saveContentsToFile(directory + fileName);

    // Save current lastIssuedId once more, because it is possible that while
    // we were saving it, another one was issued and saved withing the object
    // we jast saved.
    // (It would actually be ok just to save it here, but lastIssuedId
    // consistency is absolutely crucial, so better be safe)
    await Server.idProvider.saveLastIssuedId();
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
    this.mySaveRequests = [];
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
      ASSERT_FATAL(this[property] !== null,
        "There is a property (" + property + ") in object that is loading"
        + " from file " + filePath + " that has <null> value. That's not"
        + " allowed, because loading method can't be called on null object."
        + " Make sure that all properties of class '" + this.className + "'"
        + " are inicialized to something else than <null>");

      if
      (
        this[property] !== null
        && typeof this[property] === 'object'
        && 'loadFromJsonObject' in this[property]
      )
      {
        // This handles the situation when you put SaveableObject into
        // another SaveableObject.
        //   filePath is passed just so it can be printed to error messages.
        this[property].loadFromJsonObject(jsonObject[property], filePath);
      }
      else
      {
        // 'version' and 'className' properties are not loaded. Classname
        // needs to be the same of course (which is checked previously), version
        // might differ if someone bumped it up in the code, but in that case
        // we really need it to bump up, so we don't want to overwrite new
        // version number with the old value from saved file.
        if (property !== 'version' && property !== 'className')
        {
          this[property] = jsonObject[property];
        }
      }
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

    // Cycle through all properties in this object
    for (let property in this)
    {
      if (this.isNonNullObject(property))
      {
        // If property is not a saveable object or it's 'isSaved' property
        // is set to false, we do nothing so it won't get saved.
        if (this.isSaveableObjectToBeSaved(property))
        {
          jsonObject[property] = this[property].saveToJsonObject();
        }
      }
      else
      {
        // Don't save 'name' property here, because we saved it by hack
        // as the first property to be saved.
        if (this.isSavedProperty(property) && property !== 'name')
        {
          jsonObject[property] = this[property];
        }
      }
    }

    return jsonObject;
  }

  // --------------- Private methods --------------------

  private isNonNullObject(property: string): boolean
  {
    return this[property] !== null && typeof this[property] === 'object';
  }

  private isSaveableObjectToBeSaved(property: string): boolean
  {
    return this.isNonNullObject(property)
      && 'saveToJsonObject' in this[property]
      && this[property].isSaved === true;
  }

  private isSavedProperty(property: string): boolean
  {
    // These are our auxiliary properties that should not be saved.
    return property !== 'mySaveRequests' && property !== 'isSaved';
  }

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
    for (let i = 0; i < this.mySaveRequests.length; i++)
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
          .writeFile(this.mySaveRequests[i], jsonString, 'utf8');
      }
      catch (error)
      {
        Mudlog.log(
          "Error saving file '" + this.mySaveRequests[i] + "': " + error.code,
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
    // mySaveRequests serves both as buffer for request and as lock indicating
    // that we are already saving something (it it contains something).
    if (this.mySaveRequests.length !== 0)
    {
      // Saving to the same file while it is still being saved is not safe
      // (according to node.js filestream documentation). So if this occurs,
      // we won't initiate another save at once, just remember that a request
      // has been issued (and where are we supposed to save ourselves).

      // Only push requests to save to different path.
      // (there is no point in future resaving to the same file multiple times)
      if (this.mySaveRequests.indexOf(filePath) !== -1)
        this.mySaveRequests.push(filePath);

      return true;
    }

    // If saving is not going on right now, push the request to the
    // buffer,
    this.mySaveRequests.push(filePath);

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

    // Also the other way around.
    for (property in jsonObject)
    {
      ASSERT_FATAL(property in this,
        "Property '" + property + "' exists in JSON data in file " + filePath
        + " we are trying to load ourselves from but we don't have it."
        + " Maybe you forgot to change the version and convert JSON files"
        + " to a new format?");
    }
  }
}