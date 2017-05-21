/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
///import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
import {Entity} from '../../../shared/lib/entity/Entity';
///import {Entities} from '../../../shared/lib/entity/Entities';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {AbbrevList} from '../../../server/game/search/AbbrevList';
///import {ServerApp} from '../../../server/lib/app/ServerApp';
import {Connection} from '../../../server/lib/connection/Connection';
import {Game} from '../../../server/game/Game';
import {Character} from '../../../server/game/character/Character';
import {NameList} from '../../../shared/lib/entity/NameList';

export class Characters
{
  //------------------ Private data ---------------------

  // List of characters with unique names that are loaded in the memory.
  private names = new NameList<Character>(Entity.NameCathegory.CHARACTER);

  // Abbrevs of all online characters including those without unique names.
  private abbrevs = new AbbrevList();

  // ---------------- Public methods --------------------

  public async createUniqueCharacter
  (
    name: string,
    connection: Connection
  )
  : Promise<Character>
  {
    let character = await ServerEntities.createInstance
    (
      Character,
      Character.name,
      name,
      Entity.NameCathegory.CHARACTER
    );

    // Check if character has been created succesfully.
    // (it might not be true for example if unique name was already taken)
    if (character === null)
      return null;

    character.atachConnection(connection);
    
    this.add(character);

    // Save the character to the disk.
    await ServerEntities.save(character);

    return character;
  }

  // -> Returns character loaded from disk.
  //    Returns null if character 'name' doesn't exist or couldn't be loaded.
  public async loadCharacter(name: string)
  {
    let character = await super.loadNamedEntity
    (
      name,
      NamedEntity.NameCathegory.characters
    );

    return character;
  }

  // -> Returns undefined if character isn't loaded or doesn't exist.
  public getCharacterByName(name: string): Character
  {
    return this.getEntityByName(name);
  }

  public async exists(name: string)
  {
    // First check if character is already online so we can
    // save reading from disk.
    if (this.hasUniqueEntity(name))
    {
      /// DEBUG:
      console.log("this.hasUniqueEntity returned true");

      return true;
    }

    return await NamedEntity.isNameTaken
    (
      name,
      NamedEntity.NameCathegory.characters
    );
  }

  //----------------- Protected data --------------------
 
  // -------------- Protected methods -------------------

}