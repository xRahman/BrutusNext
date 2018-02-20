/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../../shared/lib/entity/Entity", "../../../server/lib/entity/ServerEntities", "../../../server/game/GameEntity", "../../../server/game/world/Realm", "../../../server/game/world/Area", "../../../server/game/world/Room", "../../../shared/lib/class/Classes"], function (require, exports, Entity_1, ServerEntities_1, GameEntity_1, Realm_1, Area_1, Room_1, Classes_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class World extends GameEntity_1.GameEntity {
        // ---------------- Protected data --------------------
        constructor() {
            super();
            // --------------- Public accessors -------------------
            // -------------- Protected accessors -----------------
            ///protected static get SAVE_DIRECTORY() { return "./data/"; }
            // ----------------- Public data ----------------------
            this.systemRealm = null;
            this.systemArea = null;
            this.systemRoom = null;
            // The room newly created player characters spawn to.
            this.tutorialRoom = null;
            // Don't forget to bump up version number if you add or remove
            // SaveableObjects. You will also need to convert data in respective
            // .json files to conform to the new version.
            this.version = 0;
        }
        // ---------------- Public methods --------------------
        createSystemRealm() {
            return __awaiter(this, void 0, void 0, function* () {
                this.systemRealm = yield ServerEntities_1.ServerEntities.createInstanceEntity(Realm_1.Realm, // Typecast.
                Realm_1.Realm.name, // Prototype name.
                'System Realm', Entity_1.Entity.NameCathegory.WORLD);
                // Even though we keep direct reference to systemRealm, we stil
                // need to add it to our contents so it's correctly saved, etc.
                this.insert(this.systemRealm);
                // --- System Area ---
                this.systemArea = yield ServerEntities_1.ServerEntities.createInstanceEntity(Area_1.Area, // Typecast.
                Area_1.Area.name, // Prototype name.
                'System Area', Entity_1.Entity.NameCathegory.WORLD);
                // Add System Area to contents of System Realm.
                this.systemRealm.insert(this.systemArea);
                // --- System Room ---
                this.systemRoom = yield ServerEntities_1.ServerEntities.createInstanceEntity(Room_1.Room, // Typecast.
                Room_1.Room.name, // Prototype name.
                'System Room', Entity_1.Entity.NameCathegory.WORLD);
                // Add System Room to contents of System Area.
                this.systemArea.insert(this.systemRoom);
                // --- Tutorial Room ---
                this.tutorialRoom = yield ServerEntities_1.ServerEntities.createInstanceEntity(Room_1.Room, // Typecast.
                Room_1.Room.name, // Prototype name.
                'Tutorial Room', Entity_1.Entity.NameCathegory.WORLD);
                // Add Tutorial Room to contents of System Area.
                this.systemArea.insert(this.tutorialRoom);
            });
        }
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
    exports.World = World;
    Classes_1.Classes.registerEntityClass(World);
});
//# sourceMappingURL=World.js.map