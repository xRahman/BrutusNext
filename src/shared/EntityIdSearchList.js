/*
  Part of BrutusNEXT

  Array for searching entity id by target strings (like 3.mob.orc)
*/
'use strict';
var ASSERT_1 = require('../shared/ASSERT');
///import {Id} from '../shared/Id';
/// Pozn: Pro herni entity bude se bude pouzivat AbbrevSearchList<Id>,
///       pro prikazy bud string (jmeno handleru), nebo primo funkce, ktera
///       prikaz zpracuje
class AbbrevSearchList {
    constructor() {
        // -------------- Protected class data ----------------
        // This hashmap maps abbreviations to the list of items (of type T)
        // corresponding to that abbreviation.
        this.myAbbrevs = {};
    }
    // ---------------- Public methods --------------------
    // Returns null if no such entity exists.
    //   Note: index and abbreviation must be passed separately. So if you want
    // to find 3.orc, you need to call getEntityByAbbreviation("orc", 3);
    getEntityByAbbrev(abbrev, index) {
        if (this.myAbbrevs[abbrev] === undefined)
            return null;
        return this.myAbbrevs[abbrev].getItemByIndex(index);
    }
    // This is used for adding names of rooms, items, characters, etc.
    //   If more similar names are added, they will be accessible by dot notation
    // (like 2.orc).
    addEntity(name, item) {
        // Add all possible abbreviations of name.
        for (let i = 0; i < name.length; i++)
            this.addItemToAbbrev(name.substring(0, i), item);
    }
    removeEntity(name, item) {
        // Remove all possible abbreviations of name.
        for (let i = 0; i < name.length; i++)
            this.removeItemFromAbbrev(name.substring(0, i), item);
    }
    // -------------- Protected methods -------------------
    addItemToAbbrev(abbreviation, item) {
        if (this.myAbbrevs[abbreviation] === undefined)
            this.myAbbrevs[abbreviation] = new AbbrevItemsList();
        this.myAbbrevs[abbreviation].addItem(item);
    }
    removeItemFromAbbrev(abbreviation, item) {
        ASSERT_1.ASSERT_FATAL(this.myAbbrevs[abbreviation] !== undefined, "Attempt to remove abbrev item for abbreviation that does not exist"
            + "in myAbbrevs");
        let numberOfItems = this.myAbbrevs[abbreviation].removeItem(item);
        // If there are no items left for this abbreviation, we can delete
        // the property from hashmap.
        if (numberOfItems === 0)
            delete this.myAbbrevs[abbreviation];
    }
}
exports.AbbrevSearchList = AbbrevSearchList;
// ---------------------- private module stuff -------------------------------
// List of items corresponding to a particular abbreviation.
class AbbrevItemsList {
    constructor() {
        // -------------- Protected class data ----------------
        this.myItems = [];
    }
    /// TODO: vyhledove mozna bude potreba metoda getItemByIndexVis()
    /// Ta asi bude muset postupne projit itemy, testovat, ktere jsou viditelne
    /// pro dorazujici se entitu a 'rucne' napocitat index.
    // ---------------- Public methods --------------------
    // Returns null if item is not found.
    getItemByIndex(index) {
        if (this.myItems[index] !== undefined)
            return this.myItems[index];
        else
            return null;
    }
    addItem(item) {
        this.myItems.push(item);
    }
    removeItem(item) {
        let index = this.myItems.indexOf(item);
        ASSERT_1.ASSERT_FATAL(index !== -1, "Attempt to remove item from AbbrevItemsList that does not exist in it");
        // Remove 1 item at index.
        this.myItems.splice(index, 1);
        return this.myItems.length;
    }
}
//# sourceMappingURL=EntityIdSearchList.js.map