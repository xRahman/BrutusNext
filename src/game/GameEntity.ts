/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

import {ASSERT} from '../shared/ASSERT';
import {SaveableContainer} from '../shared/SaveableContainer';
import {CommandHandler} from '../game/CommandInterpretter';
import {CommandInterpretter} from '../game/CommandInterpretter';

///export abstract class GameEntity extends SaveableContainer
export class GameEntity extends SaveableContainer
{
  constructor(version)
  {
    super(version);

    GameEntity.myStaticCommandInterpretter.registerCommand
    (
      "sit",
      (argument) => { this.onSit(argument); }
    );
  }

  // ---------------- Public methods --------------------

  public processCommand(command: string)
  {
    /// TODO
    if (!GameEntity.myStaticCommandInterpretter.processCommand(command))
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
  protected static myStaticCommandInterpretter = new CommandInterpretter();

  // --------------- Protected methods ------------------

  protected onSit(argument)
  {
    console.log("Executed command 'sit'");
  }
}