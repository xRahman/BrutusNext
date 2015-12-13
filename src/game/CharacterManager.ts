/*
  Part of BrutusNEXT

  Implements container for all characters (both player and non-player).
*/

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdContainer} from '../shared/IdContainer';
import {Character} from '../game/Character';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

export class CharacterManager extends IdContainer<Character>
{
  // ---------------- Public methods --------------------

  public createNewCharacter(characterName: string): Id
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

  public getCharacter(id: Id)
  {
    return this.getItem(id);
  }

  // Returns true if character with given name exists.
  public exists(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.myOnlineCharacterNames[characterName])
      return true;

    let path = Character.SAVE_DIRECTORY + characterName + ".json";

    return fs.existsSync(path);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps character names to character ids.
  protected myOnlineCharacterNames: { [key: string]: Id } = {};
 
  // -------------- Protected methods -------------------

  // Adds character to the list of online characters and to the auxiliary
  // hashmap, returns its unique id.
  protected addOnlineCharacter(character: Character): Id
  {
    let newId = super.addItem(character);

    // Also add record to the corresponding hashmap.
    this.myOnlineCharacterNames[character.name] = newId;

    return newId;
  }

  // Removes a character both from the list of online characters and from the
  // auxiliary hasmap
  protected removeOnlineCharacter(characterId: Id)
  {
    let characterName = this.getCharacter(characterId).name;

    super.deleteItem(characterId);

    // Also remove record from the corresponding hashmap.
    delete this.myOnlineCharacterNames[characterName];
  }
}