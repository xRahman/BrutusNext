/*
  Part of BrutusNEXT

  Data from which script functions are created.
*/

'use strict';

import {Attributes} from '../../../shared/lib/class/Attributes';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {VirtualMachine} from '../../../server/lib/prototype/VirtualMachine';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {GameEntity} from '../../../server/game/GameEntity';
import {Classes} from '../../../shared/lib/class/Classes';

// 3rd party modules.
import * as ts from "typescript";

export class Script extends Serializable
{
  public static get CANCELLED() { return 'Script cancelled'; }

  // Name of function that will be created on prototype.
  // (This needs to be the same as the name of the function inside the script.)
  public name: string = "";

  // Name of the prototype this script belongs to.
  public prototype: string = null;

  // Code that will be be compiled into a function and assigned to a prototype.
  public code: string = "";

  // Calling this function will execute compiled script code.
  // (Only after the script is compiled of course.)
  public run = null;
    private static run: Attributes =
    {
      saved: false
    };

  // When the scrit is compiled, this is the function that represents
  // the script.
  private internalFunction = null;
    // Do not save variable internalFunction.
    private static internalFunction: Attributes =
    {
      saved: false
    };

  constructor()
  {
    super();

    /*
      The following code uses quite a bit of dark magic so let me explain.

      General idea is to allow instances of game entities (like 'evilMob')
      to be assigned a function, which is created by compiling the script.
      Easiest way to do it is: evilMob['functionName'] = scriptFunction;
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
      fine, because we want to be able to access evilMob's properties from
      the script.
        That, however, means that this.internalFunction() call inside
      Script::scriptFunction() won't work, because this is an evilMob, not
      script. So we need to rememeber 'script' somewhere and that somewhere
      is a closure of constructor of Script class (yes, that's where we are
      right now). When a new Script() is called, constructor of Script launches
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

    this.run = async function(...args: any[])
    {
      /// TODO: Zkontrolovat, že jsme dostali správné parametry.
      /// - vidím tady na script (protože ho mám z closure), v něm
      ///   by mělo být uloženo, jaké má dostat parametry
      /// - a vidím samozřejmě i jaké jsem dostal parametry.

      if (script.internalFunction === null)
      {
        Syslog.log
        (
          "Internal script function of script " + script.getFullName()
          + " doesn't exist yet. Script must be compiled before"
          + " it can be used",
          MessageType.SCRIPT_RUNTIME_ERROR,
          AdminLevel.IMMORTAL
        );

        return;
      }

      // Declare _closureDelay() function in a closure (locally) so it can
      // access local constructor variables.
      let _closureDelay = async function
      (
        miliseconds: number,
        entity: GameEntity
      )
      {
        // Variable script is from the closure (it's a local variable
        // of constructor of Script class).
        await script.internalDelay
        (
          miliseconds,     // Length of the delay.
          entity,  // Id of entity on which the script was triggered.
          // Reference to compiled script function at the time of launching it.
          // (It will be used to check if script was recompiled whill it was
          //  running.)
          script.internalFunction,
          script.getFullName()
        );
      }


      /*
        Now we just call our insideFunction() on remembered 'script'.
        It's not that easy, however, because we need script to have
        'evilMob' as this (because we need to be able to access evilMob's
        properties from the script).

        To to it, we use call() method of Function() object, which allows
        us to call a function with specified 'this' (which is the entity
        on which the script was triggered, like 'evilMob').
      */

      script.internalFunction.call
      (
        // 'this' is the entity on which the script was triggered.
        this,   // This 'this' will become 'this' of internalFunction().
        this,   // This 'this' will become 'me' parameter inside the script.
        _closureDelay,
        script, // Script object with compiled script.
        args    // Arguments passed to triggered script.
      );
    }
  }

  // ---------------- Public methods --------------------

  public isValid(): boolean
  {
    return this.internalFunction !== null;
  }

  // Returns 'prototypeName.scriptName'
  // (for example SystemRoom.onLoad).
  public getFullName(): string
  {
    return this.prototype + "." + this.name;
  }

  // Creates this.scriptFunction from this.code.
  public compile()
  {
    // Declare local variable to store 'this.scriptname' in a closure.
    let scriptName = this.getFullName();

    /*
    // Declare local variable to store 'this' in a closure.
    // (so we can call this.scriptChanged() from funcion delay())
    let script = this;
    
    // Declare local variable to store 'compiledFunction' in a closure.
    // (compiedFunction will be assigned only after the script is compiled,
    //  because it will be created by the compilation of the script. But
    //  it's ok, because delay() from withing the script will definitely
    //  be run even later - definitely not before the script get's compiled.)
    let compiledFunction = null;
    
    // Declare delay() function in a closure (locally) so it can
    // access local variable scriptName.
    let delay = async function(miliseconds: number)
    {
      console.log(this.getId().getStringId());

      // Variable script is from the closure (it's a local variable
      // of Script.compile).
      await script.internalDelay(miliseconds, compiledFunction, scriptName);
    }
    
    // Sandbox is stored in a static variable - it's reused for
    // compiling all mud scripts (because contextifying a sandbox
    // takes quite a long time).
    let sandbox = VirtualMachine.contextifiedScriptCompilationSandbox;

    // Assign localy declared delay() function to the sandbox, so
    // the script will be able to call it.
    sandbox.delay = delay;
    
    //// calling delay() from within the script will set 'this' to
    //// sandbox 'this, which is an entity that the script is running on.
    //sandbox.delay = delay.call(sandbox.me);
    */

    let vmScript = this.compileVmScript(scriptName);

    // Error has been reported by compileVmScript()
    if (vmScript === null)
      return;

    // Sandbox is stored in a static variable - it's reused for
    // compiling all mud scripts (because contextifying a sandbox
    // takes quite a long time).
    let sandbox = VirtualMachine.contextifiedScriptCompilationSandbox;

    // Run the compiled code within our sandbox object.
    VirtualMachine.executeVmScript(scriptName, vmScript, sandbox);

    // Assign compiled function to a class variable.
    this.internalFunction = sandbox.result;

    /*
    // And also store it in a local variable of this method so it's
    // awailable from within a closure function delay().
    compiledFunction = this.internalFunction;
    */
  }

  // Checks if internal function changed against the one
  // passed as parameter.
  // (This happens when the script is recompiled.)
  public internalFunctionChanged(originalFunction: Function): boolean
  {
    if (this.internalFunction === originalFunction)
      return false;
    
    return true;
  }

  // Adds 'use strict';, function header and {} to the code.
  private getFullCode(): string
  {
    let fullCode =
        "'use strict';\n"
      // TODO: Předávat zbylé parametry
      + "this.result = async function " + this.name
      + "("
      + "  me: GameEntity,"
//      + "  _script: Script,"
      + "  _closureDelay: Function"
      + ")\n"
      + "{\n"
           // Here we are declaring local function delay()
           // within the closure of script function (so it
           // can see parameter 'me').
      + "  let delay = async function(miliseconds: number)\n"
      + "  {\n"
             // Variable me is taken from the script closure
             // (it's a script parameter).
      + "    await _closureDelay(miliseconds, me);\n"
      + "  }\n"
      +    this.code
      + "}\n";
    
    return fullCode;
  }

  private resumeScript
  (
    script: Script,
    resolve,
    reject,
    entity: GameEntity,
    compiledFunction: Function
  )
  {
    // TODO: Udelat neco s 'entityId', kdyz uz jsem ho sem propasoval
    // (testnout podle nej, jestli je entity jeste validni)
    /// TODO: Nově tu mám referenci, takže stačí if (!entity.isValid())
    console.log(entity.getId());

    // If the script code was recompiled while this script was
    // waiting for delay() to expire, this instance of script
    // needs to be stopped.
    if (script.internalFunctionChanged(compiledFunction))
    {
      let error = new Error();
      error.name = Script.CANCELLED;
      error.message =
        "Running script " + script.getFullName() + " has been cancelled"
        + " because it had been recompiled";

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

  private compileVmScript(scriptName: string)
  {
    // Adds'use strict';, function header and {} to the script code.
    let fullCode = this.getFullCode();
    let transpiledCode = null;

    try
    {
      // Transpile from typescript to javascript
      transpiledCode =
        ts.transpile(fullCode, { module: ts.ModuleKind.CommonJS });
    }
    catch (e)
    {
      Syslog.log
      (
        "Transpile error in script " + scriptName + ": " + e.message,
        MessageType.SCRIPT_COMPILE_ERROR,
        AdminLevel.IMMORTAL
      );

      return null;
    }

    return VirtualMachine.compileVmScript(scriptName, transpiledCode);
  }

  private async internalDelay
  (
    miliseconds: number,
    entity: GameEntity,
    compiledFunction: Function,
    scriptName: string
  )
  {
    // If someone writes 'await delay();' into a script (without a parameter),
    // the script will wait 1 milisecond.
    if (miliseconds === undefined)
    {
      Syslog.log
      (
        "Missing 'miliseconds' parameter of 'await delay()' in script "
        + scriptName + ". Script will wait for 1 milisecond",
        MessageType.SCRIPT_RUNTIME_ERROR,
        AdminLevel.IMMORTAL
      );

      miliseconds = 1;
    }

    return new Promise
    (
      (resolve, reject) =>
        setTimeout
        (
          // This migth be confusing because setTimeout passes parameters
          // in quite unusual way. The syntax is:
          //   setTimeout(callback, delay, [arg], [...]);
          // which means that arguments passed to callback are not
          // passed like this: callback(arguments) as you would expect,
          // but like extra arguments of setTimeout.
          this.resumeScript,  // Function to be called when timeout ends.
          miliseconds,        // Length of timeout.
          // Remaining parameters are arguments of this.resumeScript function:
          this,     // Script object with compiled script.
          resolve,
          reject,
          entity,
          compiledFunction
        )
    );
  }
}

Classes.registerSerializableClass(Script);