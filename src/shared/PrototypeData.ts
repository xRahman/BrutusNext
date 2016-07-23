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
import {SaveableObject} from '../shared/SaveableObject';
import {ScriptData} from '../game/ScriptData';

// Built-in node.js modules.
const vm = require('vm');

export class PrototypeData extends SaveableObject
{
  // Name of the class that will represent this prototype.
  public prototypeName: string = "";

  // Name of the class we will be inherited from.
  public ancestorName: string = "";

  // Prototype data members and their values.
  public data: Array<{ property: string, value: any }> = [];

  // Scripts attached to the prototype.
  public scripts: Array<ScriptData>;

  // ---------------- Public methods --------------------

  public createClass()
  {
    if (!this.classCreationCheck())
      return;

    let script = this.createDeclarationScript();
    let AncestorClass = this.getAncestorClass();

    // Dynamicaly create a new class using a script.
    let NewClass = this.runDeclarationScript(script, AncestorClass);

    if (NewClass === undefined || NewClass === null)
      // Error is already reported by this.runDeclarationScript().
      return;

    /// TEST:
    this.data.push({ property: 'x', value: '27' });

    
    // Set data members to new class prototype.
    ///NewClass.setPrototypeData(this.data);
    this.setPrototypeData(NewClass);

    // Create functions from scripts and set them as metods
    // to new class prototype.
    ///NewClass.setMethods(this.scripts);
    this.setMethods(NewClass);
    

    NewClass.prototype['x'] = 31;

    /// TEST:
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];
    let instance = new dynamicClasses[this.prototypeName]();
//    instance.setPrototypeData(this.data);
    console.log("Value (prototype): " + instance.x);
    instance.x = 78
    console.log("Value (instance): " + instance.x);

    let instance2 = new dynamicClasses[this.prototypeName]();
    console.log("Value2 (prototype): " + instance2.x);
  }

  // ---------------- Private methods -------------------

  // Creates a piece of code, that, when run using 'vm' module of node.js,
  // declares a new type.
  private createDeclarationScript(): string
  {
    let script = "";
    let typeName = this.prototypeName;

    // Note:
    //   'this' inside the script is a sandbox object on which
    // the script will be run.

    /*
      Ono se to chová dost zvláštn? - jako by property sandbox objektu
      byly read-only. "let x = result;" projde (?tení z prom?nné
      sandbox.result), ale "result = 13;" neprojde (zápis do
      prom?nné sandbox.result - místo toho se musí napsat
      "this.result = 13;").
    */

    // 'use strict' is necessary in order to use ES6 class declaration.
    script += "'use strict'; "
    // this.Ancestor is a property of sandbox object.
    //script += "class " + typeName + " extends this.Ancestor ";
    script += "let " + this.ancestorName + " = this.Ancestor;"
    script += "class " + typeName + " extends " + this.ancestorName;
    script += "{";
    script += "}";
    // this.result is a property of sandbox object.
    script += "this.result = " + typeName + ";";

    return script;
  }

  private createVmScript(script: string)
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

  private processDeclarationScriptResult(result)
  {
    if (result === null)
    {
      ASSERT(false,
        "Failed to dynamically create class '" + this.prototypeName + "'");

      return;
    }

    // Dynamic classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];

    dynamicClasses[this.prototypeName] = result;
  }

  private classCreationCheck(): boolean
  {
    if (!ASSERT(this.prototypeName !== "",
        "Attempt to create class with empty type name."
        + " Class is not created"))
      return false;

    // Dynamic classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];

    // Type that we want to create must not yet exist.
    if (!ASSERT(dynamicClasses[this.prototypeName] === undefined,
        "Attempt to create class '" + this.prototypeName + "' inherited from"
        + " ancestor '" + this.ancestorName + "' that already exists."
        + "Class is not created"))
      return false;

    return true;
  }

  // Returns newly created class or null (in case of failure).
  // (generic type is only used to typecheck parameter, which is class)
  private runDeclarationScript<T>
  (
    script: string,
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    AncestorClass: { new (...args: any[]): T }
  )
  // Return value is also a constructor of a class.
  : { new (...args: any[]): T }
  //: SaveableObject // TODO: Zmenit na classu, kterou je treba vytvorit
  {
    // Object that will be used as sandbox to run script in.
    let sandbox = { console: console, result: null, Ancestor: AncestorClass };

    // 'Contextify' the sandbox.
    // (check node.js 'vm' module documentation)
    let contextifiedSandbox = vm.createContext(sandbox);

    // Compile the script.
    // (check node.js 'vm' module documentation)
    let vmScript = this.createVmScript(script);

    // Run the compiled code within our sandbox object.
    this.executeVmScript(vmScript, contextifiedSandbox);

    // Assigns newly created type to global.dynamicClasses.
    // Triggers assert if we failed to create it.
    this.processDeclarationScriptResult(contextifiedSandbox.result);

    // Null in case of failure.
    return contextifiedSandbox.result;
    //return <SaveableObject>contextifiedSandbox.result;
  }

  private getAncestorClass()
  {
    if (!ASSERT(this.ancestorName !== "",
        "Attempt to create class '" + this.prototypeName + "' with empty"
        + " ancestor name (that's not allowed, dynamic classes must be"
        + " inherided from something that's inherited from GameEntity)."
        + " Class is not created"))
      return null;

    // Dynamic classes are stored in global.dynamicClasses.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];
    let AncestorClass = dynamicClasses[this.ancestorName];

    // Ancestor type must exist.
    if (!ASSERT(AncestorClass !== undefined,
        "Attempt to create class '" + this.prototypeName + "' inherited from"
        + " nonexisting ancestor class '" + this.ancestorName + "'."
        + " Class is not created"))
      return null;

    return AncestorClass;
  }

  public setPrototypeData<T>
  (
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    prototypeClass: { new (...args: any[]): T }
  )
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
  
  public setMethods<T>
  (
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    prototypeClass: { new (...args: any[]): T }
  )
  {
    /// TODO:
  }
}