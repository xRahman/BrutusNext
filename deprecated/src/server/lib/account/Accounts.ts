export class Accounts extends NameList<Account>
{
  // ------------- Public static methods ---------------- 

  /// Merged with AuthProcessor.loadAccount()
  /*
  // -> Returns account loaded from disk.
  //    Returns null if account 'name' doesn't exist or couldn't be loaded.
  public static async loadAccount(name: string)
  {
    return await ServerApp.getAccounts().loadAccount(name);
  }
  */

  // ---------------- Public methods --------------------

  /// Merged with AuthProcessor.createAccount()
  /*
  public async createAccount
  (
    name: string,
    password: string,
    connection: Connection
  )
  : Promise<Account>
  {
    // /// This check would always fail, becuase we are using soft name
    // /// locks now. And it is also checked inside a createNamedEntity()
    // /// so this check here has been redundant anyways.
    // if (await this.exists(accountName))
    // {
    //   ERROR("Attempt to create account '" + accountName + "'"
    //     + " which already exists. Account is not created");
    //   return null;
    // }

    let account = ServerEntities.createInstance
    (
      Account,
      Account.name,
      name,
      Entity.NameCathegory.ACCOUNT
    );

    // Check if account has been created succesfully.
    // (it might not be true for example if unique name was already taken)
    if (account === null)
      return null;

    // This creates and assigns hash. Actual password is not remembered.
    account.setPasswordHash(password);
    account.connection = connection;

    this.add(account);

    // // Set newAccount.adminLevel to 5 if there are no other accounts on the
    // // disk (this needs to be done before newAcount is saved of course).
    // newAccount.firstAccountCheck();

    // console.log(account['_internalEntity'].name);
    // account.isValid();

    // Save the account info to the disk (so we know that the account exists).
    // (We don't need to wait for account to finish saving here, so no need
    // for await.)
    account.save();

    return account;
  }
  */

  /// Deprecated
  /*
  // -> Returns undefined if account isn't online or doesn't exist.
  public getAccountByName(name: string)
  {
    return this.getEntityByName(name);
  }
  */

  // ---------------- Private methods -------------------

  /// Merged with AuthProcessor.loadAccount()
  /*
  // -> Returns 'null' if account 'name' doesn't exist or couldn't be loaded.
  private async loadAccount(name: string)
  {
    if (this.has(name))
    {
      ERROR("Attempt to load account '" + name + "'"
        + " which is already loaded");
      return this.get(name);
    }

    let account = await Entities.loadEntityByName
    (
      Account, // Typecast.
      name,
      Entity.NameCathegory.ACCOUNT
    );

    // This also adds 'account' to Accounts.
    account.addToLists();

    return account;
  }
  */
}