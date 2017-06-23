/*
  Part of BrutusNEXT

  Shared account data.
*/

'use strict';

import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Flags} from '../../../shared/lib/utils/Flags';

export class AccountData extends Serializable
{
  public static get MIN_ACCOUNT_NAME_LENGTH()
    { return  3;}
  public static get MAX_ACCOUNT_NAME_LENGTH()
    { return  20;}
  public static get MIN_PASSWORD_LENGTH()
    { return  4;}
  public static get MAX_PASSWORD_LENGTH()
    { return  50;}

  //------------------ Public data ----------------------

  /// Tohle je asi ok v /shared - ale jen ty flagy, které
  /// vykresluje klient (tj. třeba 'PEACEFUL' ano, systémové
  /// flagy ne).
  public flags = new Flags<AccountData.Flags>();

  // ---------------- Public methods --------------------
}

// ------------------ Type declarations ----------------------

export module AccountData
{
  export enum Flags
  {
  }
}