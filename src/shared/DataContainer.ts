/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  specific data in JSON format.
*/

/*
  Usage:
  1) inherit your class from DataContainer.  
  2) To specify which data you want to be saved and loaded, create a data
    container inherited from SaveableObject. Everything you declare in it
    will automatically get saved or loaded.

    class DummyData extends SaveableObject
    {
      // IPORTANT: Everything here needs to be inicialized or you will get
      // errors!

      // Make everything public. Only you will be able to access it anyways
      // because your DummyData will be protected (see class Dummy).
      public somethingYouWantToSaveAndLoad = "";
    }

    class Dummy extends DataContainer
    {
      // Here you supply the version that will be saved and also checked
      // for upon loading from file.
      protected myData = new DummyData({ version: 12 });
    }

   3) Call saveToFile(path) or loadFromFile(path)
     let dummy = new Dummy();
     dummy.saveToFile('./data/dummy.json');
     dummy.loadFromFile('./data/dummy.json');

  Note:
    Every member of DataContainer that is inherited from SaveableObject
    will automatically be added to save/load process.
*/

import {ASSERT} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';

export class DataContainer extends SaveableObject
{
  public loadFromJsonObject(jsonObject: Object)
  {
    this.checkVersion(jsonObject);

    for (let property in jsonObject)
    {
      // DataContainer only loads properties that are SaveableObjects
      // or DataContainers (unline SaveableObject, which loads all of it's
      // properties)
      if (typeof this[property] === 'object'
          && 'loadFromJsonObject' in this[property])
      {
        this[property].loadFromJsonObject(jsonObject[property]);
      }
    }
  }

  public saveToJsonObject(): Object
  {
    let jsonObject = {};

    // We need to save version manually.
    jsonObject['version'] = this.version;

    for (let property in this)
    {
      // DataContainer only saves properties that are SaveableObjects
      // or DataContainers (unline SaveableObject, which saves all of it's
      // properties)
      if (typeof this[property] === 'object'
          && 'saveToJsonObject' in this[property])
      {
        jsonObject[property] = this[property].saveToJsonObject();
      }
    }

    return jsonObject;
  }
}