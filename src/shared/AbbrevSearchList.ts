/*
  Part of BrutusNEXT

  Array for searching of substring in a list of strings.
  (used mainly for searching for abbreviations)
*/

/*
  Note:
    'Indexes' are persistant. If you add entity 'orc' followed by
    entity 'orca' and then remove entity 'orc', '2.orc' will still
    refer to 'orca'.
*/

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';

export class AbbrevSearchList
{
  // ---------------- Public methods --------------------

  // Returns null if no such entity exists.
  //   Note: index and abbreviation must be passed separately. So if you want
  // to find 3.orc, you need to call getEntityByAbbreviation("orc", 3);
  public getEntityByAbbrev(abbrev: string, index: number): Id
  {
    if (this.myAbbrevs[abbrev] === undefined)
      return null;

    return this.myAbbrevs[abbrev].getItemByIndex(index);
  }

  public addEntity(name: string, id: Id)
  {
    // Add all possible abbreviations of name.
    for (let i = 0; i < name.length; i++)
      this.addAbbrevItem(name.substring(0, i), id);
  }

  public removeEntity(name: string, id: Id)
  {
    // Add all possible abbreviations of name.
    for (let i = 0; i < name.length; i++)
      this.removeAbbrevItem(name.substring(0, i), id);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps entity name abbreviations to the list of ids
  // of entities which correspond to that abbreviation.
  protected myAbbrevs: { [abbrev: string]: AbbrevItemsList } = {};

  // -------------- Protected methods -------------------

  // --------------- Private methods -------------------

  private addAbbrevItem(abbreviation: string, id: Id)
  {
    if (this.myAbbrevs[abbreviation] === undefined)
      this.myAbbrevs[abbreviation] = new AbbrevItemsList();
    
    this.myAbbrevs[abbreviation].addItem(id);
  }

  private removeAbbrevItem(abbreviation: string, id: Id)
  {
    ASSERT_FATAL(this.myAbbrevs[abbreviation] !== undefined,
      "Attempt to remove abbrev item for abbreviation that does not exist"
      + "in myAbbrevs");

    let lastItemIndex = this.myAbbrevs[abbreviation].removeItem(id);

    // If there are no items left for this abbreviation, we can delete
    // the property from hashmap.
    if (lastItemIndex === 0)
      delete this.myAbbrevs[abbreviation];
  }
}

// ---------------------- private module stuff -------------------------------

// Container holding list of items that 'listen to' a particular
// abbreviation. Items are identified by integer indexes.
class AbbrevItemsList
{
  // ---------------- Public methods --------------------

  // Returns null if item is not found.
  public getItemByIndex(index: number): Id
  {
    if (this.myItems[index] !== undefined)
      this.myItems[index];
    else
      return null;
  }

  public addItem(id: Id)
  {
    let freeIndex = this.getFirstFreeIndex();

    // Add item to myItems.
    this.myItems[freeIndex] = id;

    // Also add it's index to myIndexes so we can later find index of id
    // by it's string value;
    this.myIndexes[id.stringId] = freeIndex;
  }

  public removeItem(id: Id): number
  {
    ASSERT_FATAL(this.myIndexes[id.stringId] !== undefined,
      "Attempt to remove item from AbbrevSearchList, which has not been"
      + " added to it.");

    let index = this.myIndexes[id.stringId];

    ASSERT_FATAL(this.myItems[index] !== undefined,
      "Attempt to remove item from AbbrevSearchList, which does not exist"
      + " already.");

    // Delete propery in myItems that corresponds to this index.
    delete this.myItems[index];

    // Also delete property in myIndexes that corresponds to this id.
    delete this.myIndexes[id.stringId];

    if (index === this.lastUsedIndex)
    {
      // We have delete item at lastUsedIndex. It means that lastUsedIndex
      // needs to be updated.
      this.updateLastUsedIndex();
    }

    return this.lastUsedIndex;
  }

  // -------------- Protected class data ----------------

  protected lastUsedIndex = 0;

  // This hashmap contains 'targeting indexes' of entities identified
  // by id when refferenced by abbreviation this class matches to.
  //   Example: When player types "tell 2.arrow Blah", instance of
  // MyAbbrevItems matching abbreviation 'arrow' is found, then myItems[2] is
  // accessed on it - which is id of entity that 'listens' to 2.arrow.
  protected myItems: { [index: number]: Id } = { };

  // This auxiliary hashmap maps id.stringId (which is unique) to it's index
  // withing myItems[] array.
  //  This is used when entity is removed from AbbrevSearchList to speed up
  // searching which id is to be removed.
  protected myIndexes: { [stringId: string]: number } = {};

  // --------------- Private methods -------------------

  private getFirstFreeIndex(): number
  {
    // Find unused index if there is any.
    for (let i = 0; i <= this.lastUsedIndex; i++)
    {
      if (this.myItems[i] === undefined)
        return i;
    }

    // All indexes are used, add one more.
    this.lastUsedIndex++;

    return this.lastUsedIndex;
  }

  private updateLastUsedIndex()
  {
    for (let i = this.lastUsedIndex; i >= 0; i--)
    {
      if (this.myIndexes[i] !== undefined)
      {
        this.lastUsedIndex = i;

        return;
      }
    }

    // There were only holes left in myIndexes. It means that we are empty.
    this.lastUsedIndex = 0;
  }
}