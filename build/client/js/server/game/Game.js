/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../shared/lib/error/ERROR", "../../shared/lib/error/FATAL_ERROR", "../../shared/lib/entity/Entity", "../../server/lib/entity/ServerEntities", "../../server/lib/app/ServerApp", "../../server/game/character/Characters", "../../server/game/world/World", "../../server/game/search/AbbrevList"], function (require, exports, ERROR_1, FATAL_ERROR_1, Entity_1, ServerEntities_1, ServerApp_1, Characters_1, World_1, AbbrevList_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // TEST:
    ///import {Script} from '../../server/lib/prototype/Script';
    class Game {
        constructor() {
            // ---------------- Protected data --------------------
            // -------- idLists ---------
            // IdLists only contain entity id's (instances of
            // all entities are owned by Server.idProvider).
            // List of ids of all characters in game.
            // (Also handles creating of new characters).
            this.characters = new Characters_1.Characters();
            // List of ids of all rooms in game.
            this.rooms = new AbbrevList_1.AbbrevList();
            // List of ids of all areas in game.
            this.areas = new AbbrevList_1.AbbrevList();
            // List of ids of all realms in game.
            this.realms = new AbbrevList_1.AbbrevList();
            // --- Direct references ---
            // There is only one world in the game (at the moment).
            this.world = null;
            // --------------- Protected methods ------------------
            // ---------------- Private methods -------------------
        }
        static get DEFAULT_WORLD_NAME() { return 'BrutusNext World'; }
        static get characters() {
            return ServerApp_1.ServerApp.game.characters;
        }
        static get rooms() {
            return ServerApp_1.ServerApp.game.rooms;
        }
        static get areas() {
            return ServerApp_1.ServerApp.game.areas;
        }
        static get realms() {
            return ServerApp_1.ServerApp.game.realms;
        }
        static get world() {
            return ServerApp_1.ServerApp.game.world;
        }
        // ------------- Public static methods ----------------
        // ---------------- Public methods --------------------
        // Creates and saves a new default world.
        // (this method sould only be used if you don't have 'data' directory yet)
        createDefaultWorld() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.world !== null) {
                    ERROR_1.ERROR("World already exists");
                    return;
                }
                this.world = yield ServerEntities_1.ServerEntities.createInstanceEntity(World_1.World, // Typecast.
                World_1.World.name, // Prototype name.
                Game.DEFAULT_WORLD_NAME, Entity_1.Entity.NameCathegory.WORLD);
                if (this.world === null) {
                    ERROR_1.ERROR("Failed to create default world");
                    return;
                }
                // Create system realm (and it's contents).
                yield this.world.createSystemRealm();
                // Save the world we have just created.
                yield ServerEntities_1.ServerEntities.save(this.world);
            });
        }
        // Loads initial state of the game from disk.
        load() {
            return __awaiter(this, void 0, void 0, function* () {
                // Load current state of world from file.
                this.world = yield ServerEntities_1.ServerEntities.loadEntityByName(World_1.World, // Dynamic typecast.
                Game.DEFAULT_WORLD_NAME, Entity_1.Entity.NameCathegory.WORLD);
                if (!this.world)
                    FATAL_ERROR_1.FATAL_ERROR("Failed to load game world. Perhaps"
                        + " directory" + ServerApp_1.ServerApp.DATA_DIRECTORY
                        + " exists but it is empty?");
            });
        }
    }
    exports.Game = Game;
});
//# sourceMappingURL=Game.js.map