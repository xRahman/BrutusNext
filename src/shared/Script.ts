/*
  Part of BrutusNEXT

  Data from which script functions are created.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT'
import {SaveableObject} from '../shared/SaveableObject';
import {Prototype} from '../shared/Prototype';
import {VirtualMachine} from '../shared/vm/VirtualMachine';

// 3rd party modules.
import * as ts from "typescript";

export class Script extends SaveableObject
{
  // Name of function that will be created on prototype.
  // (This needs to be the same as the name of the function inside the script.)
  public name: string = "";

  // Code that will be be compiled into a function and assigned to a prototype.
  public code: string = "";

  // Function made from compiled script code.
  // If you want to assign this script to an entity, assign this variable
  // as it's method.
  // (for example zlyMob['onLoad'] = script.scriptFunction;)
  public scriptFunction = null;
  // Do not save variable scriptFunction.
  private static scriptFunction = { isSaved: false };

  // When the scrit is compiled, this is the function that represents
  // the script.
  private internalFunction = null;
  // Do not save variable internalFunction.
  private static internalFunction = { isSaved: false };
  
  // What prototype does this script belong to.
  // (this can't be named 'prototype', because it would conflict with
  // javascript .prototype property of classes)
  public prototypeName: string = null;

/// Tohle možná nakonec potřebovat nebudu...
  // Here we keep track of running instances of this script so they
  // can all be stopped at the same time.
  // (This is used when the script code is changed - all running
  //  instances are stopped and the new function is created.)
//  private runningInstances = new Array<ScriptInstance>();
  // Do not save variable runningInstances.
//  private static runningInstances = { isSaved: false };

  constructor()
  {
    super();

    /*
      The following code uses quite a bit of dark magic so let me explain what
      it does.

      General idea is to allow instances of game entities (like 'evilMob')
      to be assigned a function, which is created by compiling the script.
      Easiest way to do it is this: evilMob['functionName'] = scriptFunction;
      This solution, however, wouldn't allow for the scriptFunction body to be
      changed in runtime (for example when builder changes and recompiles the
      script), because evilMob.functionName() would still be the old, unchanged
      function.

      In order to allow changing scriptFunction in body runtime, we need to
      set 'evilMob' a function, that calls our scriptFunction (let's call our
      function 'internalFunction'), so when we change internalFunction,
      evilMob.scriptFunction will call our new internalFunction.

      Implementation:
        First we need an instance of Script class, let's call it 'script'.
      when we do evilmob['scriptFunction'] = script.scriptFunction;, calling
      evilMob.scriptFunction will set 'this' for scriptFunction to evilMob
      (even though scriptFunction is a method of Script class) - and that is
      what we want, because we want to be able to access evilMob's properties
      from the script.
        That, however, means that this.internalFunction() call inside
      Script::scriptFunction() won't work, because this is an evilMob, not
      script. So we need to rememeber 'script' somewhere and that somewhere
      is a closure of constructor of Script class (yes, that's where we are
      right now). Whe a new Script() is called, constructor of Script launches
      and this points to 'script' at that time (because we are inside of
      constructor of Script). So here we remember 'script' - that's
      what following line does:
    */

    let script = this;

    /*
      Now we declare Script::scriptFunction. We do it inside constructor
      in order for it to see the 'script' within closure of the constructor.
      But we assign it to this.scriptFunction (remember this means 'script'
      here) so it will be accessible from the outside even thought it's inside
      the closure.
    */

    this.scriptFunction = function(...args: any[])
    {
      /*
        Now we just call our insideFunction() on remembered 'script'.
        It's not that easy, however, because we need script to have
        'evilMob' as this (because we need to be able to access evilMob's
        properties from the script).

        To to it, we use apply() method of function() object, which allows
        us to call a function with specified 'this' (which is 'this' of
        scriptFunction(), which is 'evilMob').
      */

      if (!ASSERT(script.internalFunction !== null,
          "Internal script function of script " + script.name
          + " doesn't exist yet. Script must be compiled before"
          + " it can be used"))
        return;

      script.internalFunction.apply(this, args);
    }
  }

  // ---------------- Public methods --------------------

  // Returns 'prototypeName.scriptName'
  // (for example SystemRoom.onLoad).
  public getFullName(): string
  {
    return this.prototypeName + "." + this.name;
  }

  // Creates this.scriptFunction from this.code.
  public compile()
  {
    // Check if code contains function with the same name as script.
    if (!this.checkCode())
      return;

    // Declare local variable to store 'this.scriptname' in a closure.
    let scriptName = this.getFullName();
    
    // Declare local variable to store 'this' in a closure.
    // (so we can call this.scriptChanged() from funcion delay())
    let script = this;
    
    // Declare local variable to store 'compiledFunction' in a closure.
    // (compiedFunction will be assigned only after the script is compiled,
    //  because it will be created by the compilation of the script. But
    //  it's ok, because delay() from withing the script will definitely
    //  be run even later - definitely not before the script get's compiled.)
    let compiledFunction = null;
    
    // Declare delay() function in a closure (loally) so it can
    // access local variable scriptName.
    let delay = async function(miliseconds: number)
    {
      // Variable script is from the closure (it's a local variable
      // of Script.compile).
      await script.internalDelay(miliseconds, compiledFunction);
    }
    
    // Sandbox is stored in a static variable - it's reused for
    // compiling all mud scripts (because contextifying a sandbox
    // takes quite a long time).
    let sandbox = VirtualMachine.contextifiedScriptCompilationSandbox;

    // Assign localy declared delay() function to the sandbox, so
    // the script will be able to call it.
    sandbox.delay = delay;

    /*
    // Object that will be used as sandbox to run script in.
    //let sandbox = { console: console, result: null, delay: delay };
    let sandbox = { console: console, result: null, delay: wrappedDelay };

    // 'Contextify' the sandbox.
    // (check node.js 'vm' module documentation)
    //let contextifiedSandbox = vm.createContext(sandbox);
    let contextifiedSandbox = VirtualMachine.contextifySandbox(sandbox);
    */

    // Transpile from typescript to javascript
    let transpiledCode =
      ts.transpile(this.code, { module: ts.ModuleKind.CommonJS });

    let vmScript =
      VirtualMachine.compileVmScript(scriptName, transpiledCode);

    // Run the compiled code within our sandbox object.
    VirtualMachine.executeVmScript(scriptName, vmScript, sandbox);

    // Assign compiled function to a class variable.
    this.internalFunction = sandbox.result;
    
    // And also store it in a local variable so it's awailable from
    // within a closure function delay().
    compiledFunction = this.internalFunction;
  }

  // Checks if internal function changed against the one
  // passed as parameter.
  public codeChanged(originalFunction: Function): boolean
  {
    if (this.internalFunction === originalFunction)
      return false;
    
    return true;
  }

  private checkCode(): boolean
  {
    // Script code must contain function with the same name as the script.
    // TODO
    return true;
  }

  private resumeScript(resolve, reject, compiledFunction)
  {
    // If the script core was been recompiled while this script
    // was waiting for delay() to expire, this instance of script
    // needs to be stopped.
    if (this.codeChanged(compiledFunction))
    {
      let error = new Error();
      error.name = "Script cancelled";
      error.message = "Running script " + this.name + " has been cancelled";

      // Reject the Promise, so the script will stop.
      // (an exception will be thrown, which will be handled by
      // 'unhandledRejection' handler in BrutusNext.ts)
      reject(error);
    }
    else
    {
      // Resolve the Promise, so the script will continue.
      resolve();
    }
  }

  private async internalDelay(miliseconds: number, compiledFunction: Function)
  {
    return new Promise
    (
      (resolve, reject) =>
        setTimeout
        (
          this.resumeScript(resolve, reject, compiledFunction),
          miliseconds
        )
    );
  }
}