/*
  Part of BrutusNEXT

  Shared account interface.
*/

'use strict';

import {Entity} from '../../../shared/lib/entity/Entity';
import {AccountData} from '../../../shared/lib/account/AccountData';

export interface Account extends Entity
{
  data: AccountData;
}