/*
  Part of BrutusNEXT

  Implements container for all game entities.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdContainer} from '../shared/IdContainer';
import {Game} from '../game/Game';
import {Character} from '../game/Character';
import {Mudlog} from '../server/Mudlog';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

export class CharacterManager
{
  // ---------------- Public methods --------------------

  public createNewCharacter(characterName: string, playerConnectionId: Id): Id
  {
    ASSERT_FATAL(!this.exists(characterName),
      "Attempt to create a character '"
      + characterName + "' who already exists");

    let newCharacter = new Character(characterName);
    let newCharacterId = this.addNewCharacter(newCharacter);

    // Save the character to the disk (so we know that the character exists).
    // (This does not need to be synchronous.)
    newCharacter.save();

    return newCharacterId;
  }

  // Returns null if character is not online (or doesn't exist).
  public getCharacterByName(characterName: string): Character
  {
    // Using 'in' operator on object with null value would crash the game.
    if (!ASSERT(this.myCharacterNames !== null,
      "Invalid myPlayerCharacterNames"))
      return;

    if (characterName in this.myCharacterNames)
    {
      // Character is already loaded.
      let characterId = this.myCharacterNames[characterName];

      return this.getCharacter(characterId);
    }

    return null;
  }

  // Adds character that has been loaded from file to the list of
  // online character. Id loaded from file is reused.
  public registerLoadedCharacter(character: Character)
  {
    ASSERT_FATAL(!this.getCharacterByName(character.name),
      "Attempt to register character '"
      + character.name + "' that is already registered");

    this.addCharacter(character);
  }

  // Removes character from list of online characters.
  public dropCharacter(characterId: Id)
  {
    let characterName = Game.entities.getItem(characterId).name;

    /// Tohle bude pravdepodobne spamovat pri umirani mobu a tak (nebo by
    /// aspon melo). Zatim si to tu necham.
    /// (Pokud by se to melo tykat jen playeru, tak by asi stacilo checkovat,
    /// ze character ma nenulove playerConnectionId)
    Mudlog.log
    (
      "Dropping character " + characterName,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );

    this.removeCharacter(characterId);
  }

  public getCharacter(id: Id): Character
  {
    let character = Game.entities.getItem(id);

    ASSERT_FATAL(character instanceof Character,
      "Attempt to get character by id that doesn't point to an instance of"
      + "class inherited from Character");

    return <Character> character;
  }

  // Returns true if player character with given name exists.
  public exists(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.myCharacterNames[characterName])
      return true;

    let path = Character.SAVE_DIRECTORY + characterName + ".json";

    return fs.existsSync(path);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps character names to character ids.
  protected myCharacterNames: { [key: string]: Id } = {};
 
  // -------------- Protected methods -------------------

  // Adds character to the list of online characters and to the auxiliary
  // hashmap, returns its unique id.
  protected addNewCharacter(character: Character): Id
  {
    let newId = Game.entities.addNewItem(character);

    // Also add record to the corresponding hashmap.
    this.myCharacterNames[character.name] = newId;

    return newId;
  }

  // Adds a character that already has an id (loaded from file).
  protected addCharacter(character: Character)
  {
    Game.entities.addNewItem(character);

    // Also add record to the corresponding hashmap.
    this.myCharacterNames[character.name] = character.id;
  }

  // Removes a character both from the list of online characters and from the
  // auxiliary hasmap
  protected removeCharacter(characterId: Id)
  {
    let characterName = Game.entities.getItem(characterId).name;

    Game.entities.deleteItem(characterId);

    // Also remove record from the corresponding hashmap.
    delete this.myCharacterNames[characterName];
  }
}