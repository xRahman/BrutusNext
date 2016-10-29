/*
  Part of BrutusNEXT

  Manages entity prototypes.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FileSystem} from '../../shared/fs/FileSystem';
import {SaveableObject} from '../../shared/fs/SaveableObject';
import {AutoSaveableObject} from '../../shared/fs/AutoSaveableObject';
import {Prototype} from '../../shared/prototype/Prototype';
import {Entity} from '../../shared/entity/Entity';
import {Server} from '../../server/Server';

export class PrototypeManager extends AutoSaveableObject
{
  // Hashmap<[ string, Prototype ]>
  //   Key: prototype name
  //   Value: prototype
  public prototypes = new Map();

  /// PrototypeManager itself is not saved anymore so this is not needed.
  /*
  // Do not save variable prototypes.
  // (individual prototypes are saved to separate files)
  public static prototypes = { isSaved: false };
  */

  /*
  // Hashmap<[string, { path, filename }]>
  //   Key: prototype name
  //   Value: object describing location of prototype save file.
  //   (path is relative to the location of prototypeDataManager.json).
  private directoryTree = new Map();
  */

  public static get SAVE_DIRECTORY()
  {
    return "./data/prototypes/";
  }

  /*
  private static get SAVE_FILE_NAME()
  {
    return "prototypeManager.json";
  }
  */

  // ---------------- Public methods --------------------

  ///*
  /// Zatim to zjevne neni k potreba, ale necham si to tu.
  public getPrototype(name: string): Prototype
  {
    // Accessing prototypes is case-insensitive.
    let key = name.toLowerCase();

    let prototype = this.prototypes.get(key);

    if (prototype === undefined)
    {
      ERROR("Attempt to access FlagsData for class '" + name + "'"
        + "that doesn't have FlagsData in FlagsDataManager");
      return null;
    }

    return prototype;
  }
  //*/

  // Returns true on success.
  public createPrototype(name: string, ancestor: string): boolean
  {
    if (!this.checkNewPrototypeParams(name, ancestor))
      return false;

    let prototype = new Prototype();

    prototype.name = name;
    prototype.ancestor = ancestor;

    // Creates a javascript class based on prototype data.
    prototype.createClass();

    this.insertToPrototypeList(prototype);

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
    /// There is no point in saving the manager itself anymore.
    /// ./data/prototypes directory is now traversed automatically
    /// and all .json files found there are loaded as prototypes.
    /*
    /// Tady by spravne melo byt super.save(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super uvnitr chainu asyc funkci.
    await this.saveToFile
    (
      this.getSaveDirectory(),
      this.getSaveFileName()
    );
    */

    await this.savePrototypes();
  }

  // Overrides AutoSaveableObject::save() to implement automatic loading
  // of prototypes from their own files.
  public async load()
  {
    /// There is no point in loading the manager itself anymore.
    /// ./data/prototypes directory is now traversed automatically
    /// and all .json files found there are loaded as prototypes.
    /*
    /// Tady by spravne melo byt super.load(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super uvnitr chainu asyc funkci.
    // This needs to be done before loading contained entities, because we
    // need to read their id's first.
    await this.loadFromFile(this.getFullSavePath());
    */

    await this.loadPrototypes(PrototypeManager.SAVE_DIRECTORY);
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

  /*
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
  */

  private checkNewPrototypeParams(name: string, ancestor: string): boolean
  {
    if (name === "" || name === null || name === undefined)
    {
      ERROR("Attempt to create new prototype with empty"
        + " or invalid name. Prototype is not created");
      return false;
    }

    if (ancestor === "" || ancestor === null || ancestor === undefined)
    {
      ERROR("Attempt to create new prototype '" + name + "'"
        + " with empty or invalid ancestor name. Prototype"
        + " is not created");
      return false;
    }

    if (Server.classFactory.classExists(name))
    {
      ERROR("Attempt to create new prototype '" + name + "'"
        + " but class of that name already exists. Prototype"
        + " is not created");
      return false;
    }

    return true;
  }

  private insertToPrototypeList(prototype: Prototype)
  {
    if (prototype === null || prototype === undefined)
    {
      ERROR("Invalid prototype. Not inserting it to prototype list");
      return;
    }

    if (prototype.name === null || prototype.name === undefined)
    {
      ERROR("Invalid prototype name. Prototype"
        + " is not inserted to the list");
      return;
    }

    // Lowercase of prototype name is used as key in hashmap
    // because it allows case-insensitive searching.
    let key = prototype.name.toLowerCase();

    this.prototypes.set(key, prototype);
  }

  private async savePrototypes()
  {
    for (let prototype of this.prototypes.values())
    {
      /*
      let directory = prototype.getSaveDirectory();

      // If directory path couldn't be constructed, we can't save this
      // prototype.
      if (directory === null)
        // Error is already reported by Entity.getPrototypeSaveDirectory.
        continue;

      let fileName = prototype.getSaveFileName();
      */

      await prototype.save();

      /*
      // Scripts are saved to separate files.
      await prototype.saveScripts(fullDirectory);
      */
    }
  }

  private async loadPrototype(path: string)
  {
    let prototype = new Prototype();

    if (await prototype.loadFromFile(path) === false)
    {
      ERROR("Failed to load prototype " + path);
      return;
    }

    // Creates a javascript class based on prototype data.
    prototype.createClass();

    this.insertToPrototypeList(prototype);
  }

  private async loadPrototypeFiles(directory: string, fileNames: Array<string>)
  {
    let extensionLength = FileSystem.JSON_EXTENSION.length;

    for (let fileName of fileNames)
    {
      // Check if 'fileName' ends with '.json'.
      // (it doesn't guarantee that fileName is a file, but we get an error
      //  later if it's not true anyways so there is no need to access disk
      //  here to explicitely check it)
      // (slice(-N) extracts 'N' characters from the end of the string) 
      if (fileName.slice(-extensionLength) === FileSystem.JSON_EXTENSION)
      {
        let path = directory + fileName;

        await this.loadPrototype(path);
      }
    }
  }

  private async processSubdirectories
  (
    directory: string,
    fileNames: Array<string>
  )
  {
    for (let fileName of fileNames)
    {
      let extensionLength = FileSystem.JSON_EXTENSION.length;

      // First we check that 'fileName' doesn't end with '.json'. This way
      // we save ourselves reading file stats from disk for json files, which
      // are definitely not subdirectories we are interested in right now.
      // (slice(-N) extracts 'N' characters from the end of the string) 
      if (fileName.slice(-extensionLength) !== FileSystem.JSON_EXTENSION)
      {
        let path = directory + fileName + '/';

        if (FileSystem.isDirectory(path))
        {
          // Recursively call loadPrototypes() on subdirectory.
          await this.loadPrototypes(path);
        }
      }
    }
  }

  private async loadPrototypes(directory: string)
  {
    // Returns an array of filenames excluding '.' and '..'.
    let fileNames = await FileSystem.readDirectoryContents(directory);

    // First we need to process json files, because ancestor
    // prototypes need to be loaded before their descendants.
    await this.loadPrototypeFiles(directory, fileNames);

    // Now recursively call ourselves on subdirectories.
    // (they contain prototypes descended from the ones
    //  in parent directory)
    await this.processSubdirectories(directory, fileNames);
  }


  /*
  private getPrototypeSavePath(prototypeName: string)
  {
    //return Entity.getSaveDirectory(prototypeName, this.getSaveDirectory());
    return Entity.getPrototypeSaveDirectory
    (
      prototypeName,
      PrototypeManager.SAVE_DIRECTORY
    );

    /// // Prototype classes are stored in global.dynamicClasses.
    /// let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];
    /// let PrototypeClass = dynamicClasses[prototypeName];
    /// // Save directory of PrototypeManager, which is './data/prototypes/'
    /// let rootDir = this.getSaveDirectory();
    /// let errorPath =
    ///   rootDir + "_SAVE_PATH_CREATION_ERROR/" + prototypeName + "/";
    /// 
    /// if (!ASSERT(PrototypeClass !== undefined,
    ///     "Unable to compose prototype save path for prototype"
    ///     + " '" + prototypeName + "' because dynamic class"
    ///     + " '" + prototypeName + "' doesn't exist."
    ///     + " Prototype will be saved to " + errorPath + " instead"))
    ///   return errorPath;
    /// 
    /// if (!ASSERT(PrototypeClass['getSaveSubDirectory'] !== undefined,
    ///     "Unable to compose prototype save path for prototype"
    ///     + " '" + prototypeName + "' because dynamic class"
    ///     + " '" + prototypeName + "' doesn't have static method"
    ///     + " 'getSaveSubDirectory'. Prototype will be saved"
    ///     + " to " + errorPath + " instead"))
    ///   return errorPath;
    /// 
    /// return rootDir + PrototypeClass.getSaveSubDirectory();
  }
  */

  /*
  private getPrototypeSaveFileName(prototypeName: string)
  {
    return prototypeName + ".json";
  }
  */
}