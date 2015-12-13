/*
  Part of BrutusNEXT

  TODO.
*/

'use strict';

/*
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {AccountManager} from '../server/AccountManager';
*/

import {ASSERT} from '../shared/ASSERT';
import {GameEntity} from '../game/GameEntity';

/*
// This is a declaration of type that is a function that gets string as
// parameter (the rest of command string without actual command) and doesn't
// return anything.
export interface CommandHandler
{
  (argument: string): void;
}
*/

export class CommandInterpretter
{

  // ---------------- Public methods --------------------

  // Returns true if command is known and handled.
  public processCommand(entity: GameEntity, commandString: string): boolean
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

    // Now cycle through all commands known to this command interpretter.
    for (let i = 0; i < CommandInterpretter.myCommands.length; i++)
    {
      // Here we handle abbreviations by only comparing as many characters
      // of know command as is the length of received command abbreviation.
      if (CommandInterpretter.myCommands[i].substring(0, command.length) === command)
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

        if (!ASSERT(commandHandler in entity,
              "Attempt to call event handler '" + commandHandler
              + "' which doesn't exist on entity that wants to process"
              + " the command"))
        {
          return false;
        }

        // We have matched the command, so it's time to call respective
        // command handler.
        entity[commandHandler](argument);

        return true;
      }
    }

    // If we ended up here, it means that commandString matched none of our
    // know commands.
    return false;
  }

  // This method allows you to add a new command to your game entity.
  // IMPORTANT: You need to pass handler using lambda function or it
  // won't have correct 'this'.
  // Example:
  //   this.myCommandInterpretter.registerCommand
  //   (
  //     "sit",
  //     (argument) => { this.onSit(argument); }
  //   );
  public registerCommand(command: string, handler: string)
  {
    if (!ASSERT(command !== "", "Attempt to register an empty command"))
      return;

    /*
    console.log(command);
    console.log(CommandInterpretter.myCommands.indexOf(command));
    */

    if (!ASSERT(CommandInterpretter.myCommands.indexOf(command) === -1,
      "Attempt to register command '" + command
      + "' that is already registered"))
      return;

    console.log("Registering command '" + command + "'");

    CommandInterpretter.myCommands.push(command);
    CommandInterpretter.myCommandHandlers.push(handler);
  }

  // -------------- Protected class data ----------------

  // Array containing commands this entity knows. It needs to be array
  // in order for order to matter (which is necessary to correctly match
  // abbreviations)
  protected static myCommands: Array<string> = [];
  // Array containing command handlers at the same indexes as corresponding
  // commands have in myCommands array.
  protected static myCommandHandlers: Array<string> = [];


  // --------------- Protected methods ------------------

  // ---------- Auxiliary protected methods ------------- 

}