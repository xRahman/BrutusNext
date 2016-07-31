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

import {ASSERT} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';
import {SaveableObject} from '../shared/SaveableObject';
import {VirtualMachine} from '../shared/vm/VirtualMachine';
import {Script} from '../shared/Script';
import {GameEntity} from '../game/GameEntity';

export class Prototype extends SaveableObject
{
  // Name of the class that will represent this prototype.
  public name: string = "";

  // Name of the class we will be inherited from.
  public ancestor: string = "";

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

  // Creates a new script and adds it to this prototype.
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
    if (!this.classCreationCheck())
      return;

    // Dynamicaly create a new class using a script run on virtual machine.
    let NewClass = this.declareClass();

    if (NewClass === undefined || NewClass === null)
      // Error is already reported by this.performClassCreation().
      return;
    
    // Set data members to new class prototype.
    this.setPrototypeData(NewClass);

    // Create functions from scripts and set them as metods
    // to new class prototype.
    this.setMethods(NewClass);
  }

  // ---------------- Private methods -------------------

  /*
  // Creates a piece of code, that, when run using 'vm' module of node.js,
  // declares a new type.
  private createDeclarationScript(): string
  {
    let script = "";

    // Note:
    //   'this' inside the script is a sandbox object on which
    // the script will be run.

    
      //Ono se to chová dost zvláštně - jako by property sandbox objektu
      //byly read-only. "let x = result;" projde (čtení z proměnné
      //sandbox.result), ale "result = 13;" neprojde (zápis do
      //proměnné sandbox.result - místo toho se musí napsat
      //"this.result = 13;").
    

    // 'use strict' is necessary in order to use ES6 class declaration.
    script += "'use strict'; "
    // this.Ancestor is a property of sandbox object.
    script += "let " + this.ancestor + " = this.Ancestor;"
    script += "class " + this.name + " extends " + this.ancestor;
    script += "{";
    script += "}";
    // this.result is a property of sandbox object.
    script += "this.result = " + this.name + ";";

    return script;
  }
  */

  /*
  private compileScript(script: string)
  {
    let vmScript = null;

    try
    {
      // Compile the script using node.js.
      vmScript = new vm.Script(script, { displayErrors: true });
    }
    catch (e)
    {
      ASSERT(false, "Script compile error: " + e.message);

      return null;
    }

    return vmScript;
  }
  */

  /*
  // (The types should be vm.Script and vm.Context, but it doesn't work for
  //  some reason even though they are exported in /headers/node.d.ts)
  private executeVmScript(vmScript, vmContext)
  {
    try
    {
      // Execute the script using 'vm' module of node.js.
      vmScript.runInContext(vmContext);
    }
    catch (e)
    {
      ASSERT(false, "Script runtime error: " + e.message);
      return;
    }
  }
  */

  //+
  private declareClass()
  {
    let Ancestor = this.getAncestorClass();

    if (Ancestor === undefined || Ancestor === null)
      // Error is already reported by this.getAncestorClass().
      return null;

    /// DEBUG:
    console.log("Declaring class '" + this.name + "'");

    // Note that dynamically declared class can't have a name.
    // (That's why we are not using constructor.name but rather our own
    //  property 'className'. See NamedClass::className for details.)
    let NewClass = class extends Ancestor { };
    NewClass[NamedClass.CLASS_NAME_PROPERTY] = this.name;

    // Assigns newly created type to global.dynamicClasses.
    // Triggers assert if we failed to create it.
    this.registerDynamicClass(NewClass);

    return NewClass;
  }

  //+
  private registerDynamicClass(dynamicClass)
  {
    if (dynamicClass === null)
    {
      ASSERT(false,
        "Failed to dynamically create class '" + this.name + "'");

      return;
    }

    // Dynamic classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];

    dynamicClasses[this.name] = dynamicClass;
  }

  //+
  private classCreationCheck(): boolean
  {
    if (!ASSERT(this.name !== "",
        "Attempt to create class with empty type name."
        + " Class is not created"))
      return false;

    // Dynamic classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];

    // Type that we want to create must not yet exist.
    if (!ASSERT(dynamicClasses[this.name] === undefined,
        "Attempt to create class '" + this.name + "' (with ancestor"
        + " '" + this.ancestor + "') that already exists."
        + "Class is not created"))
      return false;

    return true;
  }

  /*
  //+
  // Dynamically creates a new class by running class declaration
  // code on node.js virtual machine.
  //   Returns newly created class or null.
  // (generic type is only used to typecheck parameter, which is class)
  private runClassDeclarationScript<T>
  (
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    Ancestor: { new (...args: any[]): T }
  )
  {
    // This is printed to error messages if an error occurs.
    let scriptName = 'Class declaration system script';

    let declarationScriptcode =
      VirtualMachine.createClassDeclarationScript(this.name, this.ancestor);

    // Compile the declaration script.
    let vmScript =
      VirtualMachine.compileVmScript(scriptName, declarationScriptcode);

    // Object that will be used as sandbox to run script in.
    // A static sandbox object is used, because contextifying an object
    // takes quite a long time.
    let contextifiedSandbox =
      VirtualMachine.contextifiedClassDeclarationSandbox;

    contextifiedSandbox.Ancestor = Ancestor;

    // Run the compiled code within our sandbox object.
    // this.executeVmScript(vmScript, contextifiedSandbox);
    VirtualMachine.executeVmScript(scriptName, vmScript, contextifiedSandbox);

    // Read the return value from 'result' variable on sandbox.
    // (Result is null in case of failure.)
    return contextifiedSandbox.result;
  }
  */

  //+
  private getAncestorClass(): { new (...args: any[]): GameEntity }
  {
    if (!ASSERT(this.ancestor !== "",
        "Attempt to create class '" + this.name + "' with empty"
        + " ancestor name (that's not allowed, dynamic classes must be"
        + " inherided from something that's inherited from GameEntity)."
        + " Class is not created"))
      return null;

    // Dynamic classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];
    let AncestorClass = dynamicClasses[this.ancestor];

    // Ancestor type must exist.
    if (!ASSERT(AncestorClass !== undefined,
        "Attempt to create class '" + this.name + "' inherited from"
        + " nonexisting ancestor class '" + this.ancestor + "'."
        + " Class is not created"))
      return null;

    return AncestorClass;
  }

  //+
  /*
  public setPrototypeData<T>
  (
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    prototypeClass: { new (...args: any[]): T }
  )
  */
  public setPrototypeData(prototypeClass)
  {
    for (let i = 0; i < this.data.length; i++)
    {
      let property = this.data[i].property;
      let value = this.data[i].value;

      // Dynamic access to class property - it will be created if it
      // doesn't exist.
      // (properties are assigned to class prototype so all game entities of
      //  this type will automatically inherit them)
      prototypeClass.prototype[property] = value;
    }
  }

  /*
  public setMethods<T>
  (
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    prototypeClass: { new (...args: any[]): T }
  )
  */
  public setMethods(prototypeClass)
  {
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
}