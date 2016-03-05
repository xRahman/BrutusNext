/*
  Part of BrutusNEXT

  Array for searching of substring in a list of strings.
  (used mainly for searching for abbreviations in commands
  like 'tell 3.orc Hello!')
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
///import {Id} from '../shared/Id';

/// Pozn: Pro herni entity bude se bude pouzivat AbbrevSearchList<Id>,
///       pro prikazy bud string (jmeno handleru), nebo primo funkce, ktera
///       prikaz zpracuje

export class AbbrevSearchList<T>
{
  // ---------------- Public methods --------------------

  // Returns null if no such entity exists.
  //   Note: index and abbreviation must be passed separately. So if you want
  // to find 3.orc, you need to call getEntityByAbbreviation("orc", 3);
  public getEntityByAbbrev(abbrev: string, index: number): T
  {
    if (this.myAbbrevs[abbrev] === undefined)
      return null;

    return this.myAbbrevs[abbrev].getItemByIndex(index);
  }

  // This is used by CommandInterpretter.
  //   There may only be one command registered for each abbrev, so
  // we just return it.
  public getUniqueEntityByAbbrev(abbrev: string): T
  {
    return this.getEntityByAbbrev(abbrev, 1);
  }

  // This is used for adding names of rooms, items, characters, etc.
  //   If more similar names are added, they will be accessible by dot notation
  // (like 2.orc).
  public addEntity(name: string, item: T)
  {
    // Add all possible abbreviations of name.
    for (let i = 0; i < name.length; i++)
      this.addItemToAbbrev(name.substring(0, i), item);
  }

  public isAbbrevRegistered(abbrev: string): boolean
  {
    if (this.myAbbrevs[abbrev] === undefined)
      return false;
    else
      return true;
  }

  // This is used by CommandInterpretter. Each abbreviation corresponds
  // to at most one command (the one which has been registered first).
  public addUniqueEntity(name: string, item: T)
  {
    // Add all possible abbreviations of name.
    for (let i = 0; i < name.length; i++)
    {
      let abbrev = name.substring(0, i);

      if (!this.isAbbrevRegistered(abbrev))
        this.addItemToAbbrev(name.substring(0, i), item);
    }
  }

  public removeEntity(name: string, item: T)
  {
    // Remove all possible abbreviations of name.
    for (let i = 0; i < name.length; i++)
      this.removeItemFromAbbrev(name.substring(0, i), item);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps abbreviations to the list of items (of type T)
  // corresponding to that abbreviation.
  protected myAbbrevs: { [abbrev: string]: AbbrevItemsList<T> } = {};

  // --------------- Private methods -------------------

  private addItemToAbbrev(abbreviation: string, item: T)
  {
    if (this.myAbbrevs[abbreviation] === undefined)
      this.myAbbrevs[abbreviation] = new AbbrevItemsList<T>();
    
    this.myAbbrevs[abbreviation].addItem(item);
  }

  private removeItemFromAbbrev(abbreviation: string, item: T)
  {
    ASSERT_FATAL(this.myAbbrevs[abbreviation] !== undefined,
      "Attempt to remove abbrev item for abbreviation that does not exist"
      + "in myAbbrevs");

    let numberOfItems = this.myAbbrevs[abbreviation].removeItem(item);

    // If there are no items left for this abbreviation, we can delete
    // the property from hashmap.
    if (numberOfItems === 0)
      delete this.myAbbrevs[abbreviation];
  }
}

// ---------------------- private module stuff -------------------------------

// List of items corresponding to a particular abbreviation.
class AbbrevItemsList<T>
{
  /// TODO: vyhledove mozna bude potreba metoda getItemByIndexVis()
  /// Ta asi bude muset postupne projit itemy, testovat, ktere jsou viditelne
  /// pro dorazujici se entitu a 'rucne' napocitat index.

  // ---------------- Public methods --------------------

  // Returns null if item is not found.
  public getItemByIndex(index: number): T
  {
    if (this.myItems[index] !== undefined)
      return this.myItems[index];
    else
      return null;
  }

  public addItem(item: T)
  {
    this.myItems.push(item);
  }

  public removeItem(item: T): number
  {
    let index = this.myItems.indexOf(item);

    ASSERT_FATAL(index !== -1,
      "Attempt to remove item from AbbrevItemsList that does not exist in it");

    // Remove 1 item at index.
    this.myItems.splice(index, 1);

    return this.myItems.length;
  }

  // -------------- Protected class data ----------------

  protected myItems: Array<T> = [];
}