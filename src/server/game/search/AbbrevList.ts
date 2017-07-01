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

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Attributes} from '../../../shared/lib/class/Attributes';
///import {NameList} from '../../../shared/lib/entity/NameList';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityList} from '../../../shared/lib/entity/EntityList';
import {GameEntity} from "../../../server/game/GameEntity";

export class AbbrevList<T extends GameEntity>
{
  //------------------ Private data ---------------------

  /// Converted to enum
  /*
  private static searchCathegory =
  {
    ANYTHING: 0,
    MOB: 1,
    PLAYER: 2,
    FOLLOWER: 3,  // Character's own follower.
    CHARMED: 4,   // Any charmed character.
    GROUP: 5,     // Any character in character's group.
    OBJECT: 6
  }
  */

  // This hashmap maps abbreviations to the list of entities
  // corresponding to that abbreviation.
  // Hashmap<[ string, EntityList ]>
  //   Key: abbreviation (like "warrio").
  //   Value: list of entity references that "listen" to this abbrev.
  private abbrevData = new Map<string, EntityList<T>>();
    private static abbrevData: Attributes =
    {
      saved: false
    };

  // ---------------- Public methods --------------------

  // Returns null if no such entity exists.
  // (search string should be something like "3.mob.orc_chief")
  public search(searchString: string): GameEntity
  {
    let parseResult = this.parseSearchString(searchString);
    let cathegory = this.parseSearchCathegory(parseResult.cathegory);

    // Hack to process search strings like '0.john'.
    if (parseResult.index == 0)
    {
      // '0.john' means that we are looking for player character, which is
      // the same as '1.player.john, so we will transform it so.
      cathegory = AbbrevList.SearchCathegory.PLAYER;
      parseResult.index = 1;
    }

    return this.findEntity(parseResult.name, parseResult.index, cathegory);
  }

  // -> Returns true if adding succeeded.
  public add(entity: T): boolean
  {
    /*
    if (super.add(entity) === false)
      return false;
    */

    // Add all aliases of this entity to abbrevSearchList.
    this.addToAbbrevList(entity);

    return true;
  }

  // Removes entity id from this list, but doesn't delete the entity from
  // Entities.
  public remove(entity: T)
  {
    // Remove all aliases of this entity from abbrevSearchList.
    this.removeFromAbbrevList(entity);

    /*
    return super.remove(entity);
    */
  }

  // ---------------- Private methods --------------------

  private removeFromAbbrevList(entity: T)
  {
    // Remove all entity aliases.
    for (let i = 0; i < entity.aliases.length; i++)
    {
      let alias = entity.aliases[i];

      // Remove all possible abbreviations of each alias.
      for (let j = 0; j < alias.length; j++)
      {
        this.removeEntityFromAbbreviation(alias.substring(0, j), entity);
      }
    }
  }

  // If more similar names are added, they will be accessible by dot notation
  // (like 2.orc).
  private addToAbbrevList(entity: T)
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
        this.addEntityToAbbreviation(alias.substring(0, j + 1), entity);
      }
    }
  }

  private addEntityToAbbreviation(abbrev: string, entity: T)
  {
    let lowerCaseAbbrev = abbrev.toLocaleLowerCase();

    // get() Returns 'undefined' if item is not in hashmap.
    let entityList = this.abbrevData.get(lowerCaseAbbrev);

    // If record with such key wasn't found in this.abbrevList, 
    // a new EntityList will be created.
    if (entityList === undefined)
    {
      entityList = new EntityList<T>();

      // Insert the new entityList to hashmap under key 'lowercaseAbbrev'.
      this.abbrevData.set(lowerCaseAbbrev, entityList);
    }

    // Now we are sure that entityList exists in hashamp, so we can insert
    // entity to it.
    entityList.add(entity);
  }

  private removeEntityFromAbbreviation(abbrev: string, entity: T)
  {
    let lowerCaseAbbrev = abbrev.toLocaleLowerCase();

    // get() Returns 'undefined' if item is not in hashmap.
    let entityList: EntityList<T> = this.abbrevData.get(lowerCaseAbbrev);

    // If record with such key wasn't found in this.abbrevList, 
    // a new EntityList will be created.
    if (entityList === undefined)
    {
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
        + " with abbreviation '" + lowerCaseAbbrev + "' that does"
        + " not exist in abbrevList hashamp");

      // Abbrev doesn't exist in hashmap so there is nothing to remove.
      return;
    }

    // Error message is handled by remove() if entity doesn't exist in
    // hashmap.
    entityList.remove(entity);

    // If we have removed the last entity from entityList, we also
    // need to delete whole record from this.abbrevList hashmap.
    if (entityList.size == 0)
      this.abbrevData.delete(lowerCaseAbbrev);
  }

  // -> Returns array of GameEntities that are present in each entityList
  //    stored in entityLists parameter.
  private mergeResults(entityLists: Array<EntityList<T>>)
  : Array<GameEntity>
  {
    let result: Array<GameEntity> = [];

    if (entityLists.length === 0)
      return result;

    let firstKeywordEntityList = entityLists[0].getEntities();
    let processedEntity = null;
    let match = true;

    // Go through entity list matching the first keyword.
    for (processedEntity of firstKeywordEntityList)
    {
      match = true;

      // For each processed entity check if it is also contained in entityLists
      // for the rest of keywords.
      for (let j = 1; j < entityLists.length; j++)
      {
        if (!entityLists[j].has(processedEntity))
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
      case AbbrevList.SearchCathegory.ANYTHING:
        // TODO:
        return true;

      case AbbrevList.SearchCathegory.CHARMED:
        // TODO:
        //   something like:
        //   if (candidate.isCharmed())
        //     return false;
        //   break;
        break;

      case AbbrevList.SearchCathegory.FOLLOWER:
        // TODO:
        break;

      case AbbrevList.SearchCathegory.GROUP:
        // TODO:
        break;

      case AbbrevList.SearchCathegory.MOB:
        // TODO:
        break;

      case AbbrevList.SearchCathegory.OBJECT:
        // TODO:
        break;

      case AbbrevList.SearchCathegory.PLAYER:
        // TODO:
        break;

      default:
        ERROR("Unknown search cathegory");
        break;
    }

    return false;
  }

  // If we are looking for something like '3.gray_orc', we need to count
  // three entities that listen to 'gray_orc'. We also need to check
  // visibility etc.
  // -> returns entity number 'searchIndex' that satisfies the search.
  private filterResults
  (
    candidates: Array<GameEntity>,
    searchIndex: number,
    cathegory: number
  )
  : GameEntity
  {
    // This test it not necessary, it just saves going through the list
    // of candidates it there is less of them then requested index.
    if (searchIndex > candidates.length)
      return null;

    let validResultsFound = 0;

    for (let i = 0; i < searchIndex; i++)
    {
      if (this.validateResult(candidates[i], cathegory))
        validResultsFound++;

      if (validResultsFound === searchIndex)
        return candidates[i];
    }

    return null;
  }

  private findEntity
  (
    // TODO: Asi by sem měl přibýt další parametr -> searchingEntity,
    //   který se použije na testování visibility.
    searchName: string,
    searchIndex: number,
    cathegory: number
  )
  : GameEntity
  {

    // Nothing can possibly match an empty, null or undefined searchName.
    if (!searchName)
      return null;

    // This array will store a list of entities that listen to each of
    // abbreviations contained in abbrevArray.
    // (returns null if any of these abbreviations is not found)
    let entityLists = this.gatherEntityLists(searchName);

    // If any of abbreviations present in searchName wasn't found,
    // whole serch is a miss.
    if (entityLists = null)
      return;

    // We have found lists of entities that listen to each of requested
    // keywords (like 'orc' and 'chieftain' in 'orc_chieftain').
    // Now we have to filter entities that listen to all of them.
    let candidates = this.mergeResults(entityLists);

    // If we are looking for something like '3.gray_orc', we need to count
    // three entities that listen to 'gray_orc' and are visible to the
    // searching entity.
    return this.filterResults(candidates, searchIndex, cathegory);
  }

  // 'searchName' is something like 'orc_chieftain'
  // -> Returns array containing an entityList for each abbreviation
  //    in searchName. Returns null if any of abbreviations is not found.
  private gatherEntityLists(searchName: string): Array<EntityList<T>>
  {
    // Split searchName into parts separated by underscores.
    // (If searchName is something like 'ug_gra_orc',
    //  abbrevArray will be [ 'ug', 'gra', 'orc' ]).
    let abbrevArray = searchName.split('_');

    // This array will store a list of entities that listen to each of
    // abbreviations contained in abbrevArray.
    let entityLists: Array<EntityList<T>> = [];

    for (let abbrev of abbrevArray)
    {
      // Request entityList corresponding to 'abbrev' from
      // this.abbrevList hashmap.
      // (get() returns undefined if 'abbrev' isn't in hashmap)
      let entityList = this.abbrevData.get(abbrev);

      // If any of requested abbreviations isn't found,
      // whole search is a miss.
      if (entityList === undefined)
        return null;

      entityLists.push(entityList);
    }

    return entityLists
  }

  // Returns object containing index, cathegory and name parsed from
  // target string (like "3.mob.orc").
  private parseSearchString(searchString: string)
  : { index: number, cathegory: string, name: string }
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
    let cathegory = AbbrevList.SearchCathegory.ANYTHING;

    if (Utils.isAbbrev(cathegoryString, "mob"))
      cathegory = AbbrevList.SearchCathegory.MOB;

    if (Utils.isAbbrev(cathegoryString, "player")
      || Utils.isAbbrev(cathegoryString, "plr"))
      cathegory = AbbrevList.SearchCathegory.PLAYER;

    if (Utils.isAbbrev(cathegoryString, "follower"))
      cathegory = AbbrevList.SearchCathegory.FOLLOWER;

    if (Utils.isAbbrev(cathegoryString, "charmed"))
      cathegory = AbbrevList.SearchCathegory.CHARMED;

    if (Utils.isAbbrev(cathegoryString, "group")
      || Utils.isAbbrev(cathegoryString, "grp"))
      cathegory = AbbrevList.SearchCathegory.GROUP;

    if (Utils.isAbbrev(cathegoryString, "object"))
      cathegory = AbbrevList.SearchCathegory.OBJECT;

    return cathegory;
  }
}

// ------------------ Type declarations ----------------------

export module AbbrevList
{
  export enum SearchCathegory
  {
    ANYTHING,
    MOB,
    PLAYER,
    FOLLOWER,  // Character's own follower.
    CHARMED,   // Any charmed character.
    GROUP,     // Any character in character's group.
    OBJECT
  }
}