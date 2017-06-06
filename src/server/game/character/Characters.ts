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

  // ------------- Public static methods ---------------- 

  // -> Returns 'true' on success.
  public static add(character: Character)
  {
    return Game.getCharacters().names.add(character);
  }

  // -> Returns 'undefined' if entity 'name' isn't in the list.
  public static get(name: string)
  {
    return Game.getCharacters().names.get(name);
  }

  // Removes character from Characters, but not from memory.
  // -> Returns 'true' on success.
  public static remove(character: Character)
  {
    return Game.getCharacters().names.remove(character);
  }

  public static async isTaken(name: string)
  {
    let characters = Game.getCharacters();

    // First check if account is already online so we can save ourselves
    // reading from disk.
    if (characters.names.has(name))
      return true;

    return await ServerEntities.isNameTaken
    (
      name,
      Entity.NameCathegory.CHARACTER
    );
  }

  // ---------------- Public methods --------------------

  /// Merged with Account.createCharacter().
  /*
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
  */

  /// Merged with MenuProcessor.loadCharacter().
  /*
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
  */

  //----------------- Protected data --------------------
 
  // -------------- Protected methods -------------------

}