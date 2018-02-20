/*
  Part of BrutusNEXT

  Relm (a set of Areas).
*/
define(["require", "exports", "../../../server/game/GameEntity", "../../../shared/lib/class/Classes"], function (require, exports, GameEntity_1, Classes_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Realm extends GameEntity_1.GameEntity {
        constructor() {
            super();
            // Don't forget to bump up version number if you add or remove
            // SaveableObjects. You will also need to convert data in respective
            // .json files to conform to the new version.
            this.version = 0;
        }
        // --------------- Public accessors -------------------
        // -------------- Protected accessors -----------------
        ///protected static get SAVE_DIRECTORY() { return "./data/realms/"; }
        // ---------------- Public methods --------------------
        /// Momentálně se to nikde nevolá, tak to nebudu řešit.
        /*
        public createArea(param: { name: string, prototype: string }): EntityId
        {
          let newAreaId = this.createEntity
          (
            {
              name: param.name,
              prototype: param.prototype,
              idList: Game.areas
            }
          );
      
          // Add new area id to the list of entities contained in this realm.
          this.insertEntity(newAreaId);
      
          return newAreaId;
        }
        */
        // ---------------- Protected data --------------------
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
    exports.Realm = Realm;
    Classes_1.Classes.registerEntityClass(Realm);
});
//# sourceMappingURL=Realm.js.map