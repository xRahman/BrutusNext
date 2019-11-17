/*
  Part of BrutusNEXT

  Array for searching for commands by abbreviations.
*/

'use strict';

export class CommandList
{
  // ---------------- Public methods --------------------

  // Returns command handler for given command abbreviations.
  // (Returns empty string if no command is registered for such abbrev.)
  public getHandlerByAbbrev(abbrev: string): string
  {
    if (this.abbrevs[abbrev] === undefined)
      return "";

    return this.abbrevs[abbrev];
  }

  public isRegistered(abbrev: string): boolean
  {
    return this.abbrevs[abbrev] !== undefined;
  }

  // This is used by CommandInterpretter. Each abbreviation corresponds
  // to at most one command (the one which has been registered first).
  public addCommand(command: string, handler: string)
  {
    // Add all possible abbreviations of command.
    for (let i = 0; i < command.length; i++)
    {
      // Substring from 0 to (i + 1), because without +1 it would start
      // with empty string and end with a string 1 character shorter than
      // length.
      let abbrev = command.substring(0, i + 1);

      if (!this.isRegistered(abbrev))
        this.abbrevs[abbrev] = handler;
    }
  }

  // ---------------- Protected data --------------------

  // This hashmap maps abbreviations to the list of items (of type T)
  // corresponding to that abbreviation.
  protected abbrevs: { [abbrev: string]: string } = {};

  // --------------- Private methods -------------------

}
