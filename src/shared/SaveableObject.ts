/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

/*
  Usage: See usage of SaveableContainer.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

// Using this interface improves readability of code. You can't
// write just:
//   new SaveableObject(3);
// you need to write:
//   new SaveableObject({ version: 3 });
interface Version
{
  version: number
}

let beautify = require('js-beautify').js_beautify;

export class SaveableObject
{
  // Version will be checked for. Default behaviour is to trigger
  // a FATAL_ASSERT when versions don't match. You can override it
  // by overriding a checkVersion() method;
  protected version = 0;

  // Version is passed as object because it makes the code more easily
  // readable. You need to write: let d = new DummyData({ version: 12 });
  // which is self-explainable unlike let d = new DummyData(12);
  constructor(version: Version)
  {
    if (!ASSERT(version.version >= 0, "Version can't be negative, sorry"))
    {
      this.version = 0;
    }
    else
    {
      this.version = version.version;
    }
  }

  protected checkVersion(jsonObject: Object)
  {
    ASSERT_FATAL('version' in jsonObject,
      "There is no 'version' property in JSON data");

    ASSERT_FATAL(jsonObject['version'] === this.version,
      "Version of JSON data ("
      + jsonObject['version'] +
      ") doesn't match required version ("
      + this.version + ")");
  }

  protected loadFromFile(filePath: string)
  {
    let jsonString;

    /// Prozatim to nactu synchronne.
    /// TODO: Asynchronni loading.

    try
    {
      jsonString = fs.readFileSync(filePath, 'utf8');
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

    /*
    /// this.loading = true;
    fs.readFile
    (
      filePath,
      'utf8',
      (error, data) =>
      {
        if (error)
          throw error;

        /// this.loading = false;
        this.loadFromJsonString(data);
      }
    );
    */
  }

  protected saveToFile(filePath: string)
  {
    let jsonString = this.saveToJsonString();

    /// Zatim to savnu synchronne.
    /// TODO: Casem prepsat na asynchronni read/write.

    try
    {
      fs.writeFileSync(filePath, jsonString, 'utf8');
    }
    catch (error)
    {
      Mudlog.log(
        "Error saving file '" + filePath + "': " + error.code,
        Mudlog.msgType.SYSTEM_ERROR,
        Mudlog.levels.IMMORTAL);

      // Throw the exception so the mud will get terminated with error
      // message.
      throw error;
    }

    /*
    fs.writeFile
    (
      jsonStream,
      filePath,
      'utf8',
      (error) =>
      {
        if(error)
          throw error;

         /// TODO:
        /// this.saving = false;
        /// console.log('It\'s saved!');
      }
    );

    /// this.saving = true;
    /// Tohle nebude stacit, save requesty budu asi muset bufferovat (do fromty)
    /// (protoze je spatne pustit nove savovani toho sameho filu driv, nez
    /// dobehne to stare)
    // Nebo mozna prece jen pouzit ten write stream?

    /*
    // 'utf-8' is default encoding, so there is no need to specify it.
    var wstream = fs.createWriteStream('myOutput.txt');
    // Node.js 0.10+ emits finish when complete
    wstream.on('finish', function()
    {
      console.log('file has been written');
    });
    wstream.write('Hello world!\n');
    wstream.write('Another line');
    wstream.end();
    */
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
      if (typeof this[property] !== 'function')
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
        + " load ourselves from but we don't have it Maybe you forgot to"
        + " change the version and convert JSON files to a new format?");
    }

    // Now copy the data.
    for (property in jsonObject)
    {
      if (typeof this[property] === 'object'
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