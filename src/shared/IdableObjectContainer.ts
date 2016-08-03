/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/

/*
  All instances of idable objects need to be held only in some
  IdableObjectsContainer. For example all game entities are held
  in Game.entities (which is IdableObjectsContainer). Everything
  else accesses idable objects only by their ids (by asking respective
  container or by using internal reference within id by calling
  id.getObject()).

  You can imagine it as a separate memory block (or database) with id's
  serving as pointers into this memory (or database).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {NamedClass} from '../shared/NamedClass';
import {IdableObject} from '../shared/IdableObject';
import {Id} from '../shared/Id';
import {IdProvider} from '../shared/IdProvider';
import {Server} from '../server/Server';

export class IdableObjectContainer<T extends IdableObject>
{
  // ---------------- Public methods --------------------

  // Inserts a new item to the itemContainer, returns its unique id.
  public addItemUnderNewId<U extends Id>
  (
    // Item to be added.
    item: T,
    // What type of id should be created.
    // (Constructor of class extended from Id.)
    idClass: { new (...args: any[]): U }
  )
  : U
  {
    this.commonAddItemChecks(item);

    ASSERT_FATAL(item.getId() === null,
      "Attempt to add item which already has an id under new id");

    let newId = Server.idProvider.generateId(item, idClass);

    this.itemNotYetExistsCheck(newId);

    // Here we are creating a new property in this.itemContainer
    // (it is possible because this.itemContainer is a hashmap)
    this.itemContainer[newId.getStringId()] = item;
    
    // Item remembers it's own id.
    item.setId(newId);

    return newId;
  }

  // Inserts item under an existing id (which needs to be set as item.id).
  public addItemUnderExistingId(item: T)
  {
    this.commonAddItemChecks(item);

    let id = item.getId();

    ASSERT_FATAL(typeof id !== 'undefined',
      "Attempt to add item to the itemContainer with missing id");

    ASSERT_FATAL(id !== null,
      "Attempt to add item to the itemContainer with invalid id");

    ASSERT_FATAL(item.className === id.getType(),
      "Attempt to add item to the itemContainer that is of"
      + " class '" + item.className + "'"
      + " under an id that is of type '" + id.getType() + "'");

    this.itemNotYetExistsCheck(id);

    // Here we are creating a new property in this.itemContainer.
    // (it is possible because this.itemContainer is a hashmap)
    this.itemContainer[id.getStringId()] = item;
  }

  public getItem(id: Id): T
  {
    ASSERT_FATAL(id != null, "Trying to get item using invalid id");

    let item = this.itemContainer[id.getStringId()];

    ASSERT_FATAL(typeof item !== 'undefined',
      "Item (" + id.getStringId() + ") no longer exists in the itemContainer");

    return item;
  }

  // Check if item with give id exists in the itemContainer.
  public exists(id: Id): boolean
  {
    ASSERT_FATAL(id !== null, "Trying to get item using invalid id");

    let item = this.itemContainer[id.getStringId()];

    if (typeof item !== 'undefined')
      return true;
    else
      return false;
  }

  public removeItem(id: Id)
  {
    ASSERT_FATAL(id !== null, "Invalid id");

    if (!ASSERT(id.getStringId() in this.itemContainer,
        "Attempt to delete item (" + id.getStringId() + ")"
        + " that doesn't exist in the itemContainer"))
      return;

    // Set internal reference to identified object to null.
    // (id object will still exist after referenced object is removed,
    // it just won't be valid anymore).
    id.invalidate();

    // Delete the property that traslates to the descriptor.
    delete this.itemContainer[id.getStringId()];
  }

  // -------------- Protected class data ----------------

  // This hash map allows to access items using unique ids.
  protected itemContainer: { [key: string]: T } = {};

  // -------------- Protected methods -------------------

  // --------------- Private methods -------------------

  private itemNotYetExistsCheck(id: Id)
  {
    let stringId = id.getStringId();

    // Item with this id must not already exist.
    //   This should never happen, because ids are issued sequentionaly within
    // a single boot and each id contains boot timestamp in it. So the only way
    // two id's could be identical is to launch two instances of the server
    // in exactly the same milisecond.
    //   It means that if this happened, you have probably duplicated some
    // objects somewhere.
    ASSERT_FATAL(!(stringId in this.itemContainer),
      "Attempt to add item with id (" + stringId + ") that already"
      + " exists in the itemContainer");
  }

  private commonAddItemChecks(item: T)
  {
    ASSERT_FATAL(item !== null && item !== undefined,
      "Attempt to add 'null' or 'undefined' item to the itemContainer");

    ASSERT_FATAL(NamedClass.CLASS_NAME_PROPERTY in item,
      "Attempt to add item to the itemContainer that is not inherited from"
      + " NamedClass");

    ASSERT_FATAL(IdableObject.ID_PROPERTY in item,
      "Attempt to add item to the itemContainer that is not inherited from"
      + " IdableSaveableObject");
  }
}