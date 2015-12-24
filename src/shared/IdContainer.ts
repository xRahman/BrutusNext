/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';
import {Id} from '../shared/Id';
import {IdProvider} from '../shared/IdProvider';
import {Server} from '../server/Server';

export class IdContainer<T>
{

  // ---------------- Public methods --------------------

  // Inserts a new item to the container, returns its unique id.
  public addNewItem(item: T): Id
  {
    // Item with this id must not already exist.
    //   This is a very serious error. It most probably means that
    // lastIssuedId of IdProvider has not been saved correctly and it was
    // issuing the same ids again (= not unique ones). The only way to fix
    // this correcyly is to go through all saved files, find out the largest
    // id saved in them and set lastIssuedId in file ./data/LastIssuedId.json
    // to it. (Or you might just increse it by some large number and hope that
    // you skip all already issued ids.)
    //   Much safer way is to rollback to the last backup that worked.
    let newId = Server.idProvider
      .generateId(this.myTypeOfId, item['className']);
/// TODO: Asi to budu muset zkusit predelat z templatu na SaveableObject, treba
/// to v typescriptu 1.7 projde.
    /// Nebo pripadne nechat ten tvrdy pristup pres jmeno property, ovsem
    /// s osetrenim, ze existuje.

    ASSERT_FATAL(
      !(newId.stringId in this.myContainer),
      "Item '" + newId.stringId + "' already exists in the container");

    // Here we are creating a new property in myContainer
    // (it is possible because myContainer is a hashmap)
    this.myContainer[newId.stringId] = item;

    return newId;
  }

  // Inserts item under an existing id.
  public addItem(item: T, id: Id)
  {
    // Item with this id must not already exist.
    //   This is a very serious error. It most probably means that
    // lastIssuedId of IdProvider has not been saved correctly and it was
    // issuing the same ids again (= not unique ones). The only way to fix
    // this correcyly is to go through all saved files, find out the largest
    // id saved in them and set lastIssuedId in file ./data/LastIssuedId.json
    // to it. (Or you might just increse it by some large number and hope that
    // you skip all already issued ids.)
    //   Much safer way is to rollback to the last backup that worked.
    ASSERT_FATAL(
      !(id.stringId in this.myContainer),
      "Attempt to add item with id (" + id.stringId + ") that already"
      + " exists in the container");

    // Here we are creating a new property in myContainer
    // (it is possible because myContainer is a hashmap)
    this.myContainer[id.stringId] = item;
  }

  public getItem(id: Id): T
  {
    ASSERT_FATAL(id.notNull(), "Trying to get item using null id");

    let item = this.myContainer[id.stringId];

    ASSERT_FATAL(typeof item !== 'undefined',
      "Item (" + id.stringId + ") no longer exists in the container");

    return item;
  }

  public deleteItem(id: Id)
  {
    ASSERT_FATAL(id.notNull(), "Invalid id");

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

  protected myTypeOfId = "";

  // -------------- Protected methods -------------------

}