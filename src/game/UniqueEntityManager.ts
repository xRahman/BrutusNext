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

export abstract class UniqueEntityManager<T extends GameEntity>
{
  // ---------------- Public methods --------------------

  // Returns null if entity isn't loaded (or doesn't exist).
  public getEntityByName(name: string): T
  {
    if (name in this.myNames)
    {
      // Entity is already loaded.
      let entityId = this.myNames[name];

      return this.getEntity(entityId);
    }

    return null;
  }

  // Adds entity that has been loaded from file to the list of
  // entities under it's original id (that was loaded from file).
  public registerEntity(entity: T)
  {
    ASSERT_FATAL(!this.getEntityByName(entity.name),
      "Attempt to register entity '"
      + entity.name + "' that is already registered");

    this.addEntity(entity);
  }

  // Removes entity both from the list of entities and from the
  // auxiliary hasmap.
  public dropEntity(entityId: Id)
  {
    let name = Game.entities.getItem(entityId).name;

    Game.entities.deleteItem(entityId);

    // Also remove record from the corresponding hashmap.
    delete this.myNames[name];
  }

  public getEntity(id: Id): T
  {
    let entity = Game.entities.getItem(id);

    return <T>entity;
  }

  public isOnline(name: string): boolean
  {
    if (this.myNames[name])
      return true;

    return false;
  }

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
}