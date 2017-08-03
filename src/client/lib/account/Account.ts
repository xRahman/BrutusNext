/*
  Part of BrutusNEXT

  Client-side player account.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {Attributes} from '../../../shared/lib/class/Attributes';
import {Classes} from '../../../shared/lib/class/Classes';
import {Entity} from '../../../shared/lib/entity/Entity';
import {AccountData} from '../../../shared/lib/account/AccountData';

export class Account extends Entity
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public data = new AccountData(this);

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods --------------------
}

Classes.registerEntityClass(Account);