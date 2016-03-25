/*
  Part of BrutusNEXT

  Array for searching of substring in a list of strings.
  (used mainly for searching for abbreviations in commands
  like 'tell 3.orc Hello!')
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {GameEntity} from "../game/GameEntity";

export class AbbrevSearchList
{
  // Do not save this object to JSON.
  public get isSaved() { return false; }

  // ---------------- Public methods --------------------


  // Returns invalid id if no such entity exists.
  // (search string should be something like "3.orc")
  public getTargetEntityId(targetStr: string): Id
  {
    // Search string uses following format: "3.mob.orc"
    //   The number always comes first but may be missing
    //   ('tell mob.orc' is valid)
    
    let parseResult = this.parseTargetStr(targetStr);

    /// TODO: Zohlednit kategorii (mob, character, etc.)
    ///parseResult.cathegory;
    /*
    "character"
    "mob"
    "follower"
    "player"
    "object"
    "group"
    */

    return this.getEntityByAbbrev(parseResult.name, parseResult.index);

    return Id.NULL;
  }

  // If more similar names are added, they will be accessible by dot notation
  // (like 2.orc).
  public addEntity(entity: GameEntity)
  {
    /// TODO: Misto entity.name pridat vsechny aliasy entity.

    // Add all possible abbreviations of entity's name.
    for (let i = 0; i < entity.name.length; i++)
      this.addItemToAbbrev(entity.name.substring(0, i), entity.id);
  }

  public removeEntity(entity: GameEntity)
  {
    /// TODO: Misto entity.name odebrat vsechny aliasy entity.

    // Remove all possible abbreviations of entity's name.
    for (let i = 0; i < entity.name.length; i++)
      this.removeItemFromAbbrev(entity.name.substring(0, i), entity.id);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps abbreviations to the list of entity IDs
  // corresponding to that abbreviation.
  protected abbrevs: { [abbrev: string]: AbbrevItemsList } = {};

  // -------------- Protected methods -------------------

  // Returns null if no such entity exists.
  //   Note: index and abbreviation must be passed separately. So if you want
  // to find 3.orc, you need to call getEntityByAbbreviation("orc", 3);
  protected getEntityByAbbrev(abbrev: string, index: number): Id
  {
    if (this.abbrevs[abbrev] === undefined)
      return null;

    return this.abbrevs[abbrev].getItemByIndex(index);
  }

  // Returns object containing index, cathegory and name parsed from
  // target string (like "3.mob.orc").
  protected parseTargetStr(targetStr: string):
    { index: number, cathegory: string, name: string }
  {
    let result = { index: 1, cathegory: "", name: "" };

    // Split the targetStr into parts separated by dots.
    let splitArray = targetStr.split('.');

    switch (splitArray.length)
    {
      case 0:
        // Empty string.
        // We don't need to do anything, default result matches empty string.
        // result.index = 1;      // This is implicit.
        // result.cathegory = ""; // This is implicit.
        // result.name = "";      // This is implicit.
        break;

      case 1:
        // No dots found. It means that whole targetStr is a name.
        // result.index = 1;        // This is implicit.
        // result.cathegory = "";   // This is implicit.
        result.name = targetStr;
        break;

      case 2:
        // A single dot found. Here there are two possibilities:
        // 1) it's something like 1.orc
        // 2) it's something like mob.orc

        // Test if splitArray[0] only contains digits.
        if (/^\d+$/.test(splitArray[0]))
        {
          // splitArray[0] is a number, so it is an index.

          result.index = parseInt(splitArray[0]);
          // result.cathegory = "";    // This is implicit.
        }
        else
        {
          // splitArray[0] is a string, so it is a cathegory (like "mob.").

          // result.index = 1;         // This is implicit.
          result.cathegory = splitArray[0];
        }

        result.name = splitArray[1];
        break;

      case 3:
        // Two dots found.
        // Check if first parsed substring is a number.
        if (/^\d+$/.test(splitArray[0]))
        {
          // If it is, convert it to integer (it's an index).
          result.index = parseInt(splitArray[0]);
        }
        else
        {
          // If it's not a number, so targetStr is something like
          // bread.mob.orc, than targetStr is not valid and nothing will match
          // it. We return the same result as if the targetStr was empty.

          // result.index = 1;      // This is implicit.
          // result.cathegory = ""; // This is implicit.
          // result.name = "";      // This is implicit.
          return result;
        }
        // result.cathegory = "";    // This is implicit.
        result.name = targetStr;
        break;

      default:
        // More than three dots found, that's not valid target string.
        // We return the same result as if the targetStr was empty (nothing
        // will match it).

        // result.index = 1;      // This is implicit.
        // result.cathegory = ""; // This is implicit.
        // result.name = "";      // This is implicit.
        return result;
    }

    return result;
  }

  protected addItemToAbbrev(abbrev: string, entityId: Id)
  {
    if (this.abbrevs[abbrev] === undefined)
      this.abbrevs[abbrev] = new AbbrevItemsList();
    
    this.abbrevs[abbrev].addItem(entityId);
  }

  protected removeItemFromAbbrev(abbrev: string, entityId: Id)
  {
    ASSERT_FATAL(this.abbrevs[abbrev] !== undefined,
      "Attempt to remove abbrev item for abbreviation that does not exist"
      + "in this.abbrevs");

    let numberOfItems = this.abbrevs[abbrev].removeItem(entityId);

    // If there are no items left for this abbreviation, we can delete
    // the property from hashmap.
    if (numberOfItems === 0)
      delete this.abbrevs[abbrev];
  }
}

// ---------------------- private module stuff -------------------------------

// List of entityIds corresponding to a particular abbreviation.
class AbbrevItemsList
{
  /// TODO: vyhledove mozna bude potreba metoda getItemByIndexVis()
  /// Ta asi bude muset postupne projit itemy, testovat, ktere jsou viditelne
  /// pro dorazujici se entitu a 'rucne' napocitat index.

  // ---------------- Public methods --------------------

  // Returns null if item is not found.
  public getItemByIndex(index: number): Id
  {
    if (this.items[index] !== undefined)
      return this.items[index];
    else
      return null;
  }

  public addItem(item: Id)
  {
    this.items.push(item);
  }

  public removeItem(item: Id): number
  {
    let index = this.items.indexOf(item);

    ASSERT_FATAL(index !== -1,
      "Attempt to remove item from AbbrevItemsList that does not exist in it");

    // Remove 1 item at index.
    this.items.splice(index, 1);

    return this.items.length;
  }

  // -------------- Protected class data ----------------

  protected items: Array<Id> = [];
}