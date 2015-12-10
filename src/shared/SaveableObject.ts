/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

/*
  Usage: See usage of DataContainer.


    To specify which data you want to be saved and loaded, create a data
    container inherited from SaveableObject. Everything you declare in it
    will automatically get saved or loaded when you call it's saveToJSON()
    or loadFromJSON() methods.

    class DummyData extends SaveableObject
    {
       // Make everything public. Only you will be able to access it anyways
       // because your DummyData will be protected (see class Dummy).
       public somethingYouWantToSaveAndLoad = "";
    }

    class Dummy
    {
      // Here you supply the version that will be saved and also checked
      // for upon loading from file.
      protected myData = new DummyData({ version: 12 });
    }
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

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
    /// TODO: Doplnit do chybovych hlasek, kde nastala chyba, tj ktereho
    /// souboru se to tyka (pokud to pujde zjistit)

    ASSERT_FATAL('version' in jsonObject,
      "There is no 'version' property in JSON data");

    ASSERT_FATAL(jsonObject['version'] === this.version,
      "Version of JSON data doesn't match required version");
  }

  protected loadFromFile(filePath: string)
  {
    let jsonString;
    try
    {
      jsonString = fs.readFileSync(filePath, 'utf8');
    }
    catch (error)
    {
      /// TODO: Syslog message
      throw error;
    }

    this.loadFromJsonString(jsonString);

    /*
    // prozatim to nactu synchronne
    /// this.loading = true;
    fs.readFile
    (
      filePath,
      'utf8',
      (error, data) =>
      {
        if (error)
          throw error;
        /// TODO:
        /// this.loading = false;
        this.loadFromJsonString(data);
      }
    );
    */
  }

  protected saveToFile(filePath: string)
  {
    /// TODO:
    /// this.saving = true;
    /// Tohle nebude stacit, save requesty budu asi muset bufferovat (do fromty)
    /// (protoze je spatne pustit nove savovani toho sameho filu driv, nez
    /// dobehne to stare)
    // Nebo mozna prece jen pouzit ten write stream?

    let jsonString = this.saveToJsonString();

    try
    {
      fs.writeFileSync(filePath, jsonString, 'utf8');
    }
    catch (error)
    {
      /// TODO: Syslog message
      throw error;
    }

    /*
    /// Zatim to savnu synchronne.
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

    /// Asi se na write a read streamy vykaslu...
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
    // Indent with 2 spaces.
    ///let stream = JSON.stringify(this.saveToJsonData(), null, 2);
    let jsonString = JSON.stringify(this.saveToJsonObject());

    jsonString = beautify
    (
      jsonString,
      {
        "indent_size": 2,
        "indent_char": " ",
        "eol": "\n",
///        "indent_level": 0,
///        "indent_with_tabs": false,
///        "preserve_newlines": true,
///        "max_preserve_newlines": 10,
///        "jslint_happy": false,
///        "space_after_anon_function": false,
        "brace_style": "expand",
        "keep_array_indentation": true,
///        "keep_function_indentation": false,
///        "space_before_conditional": true,
///        "break_chained_methods": false,
///        "eval_code": false,
///        "unescape_strings": false,
///        "wrap_line_length": 0,
///        "wrap_attributes": "auto",
///        "wrap_attributes_indent_size": 2,
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