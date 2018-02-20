/*
  Part of BrutusNEXT

  Server-side functionality related to login request packet.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../../shared/lib/error/ERROR", "../../../shared/lib/protocol/LoginRequest", "../../../server/lib/utils/ServerUtils", "../../../server/lib/account/AccountNameLock", "../../../shared/lib/entity/Entity", "../../../server/lib/entity/ServerEntities", "../../../server/lib/message/Message", "../../../server/lib/account/Account", "../../../server/lib/account/Accounts", "../../../shared/lib/protocol/LoginResponse", "../../../shared/lib/class/Classes"], function (require, exports, ERROR_1, LoginRequest_1, ServerUtils_1, AccountNameLock_1, Entity_1, ServerEntities_1, Message_1, Account_1, Accounts_1, LoginResponse_1, Classes_1) {
    /*
      Note:
        This class needs to use the same name as it's ancestor in /shared,
      because class name of the /shared version of the class is written to
      serialized data on the client and is used to create /server version
      of the class when deserializing the packet.
    */
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class LoginRequest extends LoginRequest_1.LoginRequest {
        constructor(email, password) {
            super(email, password);
            this.version = 0;
        }
        // ---------------- Public methods --------------------
        // ~ Overrides Packet.process().
        // -> Returns 'true' on success.
        process(connection) {
            return __awaiter(this, void 0, void 0, function* () {
                let passwordHash = ServerUtils_1.ServerUtils.md5hash(this.password);
                // If player has already been connected prior to this
                // login request (for example if she is logs in from different
                // computer or browser tab while still being logged in from
                // the old location), her Account is still loaded in memory
                // (because it is kept there as long as connection stays open).
                let account = this.findAccountInMemory();
                // In such case, we don't need to load account from disk but
                // we need to close the old connection and socket and also
                // possibly let the player know that her connection has just
                // been usurped.
                if (account)
                    return yield this.reconnect(passwordHash, account, connection);
                // If account 'doesn't exist in memory, we need to
                // load it from disk and connect to it.
                //   This also handles situation when user reloads
                // browser tab - browser closes the old connection
                // in such case so at the time user logs back the
                // server has already dealocated old account, connection
                // and socket.
                return yield this.login(passwordHash, connection);
            });
        }
        // --------------- Private methods --------------------
        // This should not be sent to user because it may may
        // return an error string that includes account entity id.
        obtainUserInfo(account) {
            let userInfo = account.getUserInfo();
            if (!userInfo)
                return account.getErrorIdString();
            return userInfo;
        }
        logReconnectSuccess(account) {
            this.logConnectionInfo(this.obtainUserInfo(account) + " has re-logged from different location");
        }
        logLoginSuccess(account) {
            this.logConnectionInfo(this.obtainUserInfo(account) + " has logged in");
        }
        sendErrorResponse(connection) {
            this.denyRequest({
                error: "[ERROR]: Failed to log in.\n\n" + Message_1.Message.ADMINS_WILL_FIX_IT
            }, connection);
        }
        // -> Returns 'false' on error.
        acceptRequest(account, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                let response = new LoginResponse_1.LoginResponse();
                if (!response.serializeAccount(account))
                    return false;
                connection.send(response);
                return true;
            });
        }
        denyRequest(problems, connection) {
            let response = new LoginResponse_1.LoginResponse();
            response.setProblems(problems);
            connection.send(response);
        }
        // -> Returns 'null' if account isn't loaded in memory.
        findAccountInMemory() {
            let account = Accounts_1.Accounts.get(this.email);
            if (!account)
                return null;
            return account;
        }
        sendWrongPasswordResponse(connection) {
            this.sendLoginProblemResponse("Incorrect password.", connection);
        }
        sendLoginProblemResponse(problem, connection) {
            this.denyRequest({ loginProblem: problem }, connection);
        }
        logWrongPasswordAttempt(userInfo) {
            this.logConnectionInfo("Bad PW: " + userInfo);
        }
        // -> Returns 'false' if error occurs.
        reconnect(passwordHash, account, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!account.isPasswordCorrect(passwordHash)) {
                    this.sendWrongPasswordResponse(connection);
                    this.logWrongPasswordAttempt(this.obtainUserInfo(account));
                    return false;
                }
                if (!(yield this.reconnectToAccount(passwordHash, account, connection))) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                if (!(yield this.acceptRequest(account, connection))) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                this.logReconnectSuccess(account);
                return true;
            });
        }
        // -> Returns 'false' if error occurs.
        reconnectToAccount(passwordHash, account, newConnection) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!account.isValid())
                    return false;
                let oldConnection = account.detachConnection();
                if (!oldConnection)
                    return false;
                oldConnection.announceReconnect();
                oldConnection.close();
                account.attachConnection(newConnection);
                return true;
            });
        }
        sendNoSuchAccountResponse(connection) {
            this.sendLoginProblemResponse("No account is registered for this e-mail address.", connection);
        }
        logNoSuchAccountExists(email, connection) {
            this.logConnectionInfo("Unregistered player (" + email + ") attempted to log in"
                + " from " + connection.getOrigin());
        }
        // -> Returns 'null' on failure.
        loadAccount(accountNameLock, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                let id = accountNameLock.id;
                if (!id) {
                    ERROR_1.ERROR("Missing or invalid '" + Entity_1.Entity.ID_PROPERTY + "'"
                        + " property in name lock file of account " + this.email + " "
                        + connection.getOrigin());
                    return null;
                }
                let account = yield ServerEntities_1.ServerEntities.loadEntityById(id, Account_1.Account);
                if (!account || !account.isValid())
                    return null;
                account.addToLists();
                return account;
            });
        }
        // -> Returns 'true' if the password is correct.
        isPasswordCorrect(accountNameLock, passwordHash) {
            return passwordHash === accountNameLock.passwordHash;
        }
        loadAccountNameLock() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield AccountNameLock_1.AccountNameLock.load(this.email, // Use 'email' as account name.
                Entity_1.Entity.NameCathegory[Entity_1.Entity.NameCathegory.ACCOUNT], false // Do not report 'not found' error.
                );
            });
        }
        loginAttempt(passwordHash, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                // Password hash is stored in account name lock file so we don't
                // need to load whole account in order to check password.
                let loadResult = yield this.loadAccountNameLock();
                if (loadResult === "FILE_DOES_NOT_EXIST")
                    return "NO_SUCH_ACCOUNT";
                if (loadResult === "ERROR")
                    return "ERROR";
                let accountNameLock = loadResult;
                if (!this.isPasswordCorrect(accountNameLock, passwordHash))
                    return "WRONG_PASSWORD";
                return yield this.connectToAccount(accountNameLock, connection);
            });
        }
        // -> Returns 'true' if error occurs.
        login(passwordHash, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                let loginResult = yield this.loginAttempt(passwordHash, connection);
                if (loginResult === "NO_SUCH_ACCOUNT") {
                    this.sendNoSuchAccountResponse(connection);
                    this.logNoSuchAccountExists(this.email, connection);
                    return false;
                }
                if (loginResult === "ERROR") {
                    this.sendErrorResponse(connection);
                    return false;
                }
                if (loginResult === "WRONG_PASSWORD") {
                    this.sendWrongPasswordResponse(connection);
                    this.logWrongPasswordAttempt(this.email);
                    return false;
                }
                let account = loginResult;
                // Load characters on account to memory so they will be
                // included in response. But don't load their contents
                // (items etc.) yet because user will only enter game with
                // one of them so we don't need keep this information in
                // memory for all of them.
                yield account.loadCharacters({ loadContents: false });
                if (!(yield this.acceptRequest(account, connection))) {
                    this.sendErrorResponse(connection);
                    return false;
                }
                this.logLoginSuccess(account);
                return true;
            });
        }
        // -> Returns 'null' on error.
        connectToAccount(accountNameLock, connection) {
            return __awaiter(this, void 0, void 0, function* () {
                let account = yield this.loadAccount(accountNameLock, connection);
                if (!account || !account.isValid())
                    return "ERROR";
                account.attachConnection(connection);
                return account;
            });
        }
    }
    exports.LoginRequest = LoginRequest;
    // This overwrites ancestor class.
    Classes_1.Classes.registerSerializableClass(LoginRequest);
});
//# sourceMappingURL=LoginRequest.js.map