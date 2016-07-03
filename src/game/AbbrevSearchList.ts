/*
  Part of BrutusNEXT

  Array for searching of substring in a list of strings.
  (used mainly for searching for abbreviations in commands
  like 'tell 3.orc Hello!')
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {GameEntity} from "../game/GameEntity";

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
  protected abbrevList: { [abbrev: string]: EntityList } = {};

  // ---------------- Public methods --------------------

  public isAbbrev(partialString: string, fullString: string): boolean
  {
    return fullString.indexOf(partialString) !== -1;
  }

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
        // From 0 to i + 1, because we don't want to add empty string and
        // we do want to add last character of the string (substring()
        // doesn't include right limit to the result).
        this.addEntityToAbbreviation(alias.substring(0, j + 1), entity);
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
        this.removeEntityFromAbbreviation(alias.substring(0, j), entity);
    }
  }

  // ---------------- Private methods --------------------

  private addEntityToAbbreviation(abbrev: string, entity: GameEntity)
  {
    let lowercaseAbbrev = abbrev.toLocaleLowerCase();

    if (this.abbrevList[lowercaseAbbrev] === undefined)
      this.abbrevList[lowercaseAbbrev] = new EntityList();

    this.abbrevList[lowercaseAbbrev].addEntity(entity);
  }

  private removeEntityFromAbbreviation(abbrev: string, entity: GameEntity)
  {
    let lowercaseAbbrev = abbrev.toLocaleLowerCase();

    ASSERT_FATAL(this.abbrevList[lowercaseAbbrev] !== undefined,
      "Attempt to remove abbrev item for abbreviation"
      + " '" + lowercaseAbbrev + "' that does not exist"
      + " in this.abbrevs");

    let numberOfItems = this.abbrevList[lowercaseAbbrev].removeEntity(entity);

    // If there are no items left for this abbreviation, we can delete
    // the property from hashmap.
    if (numberOfItems === 0)
      delete this.abbrevList[lowercaseAbbrev];
  }

  private mergeResults(entityLists: Array<EntityList>): Array<GameEntity>
  {
    let result: Array<GameEntity> = [];

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
    searchName: string,
    searchIndex: number,
    cathegory: number
  )
  : GameEntity
  {
    // Nothing can possibly match an empty, null or undefined searchName.
    if (!searchName)
      return null;

    // Split searchName into parts separated by underscores.
    let abbrevArray = searchName.split('_');

    // This array will store a list of entities that listen to each of
    // abbreviations contained in abbrevArray.
    let itemLists: Array<EntityList> = [];

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


     /*
  ////////// new version ///////////////////

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

  // ordered linked list
  protected aliasList: AliasNode = null;

  // ---------------- Public methods --------------------

  // The main search function.
  // Usage:
  //   target = searchList.search('2.orc_chieftain');
  public search(searchString: string): GameEntity
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

    return
    this.searchForEntity(parseResult.name, parseResult.index, cathegory);
  }

  public isAbbrev(partialString: string, fullString: string): boolean
  {
    return fullString.indexOf(partialString) !== -1;
  }

  // ---------------- Private methods --------------------

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

  private testAliasNode
  (
    abbrev: string,
    testedAliasNode: AliasNode,
    characterIndex: number
  )
    : { match: boolean, nextNode: AliasNode, newIndex: number }
  {
    let result = { match: false, nextNode: null, newIndex: characterIndex };

    if (!ASSERT(characterIndex >= 0 && characterIndex < abbrev.length,
      "character index has invalid value while searching for abbrev '"
      + abbrev + "'"))
      return result;

    // Test remaining characters of abbrev.
    for (let i = characterIndex; i < abbrev.length; i++)
    {
      if (abbrev[i] !== testedAliasNode.aliasWord[i])
      {
        if (!ASSERT(i < testedAliasNode.nextLetters.length,
            "attempt to index beyond the range of nextLetters array"
            + "of aliasNode '" + testedAliasNode.aliasWord + "'"))
          return result;

        // Set the next node to be searched in to the return value.
        result.nextNode = testedAliasNode.nextLetters[i];
        // And also update returned character index.
        result.newIndex = i;

        return result;
      }
    }

    // All characters of abbrev matched so we have found our match.
    result.match = true;

    // result.newIndex is not be updated, because it's not necessary. It won't
    // be used when we have found a match.
    return result;
  }

  private findFirstMatchingAliasWord(abbrev: string)
  : AliasNode
  {
    // If abbrev is empty or invalid string, nothing will match it.
    if (!abbrev)
      return null;

    // Start with first item in the list.
    let testedAliasNode = this.aliasList;
    // And with first character of tested abbrev.
    let characterIndex = 0;

    while (testedAliasNode !== null)
    {
      let result = this.testAliasNode(abbrev, testedAliasNode, characterIndex);

      if (result.match === true)
      {
        return testedAliasNode;
      }
      else
      {
        testedAliasNode = result.nextNode;
        characterIndex = result.newIndex;
      }
    }

    return null;
  }

  private searchForEntity
  (
    searchName: string,
    searchIndex: number,
    cathegory: number
  )
  : GameEntity
  {
    // Nothing can possibly match an empty, null or undefined searchName.
    if (!searchName)
      return null;

    // Split searchName into parts separated by underscores.
    let abbrevArray = searchName.split('_');
    // An array to store first alias nodes matching each of our keywords.
    // (We know how big the array should be, so let's alocate the memory
    // in advance to prevent unecessary realocations.)
    let aliasNodes = new Array<AliasNode>(abbrevArray.length);

    for (let i = 0; i < abbrevArray.length; i++)
    {
      aliasNodes[i] = this.findFirstMatchingAliasWord(abbrevArray[0]);

      // If any of partial abbreviations (like 'orc' in 'black_orc') doesn't
      // match anything, the whole search is a miss.
      if (aliasNodes[i] === null)
        return null;
    }

    // Now we have matching alias word for each of our partial abbreviations
    // and we have to traverse the list of aliasNodes, check for visibility
    // and cathegory and also count searchIndex valid matches (because when
    // we search for 2.orc, it means second match that passes all visibility
    // and cathegory checks).
    return
      this.traverseKeywords(abbrevArray, aliasNodes, searchIndex, cathegory);
  }

  private matchOtherKeywords
  (
    testedFirstAliasNode: AliasNode,
    abbrevArray: Array<string>,
    aliasNodes: Array<AliasNode>
  )
  : Array<AliasNode>
  {
    
  }

  private checkAliasNode()
  : GameEntity
  {
    // Each alias node has an array of entities that listen to test
    // keyword. We will go through them here.
    for (let i = 0; i < testedFirstAliasNode.entities.length; i++)
    {
      // If the serch string contained more than one keyword abbreviation
      // (e.g 'gray_orc', which targets two alias words, 'gray' and 'orc'),
      // we need to match all of them.
      if (aliasNodes.length > 1)
      {
        aliasNodes = this.matchOtherKeywords
          (
          testedFirstAliasNode,
          abbrevArray,
          aliasNodes
          );

        // If we didn't find a match for all keywords, whole search is
        // is a miss.
        if (aliasNodes === null)
          return null;
      }
  }

  private findNextMatchingEntity
  (
    abbrevArray: Array<string>,
    aliasNodes: Array<AliasNode>,
    cathegory: number
  )
  : GameEntity
  {
    if (!ASSERT(aliasNodes.length > 0,
        "There must be at leas one alias node to process."))
      return;

    // Start with the first alias node that we know matches our first
    // keyword.
    let testedFirstAliasNode = aliasNodes[0];
    let result = null;

    // Here we will traverse the linked list of alias nodes, until we
    // find a match for all keywords or we get to alias which no longer
    // satisfies the first keyword or until we run to the end of the
    // list (in that case testedFirstAliasNode will be null).
    while (testedFirstAliasNode !== null)
    {
      // If first keyword no longer matches that stored in tested node,
      // our search is a miss.
      if (!this.isAbbrev(abbrevArray[0], testedFirstAliasNode.aliasWord))
        return null;

      result = this.checkAliasNode(aliasNodes);

      if (result !== null)
        return result;

      testedFirstAliasNode = testedFirstAliasNode.nextAliasNode;
    }

    return null;
  }

  private traverseKeywords
  (
    abbrevArray: Array<string>,
    aliasNodes: Array<AliasNode>,
    searchIndex: number,
    cathegory: number
  )
  : GameEntity
  {
    if (!ASSERT(abbrevArray.length == aliasNodes.length,
      "Array of searched alias abbreviations needs to be of the same length"
      + "as array of respective aliasNodes."))
      return null;

    if (searchIndex < 1)
      return null;

    let candidate: GameEntity = null;

    // We need to find number of valid candidates equal to searchIndex.
    for (let i = 0; i < searchIndex; i++)
    {
      // Find next entity that matches all required keywords and conditions.
      candidate =
        this.findNextMatchingEntity(abbrevArray, aliasNodes, cathegory);

      if (candidate === null)
        return null;


      // TODO: Check for visibility, cathegory, etc.
    }

    // We have found number of matching candidates equal to searchIndex.
    // The last one of the is our match.
    return candidate;
  }

//////////////////////////////////////////////////////////////////
*/
}

// ---------------------- private module stuff -------------------------------

// List of entityIds corresponding to a particular abbreviation.
class EntityList
{
  // -------------- Public class data ----------------

  public entities: Array<GameEntity> = [];

  // ---------------- Public methods --------------------

  public contains(entity: GameEntity): boolean
  {
    return this.entities.indexOf(entity) !== -1;
  }

  public addEntity(item: GameEntity)
  {
    this.entities.push(item);
  }

  public removeEntity(item: GameEntity): number
  {
    let index = this.entities.indexOf(item);

    ASSERT_FATAL(index !== -1,
      "Attempt to remove item from AbbrevItemsList that does not exist in it");

    // Remove 1 item at index.
    this.entities.splice(index, 1);

    return this.entities.length;
  }
}


/*
// One node of linked list of entity aliases.
// Contains a single alias word and an array of entities that listen to it.
class AliasNode
{

  public aliasWord = "";

  public nextAliasNode: AliasNode = null;

  // Direct link to nodes that 
  // Example:
  //   If you have three entities, aliased 'orc', 'orca' and 'raven',
  // AliasNode 'orc' would have following nextLetters:
  // [^raven, ^raven, ^raven]
  // (^raven means refference to the node 'raven')
  //   If you now search for example '1.ra', you start with first letter
  // of first node ('orc') and compare it to the first letter of search string.
  //   If it doesn't match, you jump to the refference on first index in
  // nextLetters, because it's the next alias that doesn't have 'o' as the
  // first letter.
  //   If the first letter matched, you compare second letter of search string
  // with second letter of alias word (and you jump to second refference in
  // nextLetters in case of missmatch), etc.
  public nextLetters: AliasNode[] = [];

  // Array of entities that listen to this alias word, in the same order in
  // which the entities were added (to the room, world or whatever container
  // that the particular AbbrevSearchList belongs to).
  // Usage example:
  //   When you use search string like '2.orc', you match 'orc' to it
  // and then you access second index of entityIds of node 'orc'
  // to get your second orc.
  public entities: GameEntity[];
}
*/