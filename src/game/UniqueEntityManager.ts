/*
  Part of BrutusNEXT

  Abstract ancestor for managers storing game entities with unique names.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {Id} from '../shared/Id';

/*
import {IdContainer} from '../shared/IdContainer';
import {Character} from '../game/Character';
import {Mudlog} from '../server/Mudlog';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js
*/

export class UniqueEntityManager<T extends GameEntity>
{
  // ---------------- Public methods --------------------

  /// Tohle cele nepujde zabstraktnit, protoze se zrejme neda vyrobit nova
  /// instance pozadovaneho typu (coz je dost naprd...)

  // Usage example:
  //   let newId = this.createNewEntity("Bob", Character);
  // (Character is name of the class in the meaning of constructor of that
  // class).
  protected createNewEntity
  (
    name: string,
    conctructorOfT: { new (name: string): T; }
  ): Id
  {
    /// Tohle se neda checkovat na obecnem manageru, protoze ne vsechny
    /// entity maji unikatni jmena
    //ASSERT_FATAL(!this.exists(name),
    //  "Attempt to create a entity '"
    //  + name + "' who already exists");

    let newEntity = new conctructorOfT(name);
    let newEntityId = this.addNewEntity(newEntity);

    /// Tohle asi taky nebudu chtit u vsech entit
    // Save the character to the disk (so we know that the character exists).
    // (This does not need to be synchronous.)
    //newEntity.save();

    return newEntityId;
  }

  // Returns null if character is not online (or doesn't exist).
  public getEntityByName(name: string): T
  {
    // Using 'in' operator on object with null value would crash the game.
    if (!ASSERT(this.myNames !== null,
      "Invalid myPlayerCharacterNames"))
      return;

    if (name in this.myNames)
    {
      // Character is already loaded.
      let entityId = this.myNames[name];

      return this.getEntity(entityId);
    }

    return null;
  }

  // Adds entity that has been loaded from file to the list of
  // entities under it's original id (that was loaded from file).
  public registerEntity(entity: T)
  {
    //ASSERT_FATAL(!this.getCharacterByName(character.name),
    //  "Attempt to register character '"
    //  + character.name + "' that is already registered");

    this.addEntity(entity);
  }

  // Removes entity from list of entities.
  public dropEntity(entityId: Id)
  {
    let name = Game.entities.getItem(entityId).name;

    /// Tohle bude pravdepodobne spamovat pri umirani mobu a tak (nebo by
    /// aspon melo). Zatim si to tu necham.
    /// (Pokud by se to melo tykat jen playeru, tak by asi stacilo checkovat,
    /// ze character ma nenulove playerConnectionId)
    //Mudlog.log
    //(
    //  "Dropping entity " + name,
    //  Mudlog.msgType.SYSTEM_INFO,
    //  Mudlog.levels.IMMORTAL
    //);

    this.removeEntity(entityId);
  }

  public getEntity(id: Id): T
  {
    let entity = Game.entities.getItem(id);

    /// instanceof T nefunguje, takze to tady necham bez kontroly.
    /// Asi ale pujde pretizit tuhle metodu v potomcich a check udelat tam.
    //ASSERT_FATAL(entity instanceof T,
    //  "Attempt to get entity by id that doesn't point to an instance of"
    //  + "class inherited from desired type" );

    return <T>entity;
  }

  /*
  // Returns true if player character with given name exists.
  public exists(characterName: string)
  {
    // First check if character is already online so we can save reading from
    // disk.
    if (this.myNames[characterName])
      return true;

    let path = Character.SAVE_DIRECTORY + characterName + ".json";

    return fs.existsSync(path);
  }
  */

  // -------------- Protected class data ----------------

  // This hashmap maps character names to character ids.
  protected myNames: { [key: string]: Id } = {};
 
  // -------------- Protected methods -------------------

  // Adds entity to the list of online characters and to the auxiliary
  // hashmap, returns its unique id.
  protected addNewEntity(entity: T): Id
  {
    let newId = Game.entities.addNewItem(entity);

    // Also add record to the corresponding hashmap.
    this.myNames[entity.name] = newId;

    return newId;
  }

  // Adds entity that already has an id (loaded from file).
  protected addEntity(entity: T)
  {
    Game.entities.addNewItem(entity);

    // Also add record to the corresponding hashmap.
    this.myNames[entity.name] = entity.id;
  }

  // Removes entity both from the list of entities and from the
  // auxiliary hasmap.
  protected removeEntity(entityId: Id)
  {
    let name = Game.entities.getItem(entityId).name;

    Game.entities.deleteItem(entityId);

    // Also remove record from the corresponding hashmap.
    delete this.myNames[name];
  }
}