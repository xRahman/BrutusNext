/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FileSystem} from '../../shared/fs/FileSystem';
import {AbbrevSearchList} from '../../game/AbbrevSearchList';
import {Server} from '../../server/Server';
import {Connection} from '../../server/connection/Connection';
import {Game} from '../../game/Game';
import {Character} from '../../game/character/Character';

export class CharacterList extends AbbrevSearchList
{
  // ---------------- Public methods --------------------

  public createUniqueCharacter
  (
    name: string,
    connection: Connection
  )
  : Character
  {
    if (this.exists(name))
    {
      ERROR("Attempt to create character '" + name + "'"
        + " that already exists. Character is not created");
      return null;
    }

    let character = Server.entityManager.createNamedEntity
    (
      name,
      'Character',
      Character
    );

    /*
    let character = new Character();

    character.name = name;
    */
    character.isNameUnique = true;
    character.atachConnection(connection);

    /*
    let id = Server.idProvider.createId(character);
    */

    // Save the character to the disk.
    // (We don't need to wait for save to finish so we don't need
    //  async/await here).
    character.save();

    return character;
  }

  // -> Returns undefined if character isn't loaded or doesn't exist.
  public getPlayerCharacter(characterName: string): Character
  {
    return this.getEntityByName(characterName);
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