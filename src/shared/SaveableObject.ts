/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

/*
  Usage:
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
      // Here you supply the version string that will be saved and also checked
      // for upon loading from file.
      protected myData = new DummyData("12");
    }
*/

import {ASSERT_FATAL} from '../shared/ASSERT';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

let beautify = require('js-beautify').js_beautify;

export class SaveableObject
{
  // Version will be checked for. Default behaviour is to trigger
  // a FATAL_ASSERT when versions don't match. You can override it
  // by overriding a checkVersion() method;
  constructor(public version: string) { }

  public checkVersion(jsonData: Object)
  {
    /// TODO: Doplnit do chybovych hlasek, kde nastala chyba, tj ktereho
    /// souboru se to tyka (pokud to pujde zjistit)

    ASSERT_FATAL('version' in jsonData,
      "There is no 'version' property in JSON data");

    ASSERT_FATAL(jsonData['version'] === this.version,
      "Version of JSON data doesn't match required version");
  }

  public loadFromFile(filePath: string)
  {
    let jsonStream;
    try
    {
      jsonStream = fs.readFileSync(filePath, 'utf8');
    }
    catch (error)
    {
      /// TODO: Syslog message
      throw error;
    }

    this.loadFromJsonStream(jsonStream);

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
        this.loadFromJsonStream(data);
      }
    );
    */
  }

  public saveToFile(filePath: string)
  {
    /// TODO:
    /// this.saving = true;
    /// Tohle nebude stacit, save requesty budu asi muset bufferovat (do fromty)
    /// (protoze je spatne pustit nove savovani toho sameho filu driv, nez
    /// dobehne to stare)
    // Nebo mozna prece jen pouzit ten write stream?

    let jsonStream = this.saveToJsonStream();

    try
    {
      fs.writeFileSync(filePath, jsonStream, 'utf8');
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

  public loadFromJsonStream(stream: string)
  {
    let jsonData;

    try
    {
      jsonData = JSON.parse(stream);
    }
    catch (e)
    {
      ASSERT_FATAL(false, "Syntax error in JSON stream: " + e.message);
    }
  }

  public saveToJsonStream(): string
  {
    let regExp: RegExp;
    // Indent with 2 spaces.
    ///let stream = JSON.stringify(this.saveToJsonData(), null, 2);
    let stream = JSON.stringify(this.saveToJsonData());

    stream = beautify
    (
      stream,
      {
        "indent_size": 2,
        "indent_char": " ",
        "eol": "\n",
        "indent_level": 0,
        "indent_with_tabs": false,
        "preserve_newlines": true,
//        "max_preserve_newlines": 10,
        "jslint_happy": false,
///        "space_after_anon_function": false,
        "brace_style": "expand",
        "keep_array_indentation": true,
///        "keep_function_indentation": false,
///        "space_before_conditional": true,
///        "break_chained_methods": false,
///        "eval_code": false,
///        "unescape_strings": false,
        "wrap_line_length": 0,
        "wrap_attributes": "auto",
        "wrap_attributes_indent_size": 2,
        "end_with_newline": false
      }
    );
/*
    // Add newline before and after curly braces.
    regExp = /([\{\}])/g;
    stream = stream.replace(regExp, '\n$1\n');
 
    // Add newline before and after square brackets.
    regExp = /([\[\]])/g;
    stream = stream.replace(regExp, '\n$1\n');
 
    // Add newline after comma.
    regExp = /(\,)/g;
    stream = stream.replace(regExp, '$1\n');
 
    // Remove multiple newlines.
    regExp = /(\n\n)/g;
    stream = stream.replace(regExp, '\n');
 
    // Remove newlines before commas.
    regExp = /\n\,/g;
    stream = stream.replace(regExp, ',');
*/

    return stream;
  }

  public loadFromJsonData(jsonData: Object)
  {
    let property = "";

    // Check version.
    this.checkVersion(jsonData);

    // Check if we have the same set of properties as the JSON data we are
    // trying to load ourselves from.
    for (property in this)
    {
      ASSERT_FATAL(property in jsonData,
        "Property '" + property + "' exists in object but not in JSON data"
        + " we are trying to load ourselves from. Maybe someone forgot to"
        + " change the version and convert JSON files to a new format?");
    }

    // Also the other way around.
    for (property in jsonData)
    {
      ASSERT_FATAL(property in this,
        "Property '" + property + "' exists in JSON data we are trying to"
        + " load ourselves from but we don't have it Maybe someone forgot to"
        + " change the version and convert JSON files to a new format?");
    }

    // Now copy the data.
    for (property in jsonData)
    {
      this[property] = jsonData[property];
    }
  }

  public saveToJsonData(): Object
  {
    let jsonData: Object = {};

    for (let property in this)
    {
      jsonData[property] = this[property];
    }

    return jsonData;
  }
}