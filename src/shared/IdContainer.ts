/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique string ids.
*/

/*
  Implementation note:
    All methods are protected, so you need to write public wrappers if you
  need them. It is to prevent someone from manipulating your data the way
  you don't want it to be manipulated.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {IdProvider} from '../shared/IdProvider';

export class IdContainer<T>
{
  // Id provider needs to be supplied externally, so more then one container
  // can store items identified by the same set of unique id's.
  constructor(protected myIdProvider: IdProvider) { }

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // This hash map allows to access sockets using unique string ids.
  protected myContainer: { [key: string]: T } = {};

  // -------------- Protected methods -------------------

  // Inserts a new item to the container, returns its unique string id.
  protected addItem(item: T): string
  {
    let newId = this.myIdProvider.generateId();

    ASSERT_FATAL(!(newId in this.myContainer),
      "Item '" + newId + "' already exists in the container");

    // Here we are creating a new property in myContainer
    // (it is possible because myContainer is a hashmap)
    this.myContainer[newId] = item;

    return newId;
  }

  protected getItem(id: string): T
  {
    let item = this.myContainer[id];
    ASSERT_FATAL(typeof item !== 'undefined',
      "Item (" + id + ") no longer exists in the container");

    return item;
  }

  protected deleteItem(id: string)
  {
    if (!ASSERT(typeof this.myContainer[id] !== 'undefined',
      "Attempt to delete item (" + id + ") that doesn't exist"
      + " in the container"))
    {
      // Delete the property that traslates to the descriptor.
      delete this.myContainer[id];
    }
  }
}