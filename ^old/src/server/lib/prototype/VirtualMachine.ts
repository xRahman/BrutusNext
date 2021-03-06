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

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
//import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';

// Built-in node.js modules.
//const vm = require('vm');
import * as vm from 'vm';

export class VirtualMachine
{
  // Template of sandbox object used for compiling mud scripts.
  private static getScriptCompilationSandbox()
  {
    //   'result' will contain the function that will be created by compiling
    //            the vm script.
    //   'delay' is supposed to be a function. It will be set prior
    //            to running the vm script.
 /// TEST: console je tu docasne, ve finale ji skripty nebudou potrebovat
 /// (a ani by ji nemely videt, console umoznuje savovat na disk a tak).
    return { console: console, result: null /*, delay: null*/ };
  }

  // Contextifying a sandbox takes a few miliseconds so we will
  // reuse a single contextifyied sandbox object for compilation
  // of all mud scripts.
  public static contextifiedScriptCompilationSandbox =
    vm.createContext(VirtualMachine.getScriptCompilationSandbox());

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
  public static compileVmScript
  (
    scriptName: string,
    code: string
  )
  : vm.Script | null
  {
    let vmScript: any = null;

    try
    {
      // Compile the script using node.js 'vm' module.
      vmScript = new vm.Script(code, { displayErrors: true });
    }
    catch (e)
    {
      Syslog.log
      (
        "Compile error in script " + scriptName + ": " + e.message,
          ///+ getTrimmedStackTrace(),
        MessageType.SCRIPT_COMPILE_ERROR,
        AdminLevel.IMMORTAL
      );

      return null;
    }

    return vmScript;
  }

  // Executes precompiled vmScript withing contextified sandbox (vmContext).
  // (The types should be vm.Script and vm.Context, but it doesn't work for
  //  some reason even though they are exported in /headers/node.d.ts)
  public static executeVmScript
  (
    scriptName: string,
    vmScript: vm.Script,
    vmContext: vm.Context
  )
  {
    if (vmContext === null)
    {
      ERROR("Invalid vmContext");
      return;
    }

    if (vmScript === null)
    {
      ERROR("Invalid vmScript");
      return;
    }

    try
    {
      // Execute the script using 'vm' module of node.js.
      vmScript.runInContext(vmContext);
    }
    catch (e)
    {
      /*
      /// TODO: Pokud mi bude fungovat dynamické vytváření class bez vmScriptu,
      /// tak první syslog potřebovat nebudu.

      // What this error means depends on type of vmScript we have run.
      if (scriptName === 'Class declaration system script')
      {
        Syslog.log
        (
          "Runtime error while executing " + scriptName + ": " + e.message
          + "Check VirtualMachine.createClassDeclarationScript()",
          Syslog.msgType.SCRIPT_COMPILE_ERROR,
          AdminLevels.IMMORTAL
        );
      }
      else
      {
      */
      Syslog.log
      (
        "Failed to create function from mud script "
        + scriptName + ": " + e.message,
        MessageType.SCRIPT_COMPILE_ERROR,
        AdminLevel.IMMORTAL
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
  

}