/*
  Part of BrutusNEXT

  Area (a set of Rooms).

  Area is inherited from Sector, because it basically is a set of
  immutable rooms with defined connections to other areas.
*/
define(["require", "exports", "../../../server/game/GameEntity", "../../../shared/lib/class/Classes"], function (require, exports, GameEntity_1, Classes_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Area extends GameEntity_1.GameEntity {
        constructor() {
            super();
            // Don't forget to bump up version number if you add or remove
            // SaveableObjects. You will also need to convert data in respective
            // .json files to conform to the new version.
            this.version = 0;
        }
        // --------------- Public accessors -------------------
        // -------------- Protected accessors -----------------
        ///protected static get SAVE_DIRECTORY() { return "./data/areas/"; }
        // ---------------- Public methods --------------------
        /// Pozn: Area tu nic nemá, protože je zděděná ze Sectoru, kde
        ///  je veškerá funkcionalita. Možná to nakonec bude jinak...
        // ---------------- Protected data --------------------
        // --------------- Protected methods ------------------
        // ~ Overrides Entity.addToNameLists().
        addToNameLists() {
            /// TODO
        }
        // ~ Overrides Entity.addToAbbrevLists().
        addToAbbrevLists() {
            /// TODO
        }
        // ~ Overrides Entity.removeFromNameLists().
        removeFromNameLists() {
            /// TODO
        }
        // ~ Overrides Entity.removeFromAbbrevLists().
        removeFromAbbrevLists() {
            /// TODO
        }
    }
    exports.Area = Area;
    Classes_1.Classes.registerEntityClass(Area);
});
//# sourceMappingURL=Area.js.map