/*
  Part of BrutusNEXT

  TODO.
*/

/*
  Implementation notes:
  1) All known commands are listed at the end of this module (it needs to be
     at the end in order for CommandInterpretter class to be know)
  2) All game entitities are inherited from CommandInterpretter, therefore all
     game entities can process commands. However, not all of them need to do it
     and neither of them needs to know how to handle all existing commands.
  3) Commands are handled by 'doSomething' methods (it's a convention,
     please adhere to it). If you implement such method in your entity, it
     will process that command, if you don't, 'Huh?!?' will be the response.
  4) 'doSomthing's are regular methods, they can be inherited, overriden, etc.
     If you override a command handler, your entity will handle it differently
     than it's predecessor of course.
  5) If you have added a new command handler ('doSomething' method) and it
     doesn't work, you probably:
     - forgot to register such command here in CommandInterpretter
     - misstyped the command or the handler name
     - are not the game entity you think you are (you have added it to the
       wrong class)
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {ScriptableEntity} from '../../../server/lib/entity/ScriptableEntity';
import {CommandList} from
  '../../../server/game/command/CommandList';

/// Zatím řeším jen to, aby to šlo přeložit. Výhledově asi CommandInterpretter
/// zůstane standalone, ale bude potřeba vyšešit matchování handleru
/// (pokud to bude jako do teď, tj. prostě se na entitě najde a pustí
///  metoda příslušného jména, tak by to mělo být celkem easy).
export abstract class Commands /* extends ScriptableEntity*/
{
  // ---------------- Static methods -------------------- 

  // This method allows you to add a new commands. 
  public static registerCommand(command: string, handler: string)
  {
    if (command === "")
    {
      ERROR("Attempt to register an empty command");
      return;
    }

    console.log("Registering command '" + command + "'");
    Commands.commandSearchList.addCommand(command, handler);
  }

  // ---------------- Public methods --------------------

  // Returns true if command is known and handled.
  public processCommand(commandString: string)
  {
    if (commandString === "")
    {
      ///ERROR("Attempt to process empty command");
      return false;
    }

    // Note: In order to be able to dynamically add command to a specific
    // instances of game entities, you would need to add non-static version
    // of commandSearchList and search in it here if none of staticaly bound
    // commands matched commandString.

    if (!this.processStaticCommand(commandString))
      this.unknownCommand();
  }

  //----------------- Protected data --------------------
  
  // Container holding abbreviations of all known commands and names of their
  // respective handlers.
  protected static commandSearchList = new CommandList(); 

  // --------------- Protected methods ------------------

  // This method should send message to the connected player that command is
  // not recognized.
  protected abstract unknownCommand();

  // ---------------- Private methods -------------------

  // Parse command argument(s), which is the rest of the command string when
  // command is cut off of it.
  private parseArgument(commandString: string): string
  {
    let firstSpacePos = commandString.indexOf(' ');

    if (firstSpacePos === -1)
    {
      // If there is no space in commandString, argument will be empty
      // string.
      return "";
    }
    else
    {
      // Otherwise it's going to be substring beginnig one character
      // after the position of first space and ending at the end of
      // commandString.
      return commandString.substring(firstSpacePos + 1, commandString.length);
    }
  }

  // Parse first word (the actual command) from command string
  private parseCommand(commandString: string): string
  {
    let firstSpacePos = commandString.indexOf(' ');

    // If there is a space in commandString, command will be it's substring
    // from the beginning to the position of first space.
    if (firstSpacePos !== -1)
      return commandString.substring(0, firstSpacePos);
    else
      return commandString;
  }

  // Returns true if command is known and handled.
  private processStaticCommand(commandString: string): boolean
  {
    let commandAbbrev = this.parseCommand(commandString);

    let commandHandler = Commands.commandSearchList
      .getHandlerByAbbrev(commandAbbrev);

    // getHandlerByAbbrev() returns "" if no command is registered for
    // this abbreviation.
    if (commandHandler !== "")
    {
      // Not all game entities know all existing commands.
      // (This checks if method of this name exists on this entity.)
      if (!(commandHandler in this))
        return false;

      let argument = this.parseArgument(commandString);

      // We have matched the command, so it's time to call respective
      // command handler.
      this[commandHandler](argument);

      return true;
    }

    return false;
  }
}

// ------- Registration of command handlers -----------

// Note: Order of registration matters, it specifies priority.
//   So don't register any commands starting with the same letter as movement
// commands (north, south, etc.) before movement commands. One-character
// abbreviations ('n', 's', etc.) would stop working (your command would
// trigger instead).
//   Generally said it's good practice to add new commands after the existing
// ones with the same prefix.
Commands.registerCommand('look', 'doLook');
Commands.registerCommand('qui', 'doQui');
Commands.registerCommand('quit', 'doQuit');
Commands.registerCommand('sit', 'doSit');