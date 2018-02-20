/*
  Part of BrutusNEXT

  Container managing all characters.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../../shared/lib/entity/Entity", "../../../server/lib/entity/ServerEntities", "../../../server/game/search/AbbrevList", "../../../server/game/Game", "../../../shared/lib/entity/NameList"], function (require, exports, Entity_1, ServerEntities_1, AbbrevList_1, Game_1, NameList_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Characters {
        constructor() {
            // ----------------- Private data ---------------------
            // List of characters with unique names that are loaded in the memory.
            this.names = new NameList_1.NameList(Entity_1.Entity.NameCathegory.CHARACTER);
            // Abbrevs of all online characters including those without unique names.
            this.abbrevs = new AbbrevList_1.AbbrevList();
            // ---------------- Public methods --------------------
            /// Merged with Account.createCharacter().
            /*
            public async createUniqueCharacter
            (
              name: string,
              connection: Connection
            )
            : Promise<Character>
            {
              let character = await ServerEntities.createInstance
              (
                Character,
                Character.name,
                name,
                Entity.NameCathegory.CHARACTER
              );
          
              // Check if character has been created succesfully.
              // (it might not be true for example if unique name was already taken)
              if (character === null)
                return null;
          
              character.atachConnection(connection);
              
              this.add(character);
          
              // Save the character to the disk.
              await ServerEntities.save(character);
          
              return character;
            }
            */
            /// Merged with MenuProcessor.loadCharacter().
            /*
            // -> Returns character loaded from disk.
            //    Returns null if character 'name' doesn't exist or couldn't be loaded.
            public async loadCharacter(name: string)
            {
              let character = await super.loadNamedEntity
              (
                name,
                NamedEntity.NameCathegory.characters
              );
          
              return character;
            }
            */
            // ---------------- Protected data --------------------
            // -------------- Protected methods -------------------
        }
        // ------------- Public static methods ---------------- 
        // -> Returns 'true' on success.
        static add(character) {
            return Game_1.Game.characters.names.add(character);
        }
        // -> Returns 'undefined' if entity 'name' isn't in the list.
        static get(name) {
            return Game_1.Game.characters.names.get(name);
        }
        // Removes character from Characters, but not from memory.
        // -> Returns 'true' on success.
        static remove(character) {
            return Game_1.Game.characters.names.remove(character);
        }
        static isTaken(name) {
            return __awaiter(this, void 0, void 0, function* () {
                // First check if character is already online.
                if (Game_1.Game.characters.names.has(name))
                    return true;
                return yield ServerEntities_1.ServerEntities.isEntityNameTaken(name, Entity_1.Entity.NameCathegory.CHARACTER);
            });
        }
    }
    exports.Characters = Characters;
});
//# sourceMappingURL=Characters.js.map