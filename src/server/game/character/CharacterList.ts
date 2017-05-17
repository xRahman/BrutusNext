/*
  Part of BrutusNEXT

  Container managing all characters.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
///import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {AbbrevSearchList} from '../../../server/game/search/AbbrevSearchList';
import {ServerApp} from '../../../server/lib/Server';
import {Connection} from '../../../server/lib/connection/Connection';
import {Game} from '../../../server/game/Game';
import {Character} from '../../../server/game/character/Character';

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

    let character = await ServerApp.entityManager.createUniqueEntity
    (
      name,
      Character,
      NamedEntity.NameCathegory.characters,
    );

    // Check if character has been created succesfully.
    // (it might not be true for example if unique name was already taken)
    if (character === null)
      return null;

    /*
    let character = new Character();

    character.name = name;
    */
    
    /// Tohle už dělá Entities.createNamedEntity().
    ///character.isNameUnique = true;

    character.atachConnection(connection);

    /*
    let id = Server.idProvider.createId(character);
    */

    this.add(character);

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
    let character = await super.loadNamedEntity
    (
      name,
      NamedEntity.NameCathegory.characters
    );

    return character;

    /*
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
    character = await Entities.loadNamedEntity
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
      ///
      ///ERROR("Character name saved in file (" + character.getName() + ")"
      ///  + " doesn't match character file name (" + name + ")."
      ///  + " Renaming character to match file name");
      ///
      ///character.name = name;

      ERROR("Character name saved in file (" + character.getName() + ")"
        + " doesn't match character file name (" + name + ")"
        + " Character is not loaded");
        return null;
    }

    this.add(character);
    */
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