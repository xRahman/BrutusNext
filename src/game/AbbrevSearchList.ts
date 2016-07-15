/*
  Part of BrutusNEXT

  Array for searching of substring in a list of strings.
  (used mainly for searching for abbreviations in commands
  like 'tell 3.orc Hello!')
*/

/*
  Note: This solution might take quite a lot of memory. If it
  becomes an issue (with lots of entities online), the easiest
  solution would be to limit abbrevList to only contain say
  up to three letter abbreviations. This way there would be
  more sequential processing of entities listed for such short
  abbreviation, but much less memory cost.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {GameEntity} from "../game/GameEntity";
import {EntityId} from '../game/EntityId';

export class AbbrevSearchList
{
  // -------------- Protected class data ----------------

  protected static searchCathegory =
  {
    ANYTHING: 0,
    MOB: 1,
    PLAYER: 2,
    FOLLOWER: 3,  // Character's own follower.
    CHARMED: 4,   // Any charmed character.
    GROUP: 5,     // Any character in character's group.
    OBJECT: 6
  }

  // This hashmap maps abbreviations to the list of entities
  // corresponding to that abbreviation.
  protected abbrevList: { [abbrev: string]: EntityIdList } = {};

  // ---------------- Public methods --------------------

  public isAbbrev(partialString: string, fullString: string): boolean
  {
    return fullString.indexOf(partialString) !== -1;
  }

  // Returns null if no such entity exists.
  // (search string should be something like "3.mob.orc_chief")
  public search(searchString: string): EntityId
  {
    let parseResult = this.parseSearchString(searchString);
    let cathegory = this.parseSearchCathegory(parseResult.cathegory);

    // Hack to process search strings like '0.john'.
    if (parseResult.index == 0)
    {
      // '0.john' means that we are looking for player character, which is
      // the same as '1.player.john, so we will transform it so.
      cathegory = AbbrevSearchList.searchCathegory.PLAYER;
      parseResult.index = 1;
    }

    return this.findEntity(parseResult.name, parseResult.index, cathegory);
  }

  // If more similar names are added, they will be accessible by dot notation
  // (like 2.orc).
  public addEntity(entity: GameEntity)
  {
    // Add all entity aliases.
    for (let i = 0; i < entity.aliases.length; i++)
    {
      let alias = entity.aliases[i];

      // Add all possible abbreviations of each alias word.
      for (let j = 0; j < alias.length; j++)
      {
        // From 0 to i + 1, because we don't want to add empty string and
        // we do want to add last character of the string (substring()
        // doesn't include right limit to the result).
        this.addEntityIdToAbbreviation
        (
          alias.substring(0, j + 1),
          entity.getId()
        );
      }
    }
  }

  public removeEntity(entity: GameEntity)
  {
    // Remove all entity aliases.
    for (let i = 0; i < entity.aliases.length; i++)
    {
      let alias = entity.aliases[i];

      // Remove all possible abbreviations of each alias.
      for (let j = 0; j < alias.length; j++)
      {
        this.removeEntityIdFromAbbreviation
        (
          alias.substring(0, j),
          entity.getId()
        );
      }
    }
  }

  // ---------------- Private methods --------------------

  private addEntityIdToAbbreviation(abbrev: string, entityId: EntityId)
  {
    let lowercaseAbbrev = abbrev.toLocaleLowerCase();

    if (this.abbrevList[lowercaseAbbrev] === undefined)
      this.abbrevList[lowercaseAbbrev] = new EntityIdList();

    this.abbrevList[lowercaseAbbrev].addEntity(entityId);
  }

  private removeEntityIdFromAbbreviation(abbrev: string, entityId: EntityId)
  {
    let lowercaseAbbrev = abbrev.toLocaleLowerCase();

    ASSERT_FATAL(this.abbrevList[lowercaseAbbrev] !== undefined,
      "Attempt to remove abbrev item for abbreviation"
      + " '" + lowercaseAbbrev + "' that does not exist"
      + " in this.abbrevs");

    let numberOfItems =
      this.abbrevList[lowercaseAbbrev].removeEntity(entityId);

    // If there are no items left for this abbreviation, we can delete
    // the property from hashmap.
    if (numberOfItems === 0)
      delete this.abbrevList[lowercaseAbbrev];
  }

  private mergeResults(entityLists: Array<EntityIdList>): Array<EntityId>
  {
    let result: Array<EntityId> = [];

    if (entityLists.length === 0)
      return result;

    let firstKeywordEntityList = entityLists[0].entities;
    let processedEntity = null;
    let match = true;

    // Go through item list matching the first keyword.
    for (let i = 0; i < firstKeywordEntityList.length; i++)
    {
      match = true;
      processedEntity = firstKeywordEntityList[i];

      // For each processed entity check if it is also contained in entityLists
      // for the rest of keywords.
      for (let j = 1; j < entityLists.length; j++)
      {
        if (!entityLists[j].contains(processedEntity))
        {
          match = false;
          break;  // No need to check the rest of the lists.
        }
      }

      if (match)
        result.push(processedEntity);
    }

    return result;
  }

  private validateResult(candidate: GameEntity, cathegory: number)
  {
    switch (cathegory)
    {
      case AbbrevSearchList.searchCathegory.ANYTHING:
        // TODO:
        return true;

      case AbbrevSearchList.searchCathegory.CHARMED:
        // TODO:
        //   something like:
        //   if (candidate.isCharmed())
        //     return false;
        //   break;
        break;

      case AbbrevSearchList.searchCathegory.FOLLOWER:
        // TODO:
        break;

      case AbbrevSearchList.searchCathegory.GROUP:
        // TODO:
        break;

      case AbbrevSearchList.searchCathegory.MOB:
        // TODO:
        break;

      case AbbrevSearchList.searchCathegory.OBJECT:
        // TODO:
        break;

      case AbbrevSearchList.searchCathegory.PLAYER:
        // TODO:
        break;

      default:
        ASSERT(false, "Unknown search cathegory");
        break;
    }

    return false;
  }

  private filterResults
  (
    candidates: Array<EntityId>,
    searchIndex: number,
    cathegory: number
  )
  : EntityId
  {
    // This test it not necessary, it just saves going through the list
    // of candidates it there is less of them then requested index.
    if (searchIndex > candidates.length)
      return null;

    let validResultsFound = 0;

    for (let i = 0; i < searchIndex; i++)
    {
      let candidate = <GameEntity>candidates[i].getEntity();

      if (this.validateResult(candidate, cathegory))
        validResultsFound++;

      if (validResultsFound === searchIndex)
        return candidates[i];
    }

    return null;
  }

  private findEntity
  (
    searchName: string,
    searchIndex: number,
    cathegory: number
  )
  : EntityId
  {
    // Nothing can possibly match an empty, null or undefined searchName.
    if (!searchName)
      return null;

    // Split searchName into parts separated by underscores.
    let abbrevArray = searchName.split('_');

    // This array will store a list of entities that listen to each of
    // abbreviations contained in abbrevArray.
    let itemLists: Array<EntityIdList> = [];

    for (let i = 0; i < abbrevArray.length; i++)
    {
      itemLists[i] = this.abbrevList[abbrevArray[i]];

      // If one of requested abbreviations isn't even registered,
      // our search is a miss.
      if (itemLists[i] === undefined)
        return null;
    }

    // We have found lists of entities that listen to each of requested
    // keywords (like 'orc' and 'chieftain' in 'orc_chieftain').
    // Now we have filter entities that listen to all of them.

    let candidates = this.mergeResults(itemLists);

    return this.filterResults(candidates, searchIndex, cathegory);
  }

  // Returns object containing index, cathegory and name parsed from
  // target string (like "3.mob.orc").
  private parseSearchString(searchString: string):
    { index: number, cathegory: string, name: string }
  {
    let result = { index: 1, cathegory: "", name: "" };

    // Split the searchString into parts separated by dots.
    let splitArray = searchString.split('.');

    switch (splitArray.length)
    {
      case 0:
        // Empty string.
        // We don't need to do anything, default result matches empty string.
        break;

      case 1:
        // No dots found. It means that whole searchString is a name.
        result.name = searchString;
        break;

      case 2:
        // A single dot found. There are two possibilities now:
        // 1) it's something like 1.orc
        // 2) it's something like mob.orc

        // Test if splitArray[0] only contains digits.
        if (/^\d+$/.test(splitArray[0]))
        {
          // splitArray[0] is a number, so it is an index.
          result.index = parseInt(splitArray[0]);
        }
        else
        {
          // splitArray[0] is a string, so it is a cathegory (like "mob.").
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
          // If it's not a number, so searchString is something like
          // bread.mob.orc, than searchString is not valid and nothing will
          // match it. We return the same result as if the searchString was
          // empty.
          return result;
        }

        result.name = searchString;
        break;

      default:
        // More than three dots found, that's not valid target string.
        // We return the same result as if the searchString was empty
        // (nothing will match it).
        return result;
    }

    return result;
  }

  private parseSearchCathegory(cathegoryString: string): number
  {
    let cathegory = AbbrevSearchList.searchCathegory.ANYTHING;

    if (this.isAbbrev(cathegoryString, "mob"))
      cathegory = AbbrevSearchList.searchCathegory.MOB;

    if (this.isAbbrev(cathegoryString, "player")
      || this.isAbbrev(cathegoryString, "plr"))
      cathegory = AbbrevSearchList.searchCathegory.PLAYER;

    if (this.isAbbrev(cathegoryString, "follower"))
      cathegory = AbbrevSearchList.searchCathegory.FOLLOWER;

    if (this.isAbbrev(cathegoryString, "charmed"))
      cathegory = AbbrevSearchList.searchCathegory.CHARMED;

    if (this.isAbbrev(cathegoryString, "group")
      || this.isAbbrev(cathegoryString, "grp"))
      cathegory = AbbrevSearchList.searchCathegory.GROUP;

    if (this.isAbbrev(cathegoryString, "object"))
      cathegory = AbbrevSearchList.searchCathegory.OBJECT;

    return cathegory;
  }
}

// ---------------------- private module stuff -------------------------------

// List of entityIds corresponding to a particular abbreviation.
class EntityIdList
{
  // -------------- Public class data ----------------

  public entities: Array<EntityId> = [];

  // ---------------- Public methods --------------------

  public contains(entityId: EntityId): boolean
  {
    return this.entities.indexOf(entityId) !== -1;
  }

  public addEntity(entityId: EntityId)
  {
    this.entities.push(entityId);
  }

  public removeEntity(entityId: EntityId): number
  {
    let index = this.entities.indexOf(entityId);

    ASSERT_FATAL(index !== -1,
      "Attempt to remove item from AbbrevItemsList that does not exist in it");

    // Remove 1 item at index.
    this.entities.splice(index, 1);

    return this.entities.length;
  }
}
