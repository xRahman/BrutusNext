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
  3) Commands are handled by 'doSomething' methods (this is a convention,
     please adhere to it). If you implement such method in your entity, it
     will process that command, if you don't 'Huh?!?' will be the response.
  4) 'doSomthing's are regular methods, they can be inherited, overriden, etc.
     If you override a command handler, your entity will handle it differently
     than it's predecessor of course.
  5) If you added a new command handler ('doSomething' method) and it doesn't
     execute when you type in the command, you probably:
     - forgot to register such command here in CommandInterpretter
     - misstyped the command or the handler name
     - are not the game entity you think you are (you have added it to the
       wrong class)
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {SaveableContainer} from '../shared/SaveableContainer';
import {GameEntity} from '../game/GameEntity';

export abstract class CommandInterpretter extends SaveableContainer
{

  // ---------------- Static methods -------------------- 

  // This method allows you to add a new commands. 
  public static registerCommand(command: string, handler: string)
  {
    if (!ASSERT_FATAL(command !== "", "Attempt to register an empty command"))
      return;

    if (!ASSERT_FATAL(CommandInterpretter.myCommands.indexOf(command) === -1,
      "Attempt to register command '" + command
      + "' that is already registered"))
      return;

    console.log("Registering command '" + command + "'");

    CommandInterpretter.myCommands.push(command);
    CommandInterpretter.myCommandHandlers.push(handler);
  }

  // ---------------- Public methods --------------------

  // Returns true if command is known and handled.
  public processCommand(commandString: string)
  {
    // NOTE: In order to be able to dynamically add command to a specific
    // instances of game entities, you would need to add non-static versions
    // of myCommands and myCommandHandlers and search in them here if none of
    // staticaly bound commands matched commandString.

    if (!this.myProcessStaticCommand(commandString))
      this.unknownCommand();
  }

  // -------------- Protected class data ----------------

  // Array containing all known commands. It needs to be array
  // in order for order to matter (which is necessary to correctly match
  // abbreviations)
  protected static myCommands: Array<string> = [];
  // Array containing command handlers at the same indexes as corresponding
  // commands have in myCommands array.
  protected static myCommandHandlers: Array<string> = [];

  // --------------- Protected methods ------------------

  // This method should send message to the connected player that command is
  // not recognized.
  protected abstract unknownCommand();

  // ---------------- Private methods -------------------

  // Returns true if command is known and handled.
  private myProcessStaticCommand(commandString: string): boolean
  {
    if (!ASSERT(commandString !== "", "Attempt to process empty command"))
      return false;

    let argument = "";
    // Parse first word (the actual command) from command string
    let command = commandString;

    // If there is a space in commandString, command will be it's substring
    // from the begenning to the position of first space.
    if (commandString.indexOf(' ') !== -1)
      command = commandString.substring(0, commandString.indexOf(' '));

    // Now cycle through all known commands.
    for (let i = 0; i < CommandInterpretter.myCommands.length; i++)
    {
      // Here we handle abbreviations by only comparing up to as many
      // characters as the length of received command abbreviation.
      if (CommandInterpretter.myCommands[i]
           .substring(0, command.length) === command)
      {
        // Here we parse command argument(s), which is the rest of the
        // command string when command is cut off of it.
        if (commandString.indexOf(' ') === -1)
        {
          // If there is no space in commandString, argument will be empty
          // string.
          argument = "";
        }
        else
        {
          // Otherwise it's going to be substring beginnig one character
          // after the position of first space and ending at the end of
          // commandString.
          argument = commandString
            .substring(commandString.indexOf(' ') + 1, commandString.length);
        }

        let commandHandler = CommandInterpretter.myCommandHandlers[i];

        // Not all game entities know all existing commands.
        if (!(commandHandler in this))
          return false;

        // We have matched the command, so it's time to call respective
        // command handler.
        this[commandHandler](argument);

        return true;
      }
    }

    // If we ended up here, it means that commandString matched none of our
    // know commands.
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
CommandInterpretter.registerCommand('sit', 'doSit');