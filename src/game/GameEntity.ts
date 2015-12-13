/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {SaveableContainer} from '../shared/SaveableContainer';
///import {CommandHandler} from '../game/CommandInterpretter';
import {CommandInterpretter} from '../game/CommandInterpretter';

///export abstract class GameEntity extends SaveableContainer
export class GameEntity extends SaveableContainer
{
  constructor(version)
  {
    super(version);

    /// TESTING
    /// TODO: Tohle je blbe, kazda instance GameEntity si zaregistruje
    /// svuj vlastni command. Zrejme je taky blbe check v CommandInterpretteru
    /// na to, ze se registruje znova ten samej command.
    this.myCommandInterpretter.registerCommand('sit', 'onSit');
  }

  // ---------------- Public methods --------------------

  public processCommand(command: string)
  {
    /// TODO
    if (!this.myCommandInterpretter.processCommand(this, command))
    {
      console.log("Huh?!?");
    }
  }

  /*
  // This method allows you to add a new command to your game entity.
  public registerCommand(command: string, handler: CommandHandler)
  {
    

    if (!ASSERT(command !== "", "Attempt to register empty command"))
      return;

    if (!ASSERT(!(command in this.myCommands), "Attempt to register a command that"
      + " is already registered"))
      return;
  }
  */

  // -------------- Protected class data ----------------

  // Each game entity has two sets of commands: Static set, which are
  // commands that all entities of this type have, and non-static set,
  // which contains commands added to this entity at runtime.
  /// (pravdepodobne to nebude potreba (rozhodne ne hned ted, takze se
  /// na dynamicky pridelene commandy rovnou vykaslu).
  ///protected myCommandInterpretter = null;
  protected myCommandInterpretter = new CommandInterpretter();

  // --------------- Protected methods ------------------

  /// Testing
  protected onSit(argument)
  {
    console.log("Executed command 'sit': " + this.x);
  }
  public x = 0;
}