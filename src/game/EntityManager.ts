/*
  Part of BrutusNEXT

  Abstract ancestor for managers storing game entities.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {Id} from '../shared/Id';
import {AbbrevSearchList} from '../shared/AbbrevSearchList';

export abstract class EntityManager<T extends GameEntity>
{
  // ---------------- Public methods --------------------

  // Returns null if entity isn't loaded (or doesn't exist).
  // Only checks entities with unique names.
  public getUniqueEntityByName(name: string): T
  {
    if (name in this.myUniqueNames)
    {
      // Entity is already loaded.
      let entityId = this.myUniqueNames[name];

      return this.getEntity(entityId);
    }

    return null;
  }

  // Adds entity that has been loaded from file to the list of
  // entities under it's original id (that was loaded from file).
  public registerEntity(entity: T)
  {
    ASSERT_FATAL(!this.getUniqueEntityByName(entity.name),
      "Attempt to register entity '"
      + entity.name + "' that is already registered");

    this.addEntity(entity);
  }

  // Removes entity both from the list of entities and from the
  // auxiliary hasmap.
  public dropEntity(entityId: Id)
  {
    let entity = Game.entities.getItem(entityId);

    Game.entities.deleteItem(entityId);

    if (entity.hasUniqueName)
    {
      // Also remove record to the corresponding hashmap storing uniquely named
      // entities.
      delete this.myUniqueNames[entity.name];
    }
    /// else
    /// {
      /// TODO:
      /// Nekde by se mely drzet taky jmena neunikatnich entit, aby je podle
      /// toho bylo mozne targetit.
    ///}
  }

  public getEntity(id: Id): T
  {
    let entity = Game.entities.getItem(id);

    return <T>entity;
  }

  public isUniquelyNamedEntityLoaded(name: string): boolean
  {
    if (this.myUniqueNames[name])
      return true;

    return false;
  }

  // -------------- Protected class data ----------------

  // This hashmap maps character names to character ids.
  protected myUniqueNames: { [key: string]: Id } = {};

  protected myAbbrevSearchList = new AbbrevSearchList();
 
  // -------------- Protected methods -------------------

  // Adds entity to the list of online characters and to the auxiliary
  // hashmap, returns its unique id.
  protected addNewEntity(entity: T): Id
  {
    let newId = Game.entities.addNewItem(entity);

    this.addEntity(entity);

    return newId;
  }

  // Adds entity that already has an id (loaded from file).
  protected addEntity(entity: T)
  {
    Game.entities.addNewItem(entity);

    if (entity.hasUniqueName)
    {
      // Also add record to the corresponding hashmap storing uniquely named
      // entities.
      this.myUniqueNames[entity.name] = entity.id;
    }
    /// else
    /// {
      /// TODO:
      /// Nekde by se mely drzet taky jmena neunikatnich entit, aby je podle toho
      /// bylo mozne targetit.
    ///}
  }
}