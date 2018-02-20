/*
  Part of BrutusNEXT

  Server-side functionality related to character selection request packet.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../../shared/lib/error/ERROR", "../../../server/lib/message/Message", "../../../shared/lib/protocol/EnterGameRequest", "../../../shared/lib/protocol/EnterGameResponse", "../../../server/lib/entity/ServerEntities", "../../../server/game/character/Character", "../../../shared/lib/class/Classes"], function (require, exports, ERROR_1, Message_1, EnterGameRequest_1, EnterGameResponse_1, ServerEntities_1, Character_1, Classes_1) {
    /*
      Note:
        This class needs to use the same name as it's ancestor in /shared,
      because class name of the /shared version of the class is written to
      serialized data on the client and is used to create /server version
      of the class when deserializing the packet.
    */
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class EnterGameRequest extends EnterGameRequest_1.EnterGameRequest {
        constructor(characterId) {
            super(characterId);
            this.version = 0;
        }
        // ---------------- Public methods --------------------
        // ~ Overrides Packet.process().
        // -> Returns 'true' on success.
        process(connection) {
            return __awaiter(this, void 0, void 0, function* () {
                let account = this.obtainAccount(connection);
                let character = this.obtainCharacter(connection);
                if (!account || !character) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                let characterMove = this.enterWorld(character);
                let loadLocation = this.obtainLoadLocation(character, connection);
                if (!characterMove || !loadLocation) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                // Character will be selected when user enters charselect window.
                account.data.lastActiveCharacter = character;
                this.acceptRequest(loadLocation, characterMove, connection);
                this.logSuccess(character, account);
                return true;
            });
        }
        // --------------- Private methods --------------------
        obtainAccount(connection) {
            let account = connection.getAccount();
            if (!account || !account.isValid()) {
                ERROR_1.ERROR("Failed to process enter game request: Invalid account");
                return null;
            }
            return account;
        }
        obtainCharacter(connection) {
            // Character should already be loaded at this time
            // (all characters are loaded when account is loaded)
            // so we just request it from Entities.
            let character = ServerEntities_1.ServerEntities.get(this.characterId);
            if (!character || !character.isValid()) {
                ERROR_1.ERROR("Failed to process enter game request: Invalid 'character'");
                return null;
            }
            return character.dynamicCast(Character_1.Character);
        }
        enterWorld(character) {
            let characterMove = character.enterWorld();
            if (!characterMove) {
                ERROR_1.ERROR("Failed to process enter game request: Invalid 'characterMove'");
                return null;
            }
            return characterMove;
        }
        obtainLoadLocation(character, connection) {
            if (!character)
                return null;
            let loadLocation = character.getLoadLocation();
            if (!loadLocation || !loadLocation.isValid()) {
                ERROR_1.ERROR("Failed to process enter game request: Invalid 'loadLocation'");
                return null;
            }
            return loadLocation;
        }
        sendErrorResponse(connection) {
            const problems = {
                error: "[ERROR]: Failed to enter game.\n\n" + Message_1.Message.ADMINS_WILL_FIX_IT
            };
            this.denyRequest(problems, connection);
        }
        denyRequest(problems, connection) {
            let response = new EnterGameResponse_1.EnterGameResponse();
            response.setProblems(problems);
            connection.send(response);
        }
        acceptRequest(loadLocation, characterMove, connection) {
            let response = new EnterGameResponse_1.EnterGameResponse();
            response.characterMove = characterMove;
            response.serializeLoadLocation(loadLocation);
            connection.send(response);
        }
        logSuccess(character, account) {
            this.logSystemInfo("Player " + account.getEmail() + " has entered"
                + " game as " + character.getName());
        }
    }
    exports.EnterGameRequest = EnterGameRequest;
    // This overwrites ancestor class.
    Classes_1.Classes.registerSerializableClass(EnterGameRequest);
});
//# sourceMappingURL=EnterGameRequest.js.map