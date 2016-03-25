/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/

/*
  All instances of idable objects need to be held only in some
  IdableObjectsContainer. For example all game entities are held
  in Game.entities (which is IdableObjectsContainer). Everything
  else accesses idable objects only by their ids (by asking respecktive
  container).

  You can imagine it as a separate memory block (or database) with id's
  serving as pointers into this memory (or database).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';
import {IdableSaveableObject} from '../shared/IdableSaveableObject';
import {Id} from '../shared/Id';
import {IdProvider} from '../shared/IdProvider';
import {Server} from '../server/Server';

export class IdableObjectContainer<T extends IdableSaveableObject>
{
  // ---------------- Public methods --------------------

  // Inserts a new item to the container, returns its unique id.
  public addItemUnderNewId(item: T): Id
  {
    this.commonAddItemChecks(item);

    let newId = Server.idProvider
      .generateId(this.typeOfId, item[NamedClass.CLASS_NAME_PROPERTY]);

    this.itemNotYetExistsCheck(item, newId);

    // Here we are creating a new property in this.container
    // (it is possible because this.container is a hashmap)
    this.container[newId.getStringId()] = item;
    
    // Item remembers it's own id.
    item[IdableSaveableObject.ID_PROPERTY] = newId;

    return newId;
  }

  // Inserts item under an existing id (which needs to be set as item.id).
  public addItemUnderExistingId(item: T)
  {
    this.commonAddItemChecks(item);

    let id = item[IdableSaveableObject.ID_PROPERTY];

    ASSERT_FATAL(item[NamedClass.CLASS_NAME_PROPERTY] === id.type,
      "Attempt to add item to the container that is of"
      + " class '" + item[NamedClass.CLASS_NAME_PROPERTY] + "'"
      + " under an id that is of type '" + id.type + "'");

    this.itemNotYetExistsCheck(item, id);

    // Here we are creating a new property in this.container.
    // (it is possible because this.container is a hashmap)
    this.container[id.getStringId()] = item;
  }

  public getItem(id: Id): T
  {
    ASSERT_FATAL(id && id.notNull(), "Trying to get item using invalid id");

    let item = this.container[id.getStringId()];

    ASSERT_FATAL(typeof item !== 'undefined',
      "Item (" + id.getStringId() + ") no longer exists in the container");

    return item;
  }

  // Check if item with give id exists in the container.
  public exists(id: Id): boolean
  {
    ASSERT_FATAL(id && id.notNull(), "Trying to get item using invalid id");

    let item = this.container[id.getStringId()];

    if (typeof item !== 'undefined')
      return true;
    else
      return false;
  }

  public deleteItem(id: Id)
  {
    ASSERT_FATAL(id && id.notNull(), "Invalid id");

    if (!ASSERT(id.getStringId() in this.container,
      "Attempt to delete item (" + id.getStringId() + ")"
      + " that doesn't exist in the container"))
    {
      return;
    }

    // Delete the property that traslates to the descriptor.
    delete this.container[id.getStringId()];
  }

  // -------------- Protected class data ----------------

  // This hash map allows to access items using unique sids.
  protected container: { [key: string]: T } = {};

  // className of item this id points to.
  protected typeOfId = "";

  // -------------- Protected methods -------------------

  // --------------- Private methods -------------------

  private itemNotYetExistsCheck(item: T, id: Id)
  {
    // Item with this id must not already exist.
    //   This is a very serious error. It most probably means that
    // lastIssuedId of IdProvider has not been saved correctly and it was
    // issuing the same ids again (= not unique ones). The only way to fix
    // this correcyly is to go through all saved files, find out the largest
    // id saved in them and set lastIssuedId in file
    // ./data/LastIssuedId.json to it. (Or you might just increse
    // it by some large number and hope that you skip all already issued ids.)
    //   Much safer way is to rollback to the last backup that worked.
    ASSERT_FATAL(!(id.getStringId() in this.container),
      "Attempt to add item with id (" + id.getStringId() + ") that already"
      + " exists in the container");
  }

  private commonAddItemChecks(item: T)
  {
    ASSERT_FATAL(item !== null && item !== undefined,
      "Attempt to add 'null' or 'undefined' item to the container");

    ASSERT_FATAL(NamedClass.CLASS_NAME_PROPERTY in item,
      "Attempt to add item to the container that is not inherited from"
      + " NamedClass");

    ASSERT_FATAL(IdableSaveableObject.ID_PROPERTY in item,
      "Attempt to add item to the container that is not inherited from"
      + " IdableSaveableObject");

    ASSERT_FATAL(item[IdableSaveableObject.ID_PROPERTY] !== null,
      "Attempt to add item to the container with invalid id");
  }
}