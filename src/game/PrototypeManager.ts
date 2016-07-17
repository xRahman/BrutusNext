/*
  Part of BrutusNEXT

  Manages entity prototypes.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';
import {PrototypeData} from '../game/PrototypeData';

export class PrototypeManager extends SaveableObject
{
  public prototypes = new Map();  // Hashmap.

  private static get SAVE_DIRECTORY()
  {
    return "./data/prototypes/";
  }

  private static get SAVE_FILE_NAME()
  {
    return "prototypeManager.json";
  }

  // ---------------- Public methods --------------------

  public getPrototype(name: string): PrototypeData
  {
    // Accessing prototypes is case-insensitive.
    return this.prototypes.get(name.toLowerCase());
  }

  // Returns true on success.
  public createNewPrototype(param: { name: string, ancestor: string }): boolean
  {
    if (!this.checkNewPrototypeParams(param.name, param.ancestor))
      return false;

    let newPrototype = new PrototypeData();

    newPrototype.typeName = param.name;
    newPrototype.ancestorName = param.ancestor;

    // Lowercase of prototype name is used as key in hashmap
    // because it allows case-insensitive searching.
    let key = name.toLowerCase();

    // Add newly created prototype to hashmap.
    this.prototypes.set(key, newPrototype);

    return true;
  }

  public async save()
  {
    await this.saveToFile
    (
      PrototypeManager.SAVE_DIRECTORY,
      PrototypeManager.SAVE_FILE_NAME
    );
  }

  public async load()
  {
    let filePath = PrototypeManager.SAVE_DIRECTORY;
    let fileName = PrototypeManager.SAVE_FILE_NAME;
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
    for (let prototype of this.prototypes.values())
    {
      prototype.createClass();
    }
  }

  // ---------------- Private methods -------------------

  private checkNewPrototypeParams(name: string, ancestor: string): boolean
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