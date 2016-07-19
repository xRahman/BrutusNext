/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {FileSystem} from '../shared/fs/FileSystem';
import {IdList} from '../game/IdList';
import {Game} from '../game/Game';
import {Character} from '../game/characters/Character';
import {Mudlog} from '../server/Mudlog';

export class PlayerCharacterManager
{
  constructor(private characterList: IdList) { }

  // ---------------- Public methods --------------------

  public createUniqueCharacter
  (
    name: string,
    playerConnectionId: Id
  )
  : Id
  {
    ASSERT_FATAL(!this.doesNameExist(name),
      "Attempt to create a character '" + name + "'"
      + " who already exists");

    let newCharacter = new Character();

    newCharacter.name = name;
    newCharacter.isNameUnique = true;
    newCharacter.atachPlayerConnection(playerConnectionId);

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

  public doesNameExist(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.characterList.hasUniqueEntity(characterName))
      return true;

    let path = Character.SAVE_DIRECTORY + "unique/" + characterName + ".json";

    return FileSystem.existsSync(path);
  }

  // -------------- Protected class data ----------------
 
  // -------------- Protected methods -------------------

}