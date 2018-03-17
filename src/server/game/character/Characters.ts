/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {AbbrevList} from '../../../server/game/search/AbbrevList';
import {Connection} from '../../../server/lib/connection/Connection';
import {Game} from '../../../server/game/Game';
import {Character} from '../../../server/game/character/Character';
import {NameList} from '../../../shared/lib/entity/NameList';

export class Characters
{
  // ----------------- Private data ---------------------

  // List of characters with unique names that are loaded in the memory.
  private names = new NameList<Character>(Entity.NameCathegory.CHARACTER);

  // Abbrevs of all online characters including those without unique names.
  private abbrevs = new AbbrevList();

  // ------------- Public static methods ---------------- 

  // -> Returns 'true' on success.
  public static add(character: Character)
  {
    return Game.characters.names.add(character);
  }

  // # Throws an exception on error.
  public static get(characterId: string): Character
  {
    let character = ServerEntities.get(characterId);

    if (!character || !character.isValid())
      throw new Error("Attempt to get an invalid character");

    return character.dynamicCast(Character);
  }

  // -> Returns 'undefined' if entity 'name' isn't in the list.
  public static find(name: string)
  {
    return Game.characters.names.get(name);
  }

  // Removes character from Characters, but not from memory.
  // -> Returns 'true' on success.
  public static remove(character: Character)
  {
    return Game.characters.names.remove(character);
  }

  public static async isTaken(name: string)
  {
    // First check if character is already online.
    if (Game.characters.names.has(name))
      return true;

    return await ServerEntities.isEntityNameTaken
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

  // ---------------- Protected data --------------------
 
  // -------------- Protected methods -------------------

}