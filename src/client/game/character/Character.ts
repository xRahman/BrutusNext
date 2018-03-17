/*
  Part of BrutusNEXT

  Client-side character.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Classes} from '../../../shared/lib/class/Classes';
import {Entity} from '../../../shared/lib/entity/Entity';
import {GameEntity} from '../../../client/game/GameEntity';
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
import {CharacterData} from '../../../shared/game/character/CharacterData';
import {Move} from '../../../shared/lib/protocol/Move';

export class Character extends GameEntity
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public data: CharacterData = new CharacterData(this);

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  // ---------------- Public methods --------------------

  // ! Throws an exception on error.
  // -> Returns 'false' on error.
  public enterWorld(move: Move)
  {
    if (this.data.getLocation() !== null)
    {
      throw new Error
      (
        "Attempt to enter world with character"
        + " " + this.getErrorIdString() + " which"
        + " already has a location. Location is not"
        + " changed"
      );
    }

    /// TODO: Tohle už je podruhé co hledám char s tím, že musí existovat.
    /// Asi bych na to měl vyrobit fci přímo v Entities.

    let destination = ClientEntities.getEntity(move.destinationId);
    let entityData = destination.dynamicCast(GameEntity).data;

    /// TODO: Co je sakra 'entityData'?
    if (!entityData)
    {
      ERROR("Invalid entity data on entity " + destination.getErrorIdString());
      return false;
    }

    entityData.insert(this);

    return true;
  }

  // ---------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Character);