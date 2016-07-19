/*
  Part of BrutusNEXT

  Manages entity prototypes.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';
import {PrototypeData} from '../game/PrototypeData';

export class PrototypeDataManager extends SaveableObject
{
  // Hashmap of PrototypeData objects.
  public prototypeDataList = new Map();

  private static get SAVE_DIRECTORY()
  {
    return "./data/prototypes/";
  }

  private static get SAVE_FILE_NAME()
  {
    return "prototypeManager.json";
  }

  // ---------------- Public methods --------------------

  public getPrototypeData(name: string): PrototypeData
  {
    // Accessing prototypes is case-insensitive.
    let key = name.toLowerCase();

    let prototypeData = this.prototypeDataList.get(key);
    
    if (!ASSERT(prototypeData !== undefined,
      "Attempt to access FlagsData for class '" + name + "'"
      + "that doesn't have FlagsData in FlagsDataManager"))
      return null;

    return prototypeData;
  }

  // Returns true on success.
  public createPrototypeData(param: { name: string, ancestor: string })
  : boolean
  {
    if (!this.checkNewPrototypeDataParams(param.name, param.ancestor))
      return false;

    let newPrototypeData = new PrototypeData();

    newPrototypeData.typeName = param.name;
    newPrototypeData.ancestorName = param.ancestor;

    // Lowercase of prototype name is used as key in hashmap
    // because it allows case-insensitive searching.
    let key = name.toLowerCase();

    // Add newly created prototype to hashmap.
    this.prototypeDataList.set(key, newPrototypeData);

    return true;
  }

  public async save()
  {
    await this.saveToFile
    (
      PrototypeDataManager.SAVE_DIRECTORY,
      PrototypeDataManager.SAVE_FILE_NAME
    );
  }

  public async load()
  {
    let filePath = PrototypeDataManager.SAVE_DIRECTORY;
    let fileName = PrototypeDataManager.SAVE_FILE_NAME;
    let fullPath = filePath + fileName;

    ASSERT_FATAL(filePath.substr(filePath.length - 1) === '/',
      "filePath '" + filePath + "' doesn't end with '/'");

    await this.loadFromFile(fullPath);
  }

  // Creates javascript classes that will be used to instantiate game
  // objects and sets data members and methods to their prototypes (so
  // instantiated game objects automatically inherit from them).
  public createClasses()
  {
    // Iterate over all values in hashmap.
    for (let prototype of this.prototypeDataList.values())
    {
      prototype.createClass();
    }
  }

  // ---------------- Private methods -------------------

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

    if (!ASSERT(global[name] !== undefined,
        "Attempt to create new prototype '" + name + "' but class of that name"
        + " already exists. Prototype is not created"))
      return false;

    return true;
  }
}