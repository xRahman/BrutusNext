/*
  Part of BrutusNEXT

  Server-side functionality related to character creation request packet.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../../shared/lib/error/ERROR", "../../../shared/lib/utils/Utils", "../../../shared/lib/protocol/ChargenRequest", "../../../server/lib/admin/Admins", "../../../server/game/character/Characters", "../../../server/lib/message/Message", "../../../shared/lib/protocol/ChargenResponse", "../../../shared/lib/class/Classes"], function (require, exports, ERROR_1, Utils_1, ChargenRequest_1, Admins_1, Characters_1, Message_1, ChargenResponse_1, Classes_1) {
    /*
      Note:
        This class needs to use the same name as it's ancestor in /shared,
      because class name of the /shared version of the class is written to
      serialized data on the client and is used to create /server version
      of the class when deserializing the packet.
    */
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ChargenRequest extends ChargenRequest_1.ChargenRequest {
        constructor(characterName) {
            super(characterName);
            this.version = 0;
        }
        // ---------------- Public methods --------------------
        // ~ Overrides Packet.process().
        // -> Returns 'true' on success.
        process(connection) {
            return __awaiter(this, void 0, void 0, function* () {
                this.normalizeCharacterName(connection);
                let problems = this.checkForProblems();
                if (problems) {
                    this.denyRequest(problems, connection);
                    return false;
                }
                if (!(yield this.isNameAvailable())) {
                    this.sendNameIsNotAvailableResponse(connection);
                    this.logNameIsNotAvailable(connection);
                    return false;
                }
                let account = this.obtainAccount(connection);
                if (!account) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                let character = yield this.createCharacter(account, connection);
                if (!character) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                if (!this.acceptRequest(character, account, connection)) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                this.logSuccess(character, account);
                return true;
            });
        }
        // --------------- Private methods --------------------
        obtainAccount(connection) {
            let account = connection.getAccount();
            if (!account || !account.isValid()) {
                ERROR_1.ERROR("Failed to process chargen request: Invalid account");
                return null;
            }
            return account;
        }
        normalizeCharacterName(connection) {
            this.characterName = Utils_1.Utils.uppercaseFirstLowercaseRest(this.characterName);
        }
        sendErrorResponse(connection) {
            const problems = {
                error: "[ERROR]: Failed to create character.\n\n"
                    + Message_1.Message.ADMINS_WILL_FIX_IT
            };
            this.denyRequest(problems, connection);
        }
        // -> Returns 'null' on failure.
        createCharacter(account, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.characterName) {
                    ERROR_1.ERROR("Invalid 'characterName' in chargen request");
                    return null;
                }
                let character = yield account.createCharacter(this.characterName);
                if (!character || !character.isValid())
                    return null;
                Admins_1.Admins.onCharacterCreation(character);
                return character;
            });
        }
        isNameAvailable() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.characterName)
                    return false;
                /// TODO: Časem asi nějaké přísnější testy - například nepovolit jméno,
                ///   když existuje jeho hodně blízký prefix.
                /// (tzn otestovat abbreviations od
                ///  ChargenRequest.MIN_CHARACTER_NAME_LENGTH
                ///  do name.length - 1).
                /// Asi taky nepovolit slovníková jména.
                if (yield Characters_1.Characters.isTaken(this.characterName))
                    return false;
                return true;
            });
        }
        sendCharacterNameProblemResponse(problem, connection) {
            this.denyRequest({ characterNameProblem: problem }, connection);
        }
        sendNameIsNotAvailableResponse(connection) {
            this.denyRequest({ characterNameProblem: "Sorry, this name is not available." }, connection);
        }
        logNameIsNotAvailable(connection) {
            this.logConnectionInfo("User " + connection.getUserInfo() + " has attempted"
                + " to create new character using existing name"
                + " (" + this.characterName + ")");
        }
        // -> Returns 'true' on success.
        acceptRequest(character, account, connection) {
            let response = new ChargenResponse_1.ChargenResponse();
            if (!response.serializeAccount(account))
                return false;
            if (!response.serializeCharacter(character))
                return false;
            connection.send(response);
            return true;
        }
        logSuccess(character, account) {
            this.logSystemInfo("Player " + account.getEmail() + " has created"
                + " a new character: " + character.getName());
        }
        denyRequest(problems, connection) {
            let response = new ChargenResponse_1.ChargenResponse();
            response.setProblems(problems);
            connection.send(response);
        }
    }
    exports.ChargenRequest = ChargenRequest;
    // This overwrites ancestor class.
    Classes_1.Classes.registerSerializableClass(ChargenRequest);
});
//# sourceMappingURL=ChargenRequest.js.map