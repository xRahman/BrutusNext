/*
  Part of BrutusNEXT

  Shared account data.
*/

'use strict';

///import {Attributes} from '../../../shared/lib/class/Attributes';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Flags} from '../../../shared/lib/utils/Flags';

export class AccountData extends Serializable
{
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