/*
  Part of BrutusNEXT

  Wraps node.js 'vm' module operations.
*/

/*
  Note:
    Scripts run on node.js virtual machine (we call them vm scripts)
    are something else than ingame scripts (implemented by class Script).
    Ingame scripts are compiled using node.js virtual machine (using
    a vm script), but then they become a regular javascript function
    which is assigned as a method to existing classes.
*/

/*
  Note about vm scripts:
    Properties of sandbox object (on which vm script is run) behave
    as if they were read-only.
      For example: "let x = result;" will work (reading from sandbox.result),
    but "result = 13;" won't work (writing to sandbox.result), so you have to
    use "this.result = 13;" instead.
*/

'use strict';

//import {ASSERT} from '../../shared/ASSERT';
//import {ASSERT_FATAL} from '../../shared/ASSERT_FATAL';
import {Mudlog} from '../../server/Mudlog';
import {AdminLevels} from '../../server/AdminLevels';

// Built-in node.js modules.
const vm = require('vm');

export class VirtualMachine
{
  // Contextifying a sandbox takes a few miliseconds so we will
  // reuse a single contextifyied sandbox object for compilation
  // of all mud scripts.
  public static contextifiedScriptCompilationSandbox =
    vm.createContext(VirtualMachine.scriptCompilationSandbox);

  /*
  // Contextifying a sandbox takes a few miliseconds so we will
  // reuse a single contextifyied sandbox object for creation of
  // all dynamic classes.
  public static contextifiedClassDeclarationSandbox =
    vm.createContext(VirtualMachine.classDeclarationSandbox);

  // Creates a piece of code, which, when run using 'vm' module of node.js,
  // declares a new javascript class.
  public static createClassDeclarationScript
  (
    className: string,
    ancestorName: string
  )
  {
    let script = "";

    // Note:
    //   'this' inside the script is a sandbox object on which
    // the script will be run.

    // 'use strict' is necessary in order to use ES6 class declaration.
    script += "'use strict'; "
    // this.Ancestor is a property of sandbox object.
    script += "let " + ancestorName + " = this.Ancestor;"
    script += "class " + className + " extends " + ancestorName;
    script += "{";
    script += "}";
    // this.result is a property of sandbox object.
    script += "this.result = " + className + ";";

    return script;
  }
  */

  /*
  // 'Contextify' the sandbox.
  // (check node.js 'vm' module documentation)
  public static contextifySandbox(sandbox: Object)
  {
    return vm.createContext(sandbox);
  }
  */

  // Compiles javascript code on node.js virtual machine.
  // (check node.js 'vm' module documentation)
  // Returns precompiled vmScript.
  public static compileVmScript(scriptName: string, code: string)
  {
    let vmScript = null;

    try
    {
      // Compile the script using node.js 'vm' module.
      vmScript = new vm.Script(code, { displayErrors: true });
    }
    catch (e)
    {
      Mudlog.log
      (
        "Compile error in script " + scriptName + ": " + e.message,
        Mudlog.msgType.SCRIPT_COMPILE_ERROR,
        AdminLevels.IMMORTAL
      );

      return null;
    }

    return vmScript;
  }

  // Executes precompiled vmScript withing contextified sandbox (vmContext).
  // (The types should be vm.Script and vm.Context, but it doesn't work for
  //  some reason even though they are exported in /headers/node.d.ts)
  public static executeVmScript(scriptName, vmScript, vmContext)
  {
    try
    {
      // Execute the script using 'vm' module of node.js.
      vmScript.runInContext(vmContext);
    }
    catch (e)
    {
      /*
      /// TODO: Pokud mi bude fungovat dynamické vytváření class bez vmScriptu,
      /// tak první mudlog potřebovat nebudu.

      // What this error means depends on type of vmScript we have run.
      if (scriptName === 'Class declaration system script')
      {
        Mudlog.log
        (
          "Runtime error while executing " + scriptName + ": " + e.message
          + "Check VirtualMachine.createClassDeclarationScript()",
          Mudlog.msgType.SCRIPT_COMPILE_ERROR,
          AdminLevels.IMMORTAL
        );
      }
      else
      {
      */
      Mudlog.log
      (
        "Runtime error while creating function from mud script "
        + scriptName + ": " + e.message,
        Mudlog.msgType.SCRIPT_COMPILE_ERROR,
        AdminLevels.IMMORTAL
      );
      /*
      }
      */

      return;
    }
  }

  /*
  // Template of sandbox object used for creating dynamic classes.
  //   'result' will contain the class that will be created by the script.
  //   'Ancestor' needs to be set prior to calling the script to a class
  //      we want to inherit from.
  private static get classDeclarationSandbox()
  {
    return { result: null, Ancestor: null };
  }
  */
  
  // Template of sandbox object used for compaling mud scripts.
  private static get scriptCompilationSandbox()
  {
    //   'result' will contain the function that will be created by compiling
    //            the vm script.
    //   'delay' is supposed to be a function. It will be set prior
    //            to running the vm script.
    return { result: null, delay: null  };
  }
}