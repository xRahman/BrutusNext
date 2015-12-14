/*
  Part of BrutusNEXT

  Character (player or mob).
*/

'use strict';

import {GameEntity} from '../game/GameEntity';
import {CharacterData} from '../game/CharacterData';

export class Character extends GameEntity
{
  constructor(name: string)
  {
    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    super({ version: 0 });

    this.myData.name = name;
  }

  static get SAVE_DIRECTORY() { return "./data/characters/"; }

  // ----- --------- Public accessors -------------------

  public get name() { return this.myData.name; }

  // ---------------- Public methods --------------------

  public save()
  {
    this.saveToFile(Character.SAVE_DIRECTORY + this.myData.name + ".json");
  }

  public load()
  {
    this.loadFromFile(Character.SAVE_DIRECTORY + this.myData.name + ".json");
  }

  // -------------- Protected class data ----------------

  public myData = new CharacterData();

  // You can request access of this character from CharacterManager 
  // using this unique id;
  public myId: string = "";

  // --------------- Protected methods ------------------

  /// Testing
  protected doStand(argument)
  {
    console.log("Executed command 'stand': " + this.x);
  }

  /// Testing
  protected doSit(argument)
  {
    console.log("Haf haf! 'sit': " + this.x);
  }

  public x = 0;
}

// Statically registered commands:
GameEntity.registerCommand('stand', 'doStand');