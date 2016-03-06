/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';
import {IdableSaveableContainer} from '../shared/IdableSaveableContainer';
import {Id} from '../shared/Id';
import {IdProvider} from '../shared/IdProvider';
import {Server} from '../server/Server';

export class IdContainer<T extends IdableSaveableContainer>
{

  // ---------------- Public methods --------------------

  // Inserts a new item to the container, returns its unique id.
  public addNewItem(item: T): Id
  {
    this.commonAddItemChecks(item);

    let newId = Server.idProvider
      .generateId(this.myTypeOfId, item[NamedClass.CLASS_NAME_PROPERTY]);

    this.itemNotYetExistsCheck(item, newId);

    // Here we are creating a new property in myContainer
    // (it is possible because myContainer is a hashmap)
    this.myContainer[newId.stringId] = item;
    
    // Item remembers it's own id.
    item[IdableSaveableContainer.ID_PROPERTY] = newId;

    return newId;
  }

  // Inserts item under an existing id (which needs to be set as item.id).
  public addItem(item: T)
  {
    this.commonAddItemChecks(item);

    let id = item[IdableSaveableContainer.ID_PROPERTY];

    ASSERT_FATAL(item[NamedClass.CLASS_NAME_PROPERTY] === id.type,
      "Attempt to add item to the container that is of"
      + " class '" + item[NamedClass.CLASS_NAME_PROPERTY] + "'"
      + " under an id that is of type '" + id.type + "'");

    this.itemNotYetExistsCheck(item, id);

    // Here we are creating a new property in myContainer.
    // (it is possible because myContainer is a hashmap)
    this.myContainer[id.stringId] = item;
  }

  public getItem(id: Id): T
  {
    ASSERT_FATAL(id && id.notNull(), "Trying to get item using invalid id");

    let item = this.myContainer[id.stringId];

    ASSERT_FATAL(typeof item !== 'undefined',
      "Item (" + id.stringId + ") no longer exists in the container");

    return item;
  }

  public deleteItem(id: Id)
  {
    ASSERT_FATAL(id && id.notNull(), "Invalid id");

    if (!ASSERT(id.stringId in this.myContainer,
      "Attempt to delete item (" + id.stringId + ")"
      + " that doesn't exist in the container"))
    {
      return;
    }

    // Delete the property that traslates to the descriptor.
    delete this.myContainer[id.stringId];
  }

  // -------------- Protected class data ----------------

  // This hash map allows to access items using unique sids.
  protected myContainer: { [key: string]: T } = {};

  // className of item this id points to.
  protected myTypeOfId = "";

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
    // ./data/instances / LastIssuedId.json to it. (Or you might just increse
    // it by some large number and hope that you skip all already issued ids.)
    //   Much safer way is to rollback to the last backup that worked.
    ASSERT_FATAL(!(id.stringId in this.myContainer),
      "Attempt to add item with id (" + id.stringId + ") that already"
      + " exists in the container");
  }

  private commonAddItemChecks(item: T)
  {
    ASSERT_FATAL(item !== null && item !== undefined,
      "Attempt to add 'null' or 'undefined' item to the container");

    ASSERT_FATAL(NamedClass.CLASS_NAME_PROPERTY in item,
      "Attempt to add item to the container that is not inherited from"
      + " NamedClass");

    ASSERT_FATAL(IdableSaveableContainer.ID_PROPERTY in item,
      "Attempt to add item to the container that is not inherited from"
      + " IdableSaveableContainer");

    ASSERT_FATAL(item[IdableSaveableContainer.ID_PROPERTY] !== null,
      "Attempt to add item to the container with invalid id");
  }
}