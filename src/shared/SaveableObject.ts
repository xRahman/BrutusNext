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
    /// TODO
  }

  public saveToFile(filePath: string)
  {
    /// TODO
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
    let stream = JSON.stringify(this.saveToJsonData(), null, 2);
    
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