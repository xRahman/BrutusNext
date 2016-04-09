/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdList} from '../game/IdList';
import {Game} from '../game/Game';
import {Character} from '../game/characters/Character';
import {Mudlog} from '../server/Mudlog';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

export class PlayerCharacterManager
{
  constructor(private characterList: IdList) { }

  // ---------------- Public methods --------------------

  public createNewUniqueCharacter
  (
    name: string,
    playerConnectionId: Id
  ): Id
  {
    ASSERT_FATAL(!this.doesNameExist(name),
      "Attempt to create a character '" + name + "'"
      + " who already exists");

    let newCharacter = new Character();

    newCharacter.name = name;
    newCharacter.isNameUnique = true;
    newCharacter.setPlayerConnectionId(playerConnectionId);

    let newCharacterId =
      this.characterList.addEntityUnderNewId(newCharacter);

    // Save the character to the disk (so we know that the character exists).
    // (This does not need to be synchronous.)
    newCharacter.save();

    return newCharacterId;
  }

  public addPlayerCharacterUnderExistingId(character: Character)
  {
    this.characterList.addEntityUnderExistingId(character);
  }

  public getPlayerCharacter(characterName: string): Character
  {
    let character = this.characterList.getUniqueEntityByName(characterName);

    if (character !== null)
    {
      ASSERT(character instanceof Character,
        "Requested entity '" + characterName + "' is not a Character");
    }

    return <Character>character;
  }

  /*
  /// TODO: Tohle zjevne neni potreba. Pokud to tak zustane, smazat
  public getCharacter(id: Id): Character
  {
    let character = Game.entities.getItem(id);

    ASSERT_FATAL(character instanceof Character,
      "Attempt to get character by id that doesn't reference an instance of"
      + " Character class");

    ASSERT_FATAL(id.className === 'Character',
      "Attempt to get character by id that doesn't reference an instance of"
      + " Character class");

    return <Character>character;
  }
  */

  public doesNameExist(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.characterList.hasUniqueEntity(characterName))
      return true;

    let path = Character.SAVE_DIRECTORY + "unique/" + characterName + ".json";

    return fs.existsSync(path);
  }

  // -------------- Protected class data ----------------
 
  // -------------- Protected methods -------------------

}