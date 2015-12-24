/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

/*
  Usage: See usage of SaveableContainer.
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

  // You can set this flag to false to prevent saving of SaveableObject
  public isSaveable = true;

  // -------------- Protected methods -------------------

  protected checkVersion(jsonObject: Object)
  {
    ASSERT_FATAL('version' in jsonObject,
      "There is no 'version' property in JSON data");

    ASSERT_FATAL(jsonObject['version'] === this.version,
      "Version of JSON data (" + jsonObject['version'] + ")"
      + " doesn't match required version (" + this.version + ")");
  }

  protected async loadFromFile(filePath: string)
  {
    // Note: Unline writing the same file while it is saving, loading
    // from the same file while it is loading is not a problem (according
    // to node.js filestream documentation). So we don't need to bother with
    // loading locks.

    let jsonString = "";

    try
    {
      // Asynchronous reading from the file.
      // (the rest of the code will execute only after the reading is done)
      jsonString = await promisifiedFS.readFile(filePath, 'utf8');
    }
    catch (error)
    {
      Mudlog.log(
        "Error loading file '" + filePath + "': " + error.code,
        Mudlog.msgType.SYSTEM_ERROR,
        Mudlog.levels.IMMORTAL);

      // Throw the exception so the mud will get terminated with error
      // message.
      throw error;
    }

    this.loadFromJsonString(jsonString);
  }

  protected async saveToFile(filePath: string)
  {
///    console.log("saveToFile()");

    // lastIssuedId needs to be saved each time we are saved because we might
    // be saving ids that were issued after last lastIssuedId save.
    await Server.idProvider.saveLastIssuedId();

    await this.saveContentsToFile(filePath);

    // Save current lastIssuedId once more, because it is possible that while
    // we were saving it, another one was issued and saved withing the object
    // we jast saved.
    // (It would actually be ok just to save it here, but lastIssuedId
    // consistency is absolutely crucial, so better be safe)
    await Server.idProvider.saveLastIssuedId();
  }

  protected async saveContentsToFile(filePath: string)
  {
    let jsonString = this.saveToJsonString();

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

      return;
    }
    else
    {
      this.mySaveRequests.push(filePath);
    }

    for (let i = 0; i < this.mySaveRequests.length; i++)
    {
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
        throw error;
      }
    }

    // All save requests are processed, mark the buffer as empty.
    // (if will also hopefully flag allocated data for freeing from memory)
    this.mySaveRequests = [];
  }

  protected loadFromJsonString(jsonString: string)
  {
    let jsonObject = {};

    try
    {
      jsonObject = JSON.parse(jsonString);
    }
    catch (e)
    {
      ASSERT_FATAL(false, "Syntax error in JSON string: " + e.message);
    }

    this.loadFromJsonObject(jsonObject);
  }

  protected saveToJsonString(): string
  {
    let regExp: RegExp;
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

  protected loadFromJsonObject(jsonObject: Object)
  {
    let property = "";

    this.checkVersion(jsonObject);

    // Check if we have the same set of properties as the JSON data we are
    // trying to load ourselves from.
    for (property in this)
    {
      // Skip our methods, they are not saved to json of course.
      //   Also skip 'mySaveRequests' property, which is used to micromanage
      // asynchronous saving and is not saved. Also skip 'isSaveable' property.
      if (typeof this[property] !== 'function'
        && property !== 'mySaveRequests'
        && property !== 'isSaveable')
      {
        ASSERT_FATAL(property in jsonObject,
          "Property '" + property + "' exists in object but not in JSON data"
          + " we are trying to load ourselves from. Maybe you forgot to"
          + " change the version and convert JSON files to a new format?");
      }
    }

    // Also the other way around.
    for (property in jsonObject)
    {
      ASSERT_FATAL(property in this,
        "Property '" + property + "' exists in JSON data we are trying to"
        + " load ourselves from but we don't have it. Maybe you forgot to"
        + " change the version and convert JSON files to a new format?");
    }

    // Now copy the data.
    for (property in jsonObject)
    {
      ASSERT_FATAL(this[property] !== null,
        "There is a property (" + property + ") in this object with null"
        + " value, which is to be loaded from json. That's not possible,"
        + " because loading method can't be called on null object. Make"
        + " sure that all properties on this class are inicialized to"
        + " something else than null");

      if (this[property] !== null
        && typeof this[property] === 'object'
        && 'loadFromJsonObject' in this[property])
      {
        // This handles the situation when you put SaveableObject into
        // another SaveableObject.
        this[property].loadFromJsonObject(jsonObject[property]);
      }
      else
      {
        this[property] = jsonObject[property];
      }
    }
  }

  protected saveToJsonObject(): Object
  {
    let jsonObject: Object = {};

    for (let property in this)
    {
      // mySaveRequests object is not to be saved, it is used to micromanage
      // asynchronous saving.
      if (property === 'mySaveRequests')
        continue;

      if (property === 'isSaveable')
        continue;

      // This handles the situation when you put SaveableObject into
      // another SaveableObject.
      if (typeof this[property] === 'object'
          && 'saveToJsonObject' in this[property])
      {
        jsonObject[property] = this[property].saveToJsonObject();
      }
      else
      {
        jsonObject[property] = this[property];
      }
    }

    return jsonObject;
  }
}