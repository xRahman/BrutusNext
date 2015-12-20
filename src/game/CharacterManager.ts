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
    let newCharacterId = this.addOnlineCharacter(newCharacter);

    // Save the character to the disk (so we know that the character exists).
    newCharacter.save();

    return newCharacterId;
  }

  // Returns id of character if she is already loaded or loads her from disk.
  public requestCharacter(characterName: string): Id
  {
    let characterId: Id = Id.NULL;

    // Using 'in' operator on object with null value would crash the game.
    if (!ASSERT(this.myPlayerCharacterNames !== null,
          "Invalid myPlayerCharacterNames"))
      return;

    if (characterName in this.myPlayerCharacterNames)
    {
      // Character is already loaded.
      characterId = this.myPlayerCharacterNames[characterName];
    } else
    {
      // Login to an offline account.
      let character = new Character(characterName);
      characterId = this.addOnlineCharacter(character);
      // Load character from file.
      character.load();
    }

    return characterId;
  }

  // Removes character from list of online characters.
  public dropCharacter(characterId: Id)
  {
    let characterName = Game.entities.getItem(characterId).name;

    /// Tohle bude pravdepodobne spamovat pri umirani mobu a tak (nebo by
    /// aspon melo). Zatim si to tu necham.
    /// (Pokud by se to melo tykat jen playeru, tak by asi stacilo checkovat,
    /// ze character ma nenulove playerConnectionId)
    Mudlog.log(
      "Dropping character " + characterName,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

    this.removeOnlineCharacter(characterId);
  }

  public getPlayerCharacter(id: Id)
  {
    return Game.entities.getItem(id);
  }

  // Returns true if player character with given name exists.
  public exists(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.myPlayerCharacterNames[characterName])
      return true;

    let path = Character.SAVE_DIRECTORY + characterName + ".json";

    return fs.existsSync(path);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps character names to character ids.
  protected myPlayerCharacterNames: { [key: string]: Id } = {};
 
  // -------------- Protected methods -------------------

  // Adds character to the list of online characters and to the auxiliary
  // hashmap, returns its unique id.
  protected addOnlineCharacter(character: Character): Id
  {
    let newId = Game.entities.addNewItem(character);

    // Also add record to the corresponding hashmap.
    this.myPlayerCharacterNames[character.name] = newId;

    return newId;
  }

  // Removes a character both from the list of online characters and from the
  // auxiliary hasmap
  protected removeOnlineCharacter(characterId: Id)
  {
    let characterName = Game.entities.getItem(characterId).name;

    Game.entities.deleteItem(characterId);

    // Also remove record from the corresponding hashmap.
    delete this.myPlayerCharacterNames[characterName];
  }
}