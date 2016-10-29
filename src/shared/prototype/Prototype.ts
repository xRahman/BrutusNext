/*
  Part of BrutusNEXT

  Creates classes that are used as entity prototypes.

    If you have for example mob 'red dragon', it is instantiated from
  prototype such as 'MRedDragon1', which is a class that will be created in
  runtime from respective PrototypeData.
    Data members from PrototypeData will be set to MRedDragon1.prototype
  directly, scripts from PrototypeData will be converted to methods of
  MRedDragon1.prototype, that will run script contens in sandbox using
  'vm' module of node.js.
*/

/*
  Note:
    Ancestors should always be before descenants in this.prototypes
  hashmap in order to load to succeed (you can't load a descendant class
  before ancestor class is loaded). This, however, should always be true,
  because you can't create a descendant prototype without having created
  ancestor first, so ancestor prototype must have had already been in
  this.prototypes (or be a nondynamic class) - so the order should always
  be naturaly correct.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {NamedClass} from '../../shared/NamedClass';
import {AutoSaveableObject} from '../../shared/fs/AutoSaveableObject';
import {VirtualMachine} from '../../shared/vm/VirtualMachine';
import {Script} from '../../shared/prototype/Script';
import {PrototypeManager} from '../../shared/prototype/PrototypeManager';
import {Server} from '../../server/Server';
import {GameEntity} from '../../game/GameEntity';

export class Prototype extends AutoSaveableObject
{
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

  /*
  /// TEST:
  private contextifiedSandbox = null;
  private static contextifiedSandbox = { isSaved: false };
  constructor()
  {
    super();

    // Object that will be used as sandbox to run script in.
    //let sandbox = { console: console, result: null, delay: delay };
    let sandbox = { console: console, result: null, delay: null };

    // 'Contextify' the sandbox.
    // (check node.js 'vm' module documentation)
    this.contextifiedSandbox = vm.createContext(sandbox);
  }
  */

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
    /*
    if (!this.classCreationCheck())
      return;

    // Dynamicaly create a new class using a script run on virtual machine.
    let NewClass = this.declareClass();

    if (NewClass === undefined || NewClass === null)
      // Error is already reported by this.performClassCreation().
      return;
    */

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
}