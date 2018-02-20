/*
  Part of BrutusNEXT

  Container for user accounts.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../../server/lib/app/ServerApp", "../../../shared/lib/entity/NameList", "../../../shared/lib/entity/Entity", "../../../server/lib/entity/ServerEntities"], function (require, exports, ServerApp_1, NameList_1, Entity_1, ServerEntities_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Accounts {
        constructor() {
            // ----------------- Private data ---------------------
            // Account names that are temporarily marked as taken.
            this.nameLocks = new Set();
            // List of characters with unique names that are loaded in the memory.
            this.names = new NameList_1.NameList(Entity_1.Entity.NameCathegory.ACCOUNT);
        }
        // ------------- Public static methods ----------------
        // -> Returns 'true' on success.
        static add(account) {
            return ServerApp_1.ServerApp.accounts.names.add(account);
        }
        // -> Returns 'undefined' if entity 'name' isn't in the list.
        static get(name) {
            return ServerApp_1.ServerApp.accounts.names.get(name);
        }
        static has(name) {
            return ServerApp_1.ServerApp.accounts.names.has(name);
        }
        // Removes account from Accounts, but not from memory
        // (because it will stay in Entities).
        // -> Returns 'true' on success.
        static remove(account) {
            return ServerApp_1.ServerApp.accounts.names.remove(account);
        }
        // Sets account name as taken in the memory but doesn't create name lock
        // file. This is used when user entered a new account name but hasn't
        // provided a password yet, so account hasn't yet been created.
        static setSoftNameLock(name) {
            ServerApp_1.ServerApp.accounts.nameLocks.add(name);
        }
        // Removes a 'soft' lock on acount name.
        static removeSoftNameLock(name) {
            ServerApp_1.ServerApp.accounts.nameLocks.delete(name);
        }
        static isTaken(name) {
            return __awaiter(this, void 0, void 0, function* () {
                // First check if account is already online so we can save ourselves
                // reading from disk.
                if (ServerApp_1.ServerApp.accounts.names.has(name))
                    return true;
                // Also check for 'soft' name locks. This is used to prevent two
                // users to simultaneously create an account with the same name.
                if (ServerApp_1.ServerApp.accounts.nameLocks.has(name))
                    return true;
                return yield ServerEntities_1.ServerEntities.isEntityNameTaken(name, Entity_1.Entity.NameCathegory.ACCOUNT);
            });
        }
    }
    exports.Accounts = Accounts;
});
//# sourceMappingURL=Accounts.js.map