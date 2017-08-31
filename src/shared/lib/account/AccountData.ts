/*
  Part of BrutusNEXT

  Shared account data.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Flags} from '../../../shared/lib/utils/Flags';
import {Account} from '../../../shared/lib/account/Account';
import {Character} from '../../../shared/game/character/Character';

export class AccountData extends Serializable
{
  constructor
  (
    private account: Account
  )
  {
    super();
  }

  // ----------------- Public data ----------------------

  // Last logged or created character on this account
  // (this character is selected when used enters charselect window).
  public lastActiveCharacter: Character = null;

  // List (hashmap) of characters on this account.
  public characters = new Map<string, Character>();

  /// Tohle je asi ok v /shared - ale jen ty flagy, které
  /// vykresluje klient (tj. třeba 'PEACEFUL' ano, systémové
  /// flagy ne).
  public flags = new Flags<AccountData.Flags>();

  // ---------------- Public methods --------------------

  public updateCharacterReference(character: Character)
  {
    if (!Entity.isValid(character))
    {
      ERROR("Attempt to update character reference on account"
        + " " + this.account.getErrorIdString() + " with"
        + " invalid character " + character.getErrorIdString());
      return;
    }

    if (!this.characters.has(character.getId()))
    {
      ERROR("Failed to update reference to character"
        + " " + character.getErrorIdString() + " on"
        + " account " + this.account.getErrorIdString()
        + " because the character doesn't exist on this"
        + " account. Reference is not updated");
      return;
    }

    this.characters.set(character.getId(), character);
  }
}

// ------------------ Type declarations ----------------------

export module AccountData
{
  export enum Flags
  {
  }
}