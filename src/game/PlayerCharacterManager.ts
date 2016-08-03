/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Id} from '../shared/Id';
import {FileSystem} from '../shared/fs/FileSystem';
import {EntityIdList} from '../game/EntityIdList';
import {Game} from '../game/Game';
import {Character} from '../game/characters/Character';

export class PlayerCharacterManager
{
  constructor(private characterList: EntityIdList) { }

  // ---------------- Public methods --------------------

  public createUniqueCharacter
  (
    name: string,
    playerConnectionId: Id
  )
  : Id
  {
    if (!ASSERT(!this.exists(name),
      "Attempt to create character '" + name + "' who already exists."
      + " Character is not created"))
      return null;

    let newCharacter = new Character();

    newCharacter.name = name;
    newCharacter.isNameUnique = true;
    newCharacter.atachPlayerConnection(playerConnectionId);

    let newCharacterId =
      this.characterList.addEntityUnderNewId(newCharacter);

    // Save the character to the disk.
    // (We don't need to wait for save to finish so we don't need
    //  async/await here).
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

  public exists(characterName: string)
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