/*
  Part of BrutusNEXT

  Array for searching for commands by abbreviations.
*/

'use strict';

export class CommandSearchList
{
  // ---------------- Public methods --------------------

  // Returns command handler for given command abbreviations.
  // (Returns empty string if no command is registered for such abbrev.)
  public getHandlerByAbbrev(abbrev: string): string
  {
    if (this.myAbbrevs[abbrev] === undefined)
      return "";

    return this.myAbbrevs[abbrev];
  }

  public isAbbrevRegistered(abbrev: string): boolean
  {
    if (this.myAbbrevs[abbrev] === undefined)
      return false;
    else
      return true;
  }

  // This is used by CommandInterpretter. Each abbreviation corresponds
  // to at most one command (the one which has been registered first).
  public addCommand(command: string, handler: string)
  {
    // Add all possible abbreviations of command.
    for (let i = 0; i < command.length; i++)
    {
      let abbrev = command.substring(0, i);

      if (!this.isAbbrevRegistered(abbrev))
        this.myAbbrevs[abbrev] = handler;
    }
  }

  // -------------- Protected class data ----------------

  // This hashmap maps abbreviations to the list of items (of type T)
  // corresponding to that abbreviation.
  protected myAbbrevs: { [abbrev: string]: string } = {};

  // --------------- Private methods -------------------

}
