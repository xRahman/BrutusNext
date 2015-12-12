/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/

/*
  Implementation note:
    All methods are protected, so you need to write public wrappers if you
  need them. It is to prevent someone from manipulating your data the way
  you don't want it to be manipulated.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdProvider} from '../shared/IdProvider';
import {Server} from '../server/Server';

export class IdContainer<T>
{
  constructor()
  {
    // This will assign the actual name of the container class that is
    // inherited from IdContainer, for example 'AccountManager'.
    //   Id's will automatically be checked when accessed to match this,
    // so you will know when you try to access something by id not issued
    // by the container you are asking for that something.
    this.myTypeOfId = this.getClassName();
  }

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // This hash map allows to access items using unique sids.
  protected myContainer: { [key: string]: T } = {};

  protected myTypeOfId = "";

  // -------------- Protected methods -------------------

  // Inserts a new item to the container, returns its unique id.
  protected addItem(item: T): Id
  {
    let newId = IdProvider.generateId(this.myTypeOfId);

    ASSERT_FATAL(!(newId.stringId in this.myContainer),
      "Item '" + newId.stringId + "' already exists in the container");

    // Here we are creating a new property in myContainer
    // (it is possible because myContainer is a hashmap)
    this.myContainer[newId.stringId] = item;

    return newId;
  }

  protected getItem(id: Id): T
  {
    // Check if given id is valid, issued by this container and in this boot.
    this.checkId(id);

    let item = this.myContainer[id.stringId];
    ASSERT_FATAL(typeof item !== 'undefined',
      "Item (" + id.stringId + ") no longer exists in the container");

    return item;
  }

  protected deleteItem(id: Id)
  {
    // Check if given id is valid, issued by this container and in this boot.
    this.checkId(id);

    if (!ASSERT(id.stringId in this.myContainer,
      "Attempt to delete item (" + id.stringId + ") that doesn't exist"
      + " in the container"))
    {
      // Delete the property that traslates to the descriptor.
      delete this.myContainer[id.stringId];
    }
  }

  // ---------- Auxiliary protected methods ------------- 

  // Checks if id is valid and issued by this container.
  protected checkId(id: Id)
  {
    ASSERT_FATAL(id !== null, "Invalid id");

    ASSERT(id.typeOfId === this.myTypeOfId,
      "Attempt to access an item using id that wasn't issued by"
      + "  this container. Perhaps you are using wrong manager class?")

    // Check if timeOfBoot matches current timeOfBoot.
    ASSERT_FATAL(id.timeOfBoot === Server.timeOfBoot,
      "Attempt to use id's issued in another boot. Perhaps you have"
      + " overwritten your id by load()?");
        
  }

  // Returns actual name of the class which inherited this method.
  protected getClassName()
  {
    let funcNameRegex = /function (.{1,})\(/;
    let results = (funcNameRegex).exec((<any>this).constructor.toString());

    ASSERT_FATAL(results && results.length > 1,
      "Unable to extract class name");

    return (results && results.length > 1) ? results[1] : "";
  }
}