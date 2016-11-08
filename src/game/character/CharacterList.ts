/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FileSystem} from '../../shared/fs/FileSystem';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {Entity} from '../../shared/entity/Entity';
import {EntityManager} from '../../shared/entity/EntityManager';
import {AbbrevSearchList} from '../../game/AbbrevSearchList';
import {Server} from '../../server/Server';
import {Connection} from '../../server/connection/Connection';
import {Game} from '../../game/Game';
import {Character} from '../../game/character/Character';

export class CharacterList extends AbbrevSearchList
{
  // ---------------- Public methods --------------------

  public async createUniqueCharacter
  (
    name: string,
    connection: Connection
  )
  : Promise<Character>
  {
    /*
    if (await this.exists(name))
    {
      ERROR("Attempt to create character '" + name + "'"
        + " that already exists. Character is not created");
      return null;
    }
    */

    let character = await Server.entityManager.createNamedEntity
    (
      name,
      NamedEntity.NameCathegory.characters,
      'Character',
      Character
    );

    // Check if character has been created succesfully.
    // (it might not be true for example if unique name was already taken)
    if (character === null)
      return null;

    /*
    let character = new Character();

    character.name = name;
    */
    
    /// Tohle už dělá EntityManager.createNamedEntity().
    ///character.isNameUnique = true;

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

  // -> Returns character loaded from disk.
  //    Returns null if character 'name' doesn't exist or couldn't be loaded.
  public async loadCharacter(name: string)
  {
    // First check if character is already loaded. 
    let character = this.getCharacterByName(name);

    // If it is already loaded, there is no point in loading it again.
    if (character !== undefined)
    {
      ERROR("Attempt to load character '" + character + "'"
        + " which already exists. Returning existing character");
      return character;
    }

    // Second parameter of loadNamedEntity is used for dynamic type cast.
    character = await EntityManager.loadNamedEntity
    (
      name,
      NamedEntity.NameCathegory.characters,
      Character
    );

    if (!Entity.isValid(character))
    {
      ERROR("Failed to load character " + name);
      return null;
    }

    if (name !== character.getName())
    {
      /// Přejmenovat entitu s unikátním jménem není tak jednoduché,
      /// šaškuje se při tom s name lock filama. Asi bude nejjednodušší
      /// prostě to jen nareportovat jako error
      /*
      ERROR("Character name saved in file (" + character.getName() + ")"
        + " doesn't match character file name (" + name + ")."
        + " Renaming character to match file name");
    
      character.name = name;
      */

      ERROR("Character name saved in file (" + character.getName() + ")"
        + " doesn't match character file name (" + name + ")"
        + " Character is not loaded");
        return null;
    }

    this.add(character);

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