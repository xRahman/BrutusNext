/*
  Part of BrutusNEXT

  Enables entity to contain list of other entities and to be put
  into a container entity. This is used for example for world to
  contain areas, for areas to contain rooms, for rooms to contain
  items and characters, for containers to contain other items or
  for characters who have inventory to contain items.

  When entity containing other entities is loaded or saved, it also
  loads/saves all entities in contains (to ensure that we don't load
  a container but not it's contents).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {ServerEntity} from '../../../server/lib/entity/ServerEntity';
import {EntityList} from '../../../shared/lib/entity/EntityList';

export class ContainerEntity extends ServerEntity
{
  // ----------------- Public data ----------------------

  // ---------------- Protected data --------------------

  // Every game entity can contain other game entities.
  // (Rooms contain characters and objects, bags contain other objects,
  //  sectors contain rooms, etc.)
  protected contents = new EntityList();

  // ContainerEntity this entity is contained in.
  // (Rooms are contained in Areas, characters may be in rooms or object,
  //  objects may be in room or object, etc.)
  protected location: ContainerEntity = null;

  // ----------------- Private data ---------------------


  // --------------- Public accessors -------------------

  // Note: There is no 'setLocation()'. Localtion is automatically
  //   set when insert() is called.
  public getLocation() { return this.location; }

  // ---------------- Public methods --------------------

  // ~ Overrides Entity.postSave()
  // When saving a a container entity, all contained
  //  entities are saved as well.
  public async postSave()
  {
    ///await this.contents.save(this.getErrorIdString());
    await this.contents.save();
  }

  // If 'loadContents' is true, load all entities referenced in
  // this.contentns. This is used to prevent situation when you
  // e. g. load a conainer but it's contents is not available in
  // the world.
  public async postLoad(loadContents = true)
  {
    if (loadContents)
      await this.contents.load(this.getErrorIdString());
  }

  // --------------- Protected methods ------------------

  // Inserts 'entity' to contents of this entity.
  // Also removes it from it's previous location.
  public insert(entity: ContainerEntity)
  {
    if (entity === null || entity === undefined)
    {
      ERROR("Attempt to insert invalid entity to"
        + " contents of " + this.getErrorIdString()
        + " Entity is not inserted.");
      return;
    }

    if (!entity.isValid())
    {
      ERROR("Attempt to insert invalid entity"
        + " " + entity.getErrorIdString() + " to"
        + " contents of " + this.getErrorIdString()
        + " Entity is not inserted.");
      return;
    }

    let oldLocation = entity.location;

    // Remove entity from previous location.
    if (oldLocation !== null)
      oldLocation.removeEntity(entity);

    // Add it to the new one.
    this.contents.add(entity);
    entity.location = this;
  }

  // -------------- Private methods -------------------

  // Removes entity from contents of this entity
  // (removeEntity() is private because entities should never
  //  be located at "nowhere". Use insert() to move the
  //  entity to the new location - it will ensure that
  //  entity is always located somewhere).
  private removeEntity(entity: ContainerEntity)
  {
    this.contents.remove(entity);
    entity.location = null;
  }
}