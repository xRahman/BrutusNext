/*
  Part of BrutusNEXT

  Adds functionality to all game entities enabling them to contain
  list of ids of other game entities. This is used e. g. for world
  to contain zones, for sectors (or zones) to contain rooms, for
  rooms to contain items and characters, for container objects to
  contain other items, for characters who have inventory to contain
  items.

  When entity containing ids of other entities is loaded or saved,
  it also loads/saves all entities identified by these ids (to ensure
  that we don't e. g. load container but not it's contents).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
///import {Entity} from '../shared/Entity';
import {EntityList} from '../shared/EntityList';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
///import {EntityId} from '../shared/EntityId';
import {CommandInterpretter} from '../game/commands/CommandInterpretter';

export abstract class ContainerEntity extends CommandInterpretter
{

  // ---------------- Public class data -----------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // When saving an entity, all referenced entities are saved as well.
  // (This way when you save world, everything in it will get saved)
  public async save()
  {
    /// Tady by spravne melo byt super.save(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super uvnitr chainu asyc funkci.
    await this.saveToFile(this.getSaveDirectory(), this.getSaveFileName());

    await this.contents.save(this.getErrorIdString());
  }

  // When loading an entity, all referenced entities are loaded as well.
  // This is to prevent situation when you e. g. load a conainer but
  // it's contents is not available in the world.
  public async load()
  {
    /// Tady by spravne melo byt super.load(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super uvnitr chainu asyc funkci.
    // This needs to be done before loading contained entities, because we
    // need to read their id's first.
    await this.loadFromFile(this.getFullSavePath());

    await this.contents.load(this.getErrorIdString());
  }

  // -------------- Protected class data ----------------

  // Every game entity can contain other game entities.
  // (Rooms contain characters and objects, bags contain other objects,
  //  sectors contain rooms, etc.)
  protected contents = new EntityList();

  // --------------- Protected methods ------------------

  // Adds entity to contents of this entity.
  protected insertEntity(entity: GameEntity)
  {
    this.contents.add(entity);

    entity.setLocation(this);
  }

  // Removes entity if from contents of this entity.
  public removeEntity(entity: GameEntity)
  {
    this.contents.remove(entity);
  }
}