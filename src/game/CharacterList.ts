/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {EntityId} from '../shared/EntityId';
import {FileSystem} from '../shared/fs/FileSystem';
import {AbbrevSearchList} from '../game/AbbrevSearchList';
import {Server} from '../server/Server';
import {Game} from '../game/Game';
import {Character} from '../game/characters/Character';

export class CharacterList extends AbbrevSearchList
{
  // ---------------- Public methods --------------------

  public createUniqueCharacter
  (
    name: string,
    playerConnectionId: EntityId
  )
  : EntityId
  {
    if (!ASSERT(!this.exists(name),
      "Attempt to create character '" + name + "' who already exists."
      + " Character is not created"))
      return null;

    let character = new Character();

    character.name = name;
    character.isNameUnique = true;
    character.atachPlayerConnection(playerConnectionId);

    let id = Server.entities.addUnderNewId(character);

    // Save the character to the disk.
    // (We don't need to wait for save to finish so we don't need
    //  async/await here).
    character.save();

    return id;
  }

  public getPlayerCharacter(characterName: string): Character
  {
    let id = this.getIdByName(characterName);

    return id.getEntity({ typeCast: Character });
  }

  public exists(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.hasUniqueEntity(characterName))
      return true;

    let path = Character.SAVE_DIRECTORY + "unique/" + characterName + ".json";

    return FileSystem.existsSync(path);
  }

  // -------------- Protected class data ----------------
 
  // -------------- Protected methods -------------------

}