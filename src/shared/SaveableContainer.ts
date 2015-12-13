/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  specific data in JSON format.

  Unlike SaveableObject, which automatically saves/loads all of its data
  members, SaveableContainer only saves it's data members that are
  SaveableContainers or SaveableObjects (and version number).
*/

/*
  Usage:
  1) inherit your class from SaveableContainer.  
  2) To specify which data you want to be saved and loaded, create a data
    container inherited from SaveableObject. Everything you declare in it
    will automatically get saved or loaded.

    class MyClassData extends SaveableObject
    {
      // IPORTANT: Everything here needs to be inicialized or you will get
      // errors!

      // Make everything public. Only you will be able to access it anyways
      // because your MyClassData will be protected (see class MyClass).
      public somethingYouWantToSaveAndLoad = "";
    }

    class MyClass extends SaveableContainer
    {
      // Here you supply the version that will be saved and also checked
      // for upon loading from file.
      protected myData = new MyClassData({ version: 12 });
    }

   3) Call saveToFile(path) or loadFromFile(path) on your root object.
     let myClassInstance = new MyClass();
     myClassInstance.saveToFile('./data/myClassInstance0.json');
     myClassInstance.loadFromFile('./data/myClassInstance0.json');
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';

export class SaveableContainer extends SaveableObject
{
  protected loadFromJsonObject(jsonObject: Object)
  {
    this.checkVersion(jsonObject);

    for (let property in jsonObject)
    {
      // SaveableContainer only loads properties that are SaveableObjects
      // or SaveableContainers (unline SaveableObject, which loads all of it's
      // properties)
      if (typeof this[property] === 'object'
          && 'loadFromJsonObject' in this[property])
      {
        this[property].loadFromJsonObject(jsonObject[property]);
      }
    }
  }

  protected saveToJsonObject(): Object
  {
    let jsonObject = {};

    // We need to save version manually. This is an exception to
    // SaveableContainer only saving it's members that are SaveableContainers
    // or SaveableObjects. But we need to save version in order to be able to
    // check it, don't we?
    jsonObject['version'] = this.version;

    for (let property in this)
    {
      // SaveableContainer only saves properties that are SaveableObjects
      // or SaveableContainers (unline SaveableObject, which saves all of it's
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