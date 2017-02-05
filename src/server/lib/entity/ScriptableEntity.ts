/*
  Part of BrutusNEXT

  Allows classes to compile scripts and serve as prototypes.
*/

/*
  The difference between prototype entity and regular entity
  is, that ancestor of prototype entity (referenced by entity's
  ancestorId) has entity's id listed among it's descendants.
    This causes the entity to be loaded as prototype when the
  server starts (because all descendant entities are recursively
  loaded at that time begening from the root prototype entity).
*/

'use strict';

import {NamedEntity} from '../../../server/lib/entity/NamedEntity';

export class ScriptableEntity extends NamedEntity
{
  /*
  // Name of the class that will represent this prototype.
  public name: string = null;

  // Name of the class we will be inherited from.
  public ancestor: string = null;

  // Prototype data members and their values.
  public data = new Array<{ property: string, value: any }>();

  // Scripts attached to the prototype.
  // Hashmap<[ string, FlagNames ]>
  //   Key: script name (without prototype name)
  //   Value: Script object
  public scripts = new Map();

  // ---------------- Public methods --------------------

  // Creates a new ingame script and adds it to this prototype.
  public createScript(scriptName: string): Script
  {
    let script = new Script();
    script.name = scriptName;
    script.prototype = this.name;
    // Add new script to this.scripts hashmap under it's name.
    this.scripts.set(scriptName, script);
    
    return script;
  }

  // This should only run once in a boot - at the start of the game
  // when prototypeManager is loaded, or at the time of creation of new
  // prototype.
  public createClass()
  {
    let NewClass = Server.classFactory.createClass(this.name, this.ancestor);

    if (NewClass === null)
      // Error is already reported by createClass().
      return;
    
    // Set data members to new class prototype.
    this.setPrototypeData(NewClass);

    // Create functions from scripts and set them as metods
    // to new class prototype.
    this.setMethods(NewClass);
  }

  public setPrototypeData(prototypeClass: any)
  {
    if (this.data === null || this.data === undefined)
    {
      ERROR("Invalid this.data in prototype '" + this.name + "'");
      return;
    }

    for (let i = 0; i < this.data.length; i++)
    {
      let property = this.data[i].property;
      let value = this.data[i].value;

      // [] represends dynamic access to class property - property will be
      // created if it doesn't exist. Properties are assigned to class
      // prototype so all game entities of this type will automatically
      // inherit them.
      prototypeClass.prototype[property] = value;
    }
  }

  public setMethods(prototypeClass: any)
  {
    if (this.scripts === null)
    {
      ERROR("Invalid this.scripts in prorptype " + this.name + "."
        + " Script methods are not set to prototype class");
      return;
    }

    // Iterate over all values in this.scripts hashmap.
    for (let script of this.scripts.values())
    {
      script.compile();

      // Assign compiled scriptFunction to the prototype class.
      // (using [script.name] will create property named script.name on the
      //  prototype if it does't exist and assign a scriptFunction to it.)
      prototypeClass.prototype[script.name] = script.scriptFunction;
    }
  }

  // --------------- Protected methods ------------------

  protected getSaveFileName()
  {
    return this.name + ".json";
  }

  // -> Returns 'null' if directory cannot be composed.
  protected getSaveDirectory()
  {
    let PrototypeClass = Server.classFactory.getClass(this.name);

    if (PrototypeClass === undefined)
    {
      ERROR("Unable to compose prototype save path for"
        + " prototype '" + this.name + "' because dynamic"
        + " class '" + this.name + "' doesn't exist");
      return null;
    }

    if (PrototypeClass['getPrototypeSaveDirectory'] === undefined)
    {
      ERROR("Unable to compose prototype save path for"
        + " prototype '" + this.name + "' because dynamic"
        + " class '" + this.name + "' doesn't have static"
        + " method 'getPrototypeSaveDirectory()'");
      return null;
    }

    let subdirectory = PrototypeClass.getPrototypeSaveDirectory();

    return PrototypeManager.SAVE_DIRECTORY + subdirectory;
  }
  */
}