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

import {ASSERT} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';
import {ScriptData} from '../game/ScriptData';

// Built-in node.js modules.
const vm = require('vm');

export class PrototypeData extends SaveableObject
{
  // Name of class that will represent this prototype.
  public typeName: string = "";

  // Name of class we will be inherited from.
  public ancestorName: string = "";

  // Prototype data members and their values.
  public data: Array<any> = [];

  // Scripts attached to the prototype.
  public scripts: Array<ScriptData>;

  // ---------------- Public methods --------------------

  public createClass()
  {
    if (this.declarationValidityCheck() !== true)
      return;

    let script = this.createDeclarationScript();

    // Dynamicaly create a new class using a script.
    let NewClass = this.runDeclarationScript(script);

    if (!ASSERT(NewClass !== undefined,
        "Failed to create class '" + this.typeName + "'"))
      return;

    // Set data members to new class prototype.
    NewClass.setPrototypeData(this.data);

    // Create functions from scripts and set them as metods
    // to new class prototype.
    NewClass.setMethods(this.scripts);
  }

  // ---------------- Private methods -------------------

  // Creates a piece of code, that, when run using 'vm' module of node.js,
  // declares a new type.
  private createDeclarationScript(): string
  {
    let script = "";

    // 'use strict' is necessary in order to use ES6 class declaration.
    script += "'use strict'; "
    script += "let Ancestor = global['" + this.ancestorName + "']; ";
    script += "class " + this.typeName + " extends Ancestor ";
    script += "{";
    script += "}";
    // We will also assign newly created class to global object so we will
    // later be able to acces it's constructor to dynamically create it's
    // instances.
    script += "global['" + this.typeName + "'] = this.typeName";

    return script;
  }

  private declarationValidityCheck(): boolean
  {
    if (!ASSERT(this.typeName !== "",
        "Attempt to create class with empty type name."
        + " Class is not created"))
      return false;

    if (!ASSERT(this.ancestorName !== "",
        "Attempt to create class '" + this.typeName + "' with empty"
        + " ancestor name (that's not allowed, dynamic classes must be"
        + " inherided from something that's inherited from GameEntity)."
        + " Class is not created"))
      return false;

    // Ancestor type must exist.
    if (!ASSERT(global[this.ancestorName] !== undefined,
        "Attempt to create class '" + this.typeName + "' inherited from"
        + " nonexisting ancestor '" + this.ancestorName + "'."
        + "Class is not created"))
      return false;

    // Type that we want to create must not yet exist.
    if (!ASSERT(global[this.typeName] === undefined,
        "Attempt to create class '" + this.typeName + "' inherited from"
        + " ancestor '" + this.ancestorName + "' that already exists."
        + "Class is not created"))
      return false;

    return true;
  }

  private runDeclarationScript(script: string)
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
    }

    // Runs the compiled code within the context of the current global object.
    vmScript.runInThisContext();

    // Newly declared class has been set by declaration script
    // to the global object. Let's retrieve it.
    let NewClass = global[this.typeName];

    return NewClass;
  }
}