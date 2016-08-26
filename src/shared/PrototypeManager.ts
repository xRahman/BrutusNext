/*
  Part of BrutusNEXT

  Manages entity prototypes.
*/

'use strict';

import {dynamicCast} from '../shared/UTILS';
import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {SaveableObject} from '../shared/SaveableObject';
import {AutoSaveableObject} from '../shared/AutoSaveableObject';
import {Prototype} from '../shared/Prototype';
import {Entity} from '../shared/Entity';

export class PrototypeManager extends AutoSaveableObject
{
  // Hashmap<[ string, Prototype ]>
  //   Key: prototype name
  //   Value: prototype
  public prototypes = new Map();
  // Do not save variable prototypes
  // (individual prototypes are saved to separate files).
  public static prototypes = { isSaved: false };

  /*
  // Hashmap<[string, { path, filename }]>
  //   Key: prototype name
  //   Value: object describing location of prototype save file.
  //   (path is relative to the location of prototypeDataManager.json).
  private directoryTree = new Map();
  */

  private static get SAVE_DIRECTORY()
  {
    return "./data/prototypes/";
  }

  private static get SAVE_FILE_NAME()
  {
    return "prototypeManager.json";
  }

  // ---------------- Public methods --------------------

  ///*
  /// Zatim to zjevne neni k potreba, ale necham si to tu.
  public getPrototype(name: string): Prototype
  {
    // Accessing prototypes is case-insensitive.
    let key = name.toLowerCase();

    let prototype = this.prototypes.get(key);
    
    if (!ASSERT(prototype !== undefined,
      "Attempt to access FlagsData for class '" + name + "'"
      + "that doesn't have FlagsData in FlagsDataManager"))
      return null;

    return prototype;
  }
  //*/

  // Returns true on success.
  public createPrototype(name: string, ancestor: string): boolean
  {
    let prototypeData = this.createPrototypeData(name, ancestor);

    if (prototypeData === null)
      return false;

    // Creates a javascript class based on prototype data.
    prototypeData.createClass();

    ///this.addToDirectoryTree(param.name, param.ancestor);

    return true;
  }

  // Creates javascript classes that will be used to instantiate game
  // objects and sets data members and methods to their prototypes (so
  // instantiated game objects automatically inherit from them).
  public createClasses()
  {
    // Iterate over all values in hashmap.
    for (let prototype of this.prototypes.values())
    {
      prototype.createClass();
    }
  }

  // Overrides AutoSaveableObject::save() to implement automatic saving
  // of prototypes to their own files.
  public async save()
  {
    /// Tady by spravne melo byt super.save(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super uvnitr chainu asyc funkci.
    await this.saveToFile(this.getSaveDirectory(), this.getSaveFileName());

    await this.savePrototypes();
  }

  // Overrides AutoSaveableObject::save() to implement automatic loading
  // of prototypes from their own files.
  public async load()
  {
    /// Tady by spravne melo byt super.load(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super uvnitr chainu asyc funkci.
    // This needs to be done before loading contained entities, because we
    // need to read their id's first.
    await this.loadFromFile(this.getFullSavePath());

    await this.loadPrototypes();
  }

  // ---------------- Private methods -------------------

  /*
  private addToDirectoryTree(prototypeName: string, ancestorName: string)
  {
    // Ancestor must already be in directory structure (because we are
    // inheriting from it so it must already exist).
    let ancestorDirectory = this.directoryTree.get(ancestorName);

    if (ancestorDirectory === undefined)
    {
      // If ancestor isn't in the list, it means that it is a non-dynamic
      // type (like World or Room). In that case ancestor name itself is
      // the name of ancestor directory.
      ancestorDirectory = ancestorName;
    }

    let prototypeDirectory = ancestorDirectory + "/" + prototypeName + "/";
    let fileName = prototypeName + ".json";

    // Keys in directoryTree hashmap also need to be lowercase, because
    // we will be crossreferencing directoryTree and prototypes.
    let key = prototypeName.toLowerCase();
    let value = { path: prototypeDirectory, fileName: fileName };

    // Insert entry to hashmap.
    this.directoryTree.set(key, value);
  }
  */

  private createPrototypeData(name: string, ancestor: string): Prototype
  {
    if (!this.checkNewPrototypeDataParams(name, ancestor))
      return null;

    let prototypeData = new Prototype();

    prototypeData.name = name;
    prototypeData.ancestor = ancestor;

    this.insertToPrototypeList(prototypeData.name, prototypeData);

    return prototypeData;
  }

  private checkNewPrototypeDataParams(name: string, ancestor: string): boolean
  {
    if (!ASSERT(name !== ""
             && name !== null
             && name !== undefined,
        "Attempt to create new prototype with empty or invalid name."
        + " Prototype is not created"))
      return false;

    if (!ASSERT(ancestor !== ""
             && ancestor !== null
             && ancestor !== undefined,
        "Attempt to create new prototype '" + name + "' with empty or invalid"
        + " ancestor name. Prototype is not created"))
      return false;

    // Prototype classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];

    if (!ASSERT(dynamicClasses[name] === undefined,
        "Attempt to create new prototype '" + name + "' but class of that name"
        + " already exists. Prototype is not created"))
      return false;

    return true;
  }

  private insertToPrototypeList
  (
    prototypeName: string,
    prototype: Prototype
  )
  {
    // Lowercase of prototype name is used as key in hashmap
    // because it allows case-insensitive searching.
    let key = prototypeName.toLowerCase();

    this.prototypes.set(key, prototype);
  }

  private async savePrototypes()
  {
    for (let entry of this.prototypes.entries())
    {
      // An entry of hashmap is a [key, value] array.
      /// Tohle asi nebudu vubec potrebovat.
      /// TODO: V tom pripade by stacilo cyklovat pres values misto pres
      ///   entries.
      //let lowercasePrototypeName = entry[0];
      let prototype = dynamicCast(entry[1], Prototype);
      let prototypeName = prototype.name;

      /*
      // { path, filename } record specifying location of saved file.
      let prototypeLocation = this.directoryTree.get(prototypeName);

      if (!ASSERT(prototypeLocation !== undefined,
          "Missing record in prototype directory tree for prototype "
          + prototypeName + ". Prototype is not saved"))
        break;

      // Directory is relative to the save location of prototypeDataManger,
      // so we need to put it together.

      let fullDirectory = this.getSaveDirectory() + prototypeLocation.path;
      let fileName = prototypeLocation.fileName;

      await prototype.saveToFile(fullDirectory, fileName);
      */

      let path = this.getPrototypeSavePath(prototypeName);
      let fileName = this.getPrototypeSaveFileName(prototypeName);

      await prototype.saveToFile(path, fileName);

      /*
      // Scripts are saved to separate files.
      await prototype.saveScripts(fullDirectory);
      */
    }
  }

  private async loadPrototypes()
  {
    /// Ok, loadnout to sice asi neumim, ale to ted nebudu resit.
    /// Nejdriv save.
    /*
    for (let entry of this.directoryTree.entries())
    {
      // An entry of hashmap is a [key, value] array.
      let prototypeName = entry[0];
      // { path, filename } record specifying location of saved file.
      let prototypeLocation = entry[1];

      let prototype = new Prototype();
      let fileName = prototypeName + ".json";
       // Directory is relative to the save location of prototypeDataManger,
      // so we need to put it together.
      let filePath =
        this.getSaveDirectory()
        + prototypeLocation.path
        + prototypeLocation.fileName;

      await prototype.loadFromFile(filePath);

      //// Scripts are saved to separate files.
      //await prototype.loadScripts(filePath);


      this.insertToPrototypeList(prototypeName, prototype);
    }
    */
  }

  private getPrototypeSavePath(prototypeName: string)
  {
    return Entity.getSaveDirectory(prototypeName, this.getSaveDirectory());

    /*
    // Prototype classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];
    let PrototypeClass = dynamicClasses[prototypeName];
    // Save directory of PrototypeManager, which is './data/prototypes/'
    let rootDir = this.getSaveDirectory();
    let errorPath =
      rootDir + "_SAVE_PATH_CREATION_ERROR/" + prototypeName + "/";

    if (!ASSERT(PrototypeClass !== undefined,
        "Unable to compose prototype save path for prototype"
        + " '" + prototypeName + "' because dynamic class"
        + " '" + prototypeName + "' doesn't exist."
        + " Prototype will be saved to " + errorPath + " instead"))
      return errorPath;

    if (!ASSERT(PrototypeClass['getSaveSubDirectory'] !== undefined,
        "Unable to compose prototype save path for prototype"
        + " '" + prototypeName + "' because dynamic class"
        + " '" + prototypeName + "' doesn't have static method"
        + " 'getSaveSubDirectory'. Prototype will be saved"
        + " to " + errorPath + " instead"))
      return errorPath;

    return rootDir + PrototypeClass.getSaveSubDirectory();
    */
  }

  private getPrototypeSaveFileName(prototypeName: string)
  {
    return prototypeName + ".json";
  }
}