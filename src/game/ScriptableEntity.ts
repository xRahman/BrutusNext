/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

/// This path has been abandoned. Attaching and detaching scripts to instances
/// (entities) won't be possible - it's antipattern to the new system.
/// Behaviour of an entity is determined by it's class (= by it's prototype),
/// and by it's data properties (flags, etc.). If you want to change behaviour
/// of a single instance, you should create a new prototype which will
/// implement it.

/*

'use strict';

import {AdminLevels} from '../server/AdminLevels';
import {Mudlog} from '../server/Mudlog';
import {Script} from '../shared/Script';
import {NamedEntity} from '../game/NamedEntity';

export abstract class ScriptableEntity extends NamedEntity
{
  // Status of scripts on this entity.
  // Hashmap<[ string, ScriptDescriptor ]>
  //   Key: script name (without prototype name)
  //   Value: ScriptDescriptor object
  private scriptDescriptors = new Map();


  // This function is set to entity instead of detached script.
  // (It's because the script is only detached from entity, not from
  //  the prototype. So the prototype function must be overriden with
  //  an empty one to stop script from executing.)
  private detachedScript(...args: any[])
  {
    Mudlog.log
    (
      "Attempt to run detached script " + script.getFullName()
      + " on entity " + this.getErrorIdString() + "."
      + " Script is not attached",
      Mudlog.msgType.SCRIPT_RUNTIME_ERROR,
      AdminLevels.IMMORTAL
    );
  };

  // ---------------- Public methods --------------------

  // Attaches script to this entity.
  // (To an instance, not to the prototype.)
  public attach(script: Script)
  {
    if (!script.isValid())
    {
      Mudlog.log
      (
        "Attempt to attach invalid script " + script.getFullName()
        + " to entity " + this.getErrorIdString() + "."
        + " Script is not attached",
        Mudlog.msgType.SCRIPT_RUNTIME_ERROR,
        AdminLevels.IMMORTAL
      );

      return;
    }

    let scriptDescriptor = new ScriptDescriptor();
    scriptDescriptor.script = script;

    this.scriptDescriptors.set(script.name, script);

    this[script.name] = script.scriptFunction;
  }

  // Detaches script from this entity.
  // (sets empty function instead of it)
  public detach(script: Script)
  {
    // Sets empty function instead of a script.
    // (It's because the script is only detached from entity, not from
    //  the prototype. So the prototype function must be overriden with
    //  an empty one to stop script from executing.)
    this[script.name] = ScriptableEntity.detachedScript;
  }

  // Stops a running script.
  // (Running script means script that is waiting inside a delay().
  //  It is not possible to stop scripts that don't have 'await delay();'
  //  in them - such scripts are atomic)
  public stop(script: Script)
  {
    // TODO:
  }
}

class ScriptDescriptor
{
  // Jmeno skriptu tady asi nepotrebuju, protoze jmenem indexuju hashmapu
  // s descriptorama, takze ho nutne musim znat, kdyz saham na scriptDescriptor.
  ///public scriptName: string = "";
  // If null, script is is detached from the entity.
  public script: Script = null;

}
*/