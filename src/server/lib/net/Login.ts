/*
  Part of BrutusNEXT

  Login.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/net/Connection';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';

export class Login
{
  // ----------------- Public data ----------------------

  // ----------------- Private data ---------------------

  // --------------- Public accessors -------------------

  // ------------- Public static methods ----------------

  public static async processRequest
  (
    request: LoginRequest,
    connection: Connection
  )
  {
    if (connection.account !== null)
    {
      ERROR("Login request is triggered on connection that has"
        + " account (" + connection.account.getErrorIdString() + ")"
        + " attached to it. Login request can only be processed"
        + " on connection with no account attached yet. Request"
        + " is not processed");
      return;
    }

    // E-mail address is used as account name but it needs
    // to be encoded first so it can be used as file name.
    let accountName = Utils.encodeEmail(request.email);
    let password = request.password;

    // If player has already been connected prior to this
    // login request (for example if she logs in from different
    // computer or browser tab while still being logged-in from
    // the old location), her Account is still loaded in memory
    // (because it is kept there as long as connection stays open).
    //   In such case, we don't need to load account from disk
    // (because it's already loaded) but we need to close the
    // old connection and socket (if it's still open) and also
    // possibly let the player know that her connection has been
    // usurped.
    if (this.reconnectToAccount(accountName, password, connection))
      return;

    // If account 'accountName' doesn't exist in memory,
    // we need to load it from disk and connect to it.
    // This also handles situation when user reloads
    // browser tab - browser closes the old connection
    // in such case so at the time user logs back in
    // server has already dealocated old account, connection
    // and socket.
    await this.connectToAccount(accountName, password, connection);
  }

  // ------------- Private static methods ---------------

  // ---------------- Public methods --------------------

  // --------------- Private methods --------------------

  private static acceptRequest(account: Account, connection: Connection)
  {
    let response = new LoginResponse();
    response.result = LoginResponse.Result.OK;
    
    // Add newly create account to the response.
    response.account.serializeEntity
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );

    connection.send(response);
  }

  private static denyRequest
  (
    problem: string,
    result: LoginResponse.Result,
    connection: Connection
  )
  {
    let response = new LoginResponse();

    response.result = result;
    response.problem = problem;

    connection.send(response);
  }

  private static authenticate
  (
    account: Account,
    password: string,
    connection: Connection
  )
  : boolean
  {
    if (!account.validatePassword(password))
      return false;

    this.denyRequest
    (
      "Incorrect password.",
      LoginResponse.Result.INCORRECT_PASSWORD,
      connection
    );

    return true;
  }

  private static reconnectToAccount
  (
    accountName: string,
    password: string,
    connection: Connection
  )
  {
    // Check if account is already loaded in memory.
    let account = Accounts.get(accountName);

    if (!account)
      return false;

    if (!this.authenticate(account, password, connection))
      return false;

    if (!account.getConnection())
    {
      // This should never happen.
      ERROR("Invalid connection on account " + account.getErrorIdString());
      return;
    }

    // Let the old connection know that is has been usurped
    // (we don't have to worry about not sending this message
    //  when player just reloads her broswer tab, because in
    //  that case browser closes the old connection so the serves
    //  has already dealocated the account so connectToAccount()
    //  has been called rather than reconnectToAccount().
    account.getConnection().announceReconnect();

    account.detachConnection().close();
    account.attachConnection(connection);

    this.acceptRequest(account, connection);

    return true;
  }

  private static async connectToAccount
  (
    accountName: string,
    password: string,
    connection: Connection
  )
  {
    let account = await ServerEntities.loadEntityByName
    (
      Account,  // Typecast.
      accountName,
      Entity.NameCathegory.ACCOUNT,
      false     // Do not report 'not found' error.
    );

    if (account === undefined)
    {
      this.denyRequest
      (
        "No account is registered for this e-mail address.",
        LoginResponse.Result.UNKNOWN_EMAIL,
        connection
      );
      return;
    }

    if (account === null)
    {
      this.denyRequest
      (
        "[ERROR]: Failed to load account.\n\n"
          + Message.ADMINS_WILL_FIX_IT,
        LoginResponse.Result.FAILED_TO_LOAD_ACCOUNT,
        connection
      );
      return;
    }

    if (!this.authenticate(account, password, connection))
      return;

    account.attachConnection(connection);

    this.acceptRequest(account, connection);
  }
}
