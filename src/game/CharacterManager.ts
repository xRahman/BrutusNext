/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdContainer} from '../shared/IdContainer';
import {EntityManager} from '../game/EntityManager';
import {Game} from '../game/Game';
import {Character} from '../game/characters/Character';
import {Mudlog} from '../server/Mudlog';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

export class CharacterManager extends EntityManager<Character>
{
  // ---------------- Public methods --------------------

  public createNewUniqueCharacter
  (
    name: string,
    playerConnectionId: Id,
    nameParam: { hasUniqueName: boolean }
  ): Id
  {
    ASSERT_FATAL(!this.doesNameExist(name),
      "Attempt to create a character '" + name + "'"
      + " who already exists");

    let newCharacter
      = new Character({ name: name, hasUniqueName: true });

    newCharacter.playerConnectionId = playerConnectionId;
    newCharacter.hasUniqueName = nameParam.hasUniqueName;

    let newCharacterId = this.addNewEntity(newCharacter);

    // Save the character to the disk (so we know that the character exists).
    // (This does not need to be synchronous.)
    newCharacter.save();

    return newCharacterId;
  }

  public getCharacter(id: Id): Character
  {
    let character = this.getEntity(id);

    ASSERT_FATAL(character instanceof Character,
      "Attempt to get character by id that doesn't point to an instance of"
      + "class inherited from Character");

    return character;
  }

  public doesNameExist(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.isUniquelyNamedEntityLoaded(characterName))
      return true;

    let path = Character.SAVE_DIRECTORY + "unique/" + characterName + ".json";

    return fs.existsSync(path);
  }

  // -------------- Protected class data ----------------
 
  // -------------- Protected methods -------------------

}