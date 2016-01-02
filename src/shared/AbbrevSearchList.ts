/*
  Part of BrutusNEXT

  Array for searching of substring in a list of strings.
  (used mainly for searching for abbreviations in commands
  like 'tell 3.orc Hello!')
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
      this.addItemToAbbrev(name.substring(0, i), id);
  }

  public removeEntity(name: string, id: Id)
  {
    // Remove all possible abbreviations of name.
    for (let i = 0; i < name.length; i++)
      this.removeItemFromAbbrev(name.substring(0, i), id);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps entity name abbreviations to the list of ids
  // of entities which correspond to that abbreviation.
  protected myAbbrevs: { [abbrev: string]: AbbrevItemsList } = {};

  // --------------- Private methods -------------------

  private addItemToAbbrev(abbreviation: string, id: Id)
  {
    if (this.myAbbrevs[abbreviation] === undefined)
      this.myAbbrevs[abbreviation] = new AbbrevItemsList();
    
    this.myAbbrevs[abbreviation].addItem(id);
  }

  private removeItemFromAbbrev(abbreviation: string, id: Id)
  {
    ASSERT_FATAL(this.myAbbrevs[abbreviation] !== undefined,
      "Attempt to remove abbrev item for abbreviation that does not exist"
      + "in myAbbrevs");

    let numberOfItems = this.myAbbrevs[abbreviation].removeItem(id);

    // If there are no items left for this abbreviation, we can delete
    // the property from hashmap.
    if (numberOfItems === 0)
      delete this.myAbbrevs[abbreviation];
  }
}

// ---------------------- private module stuff -------------------------------

// List of items corresponding to a particular abbreviation.
class AbbrevItemsList
{
  /// TODO: vyhledove mozna bude potreba metoda getItemByIndexVis()
  /// Ta asi bude muset postupne projit itemy, testovat, ktere jsou viditelne
  /// pro dorazujici se entitu a 'rucne' napocitat index.

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
    this.myItems.push(id);
  }

  public removeItem(id: Id): number
  {
    let index = this.myItems.indexOf(id);

    ASSERT_FATAL(index !== -1,
      "Attempt to remove item from AbbrevItemsList that does not exist in it");

    // Remove 1 item at index.
    this.myItems.splice(index, 1);

    return this.myItems.length;
  }

  // -------------- Protected class data ----------------

  protected myItems: Array<Id> = [];

}