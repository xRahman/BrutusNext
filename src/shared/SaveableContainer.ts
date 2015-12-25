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

import {ASSERT_FATAL} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';

export class SaveableContainer extends SaveableObject
{
  protected loadFromJsonObject(jsonObject: Object)
  {
    this.checkVersion(jsonObject);

    // Using 'in' operator on object with null value would crash the game.
    ASSERT_FATAL(jsonObject !== null, "Invalid json object");

    // When loading we will restore all properties present in the save file,
    // but they must exist on this class.
    for (let property in jsonObject)
    {
      ASSERT_FATAL(property in this,
        "There is a property in json object"
        + " we are loading ourselves from that we don't have. Perhaps we"
        + " are loading ourselves from the wrong file or from wile with"
        + " outdated format?");

      ASSERT_FATAL(this[property] !== null,
        "There is a property (" + property + ") in this object with null"
        + " value, which is to be loaded from json. That's not possible,"
        + " because loading method can't be called on null object. Make"
        + " sure that all properties on this class are inicialized to"
        + " something else than null");

      // Properties that are not SaveableObjects (= don't have
      // 'loadFromJsonObject' method) are not loaded, you need to load them
      // manually if you want to have some (see IdableSaveableContainer).
      if (
        this[property] !== null
        && typeof this[property] === 'object'
        && 'loadFromJsonObject' in this[property]
        && this[property].isSaved === true)
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
    //   The same is true for class name.
    jsonObject['className'] = this.className;
    jsonObject['version'] = this.version;

    for (let property in this)
    {
      if (this.isToBeSaved(property))
      {
        jsonObject[property] = this[property].saveToJsonObject();
      }
    }

    return jsonObject;
  }

  private isToBeSaved(property): boolean
  {
    // SaveableContainer only loads/saves properties that are SaveableObjects
    // or SaveableContainers (unlike SaveableObject, which loads all of it's
    // properties)
    //   Note: Objects with null value have no properties so using 'in'
    // operator on 'null' would lead to crash. But if some property is null,
    // it means that we definitely don't need to save it, so it's ok to skip
    // it.
    if
    (
      this[property] !== null
      &&  typeof this[property] === 'object'
      && 'loadFromJsonObject' in this[property]
      && this[property].isSaved === true
    )
    {
      return true;
    }

    return false;
  }
}