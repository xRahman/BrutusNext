/*
  Part of BrutusNEXT

  TODO.
*/


/*
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {AccountManager} from '../server/AccountManager';
*/

import {ASSERT} from '../shared/ASSERT';

// This is a declaration of type that is a function that gets string as
// parameter (the rest of command string without actual command) and doesn't
// return anything.
export interface CommandHandler
{
  (argument: string): void;
}

export class CommandInterpretter
{

  // ---------------- Public methods --------------------

  // Returns true if command is known and handled.
  public processCommand(commandString: string): boolean
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
    for (let i = 0; i < this.myCommands.length; i++)
    {
      // Here we handle abbreviations by only comparing as many characters
      // of know command as is the length of received command abbreviation.
      if (this.myCommands[i].substring(0, command.length) === command)
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

        // We have matched the command, so it's time to call respective
        // command handler.
        this.myCommandHandlers[i](argument);

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
  public registerCommand(command: string, handler: CommandHandler)
  {
    if (!ASSERT(command !== "", "Attempt to register empty command"))
      return;

    if (!ASSERT(!(command in this.myCommands),
          "Attempt to register a command that is already registered"))
      return;

    this.myCommands.push(command);
    this.myCommandHandlers.push(handler);
  }

  // -------------- Protected class data ----------------

  // Array containing commands this entity knows. It needs to be array
  // in order for order to matter (which is necessary to correctly match
  // abbreviations)
  protected myCommands: Array<string> = [];
  // Array containing command handlers at the same indexes as corresponding
  // commands have in myCommands array.
  protected myCommandHandlers: Array<CommandHandler> = [];


  // --------------- Protected methods ------------------

  // ---------- Auxiliary protected methods ------------- 

}