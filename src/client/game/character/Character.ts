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

  // -> Returns 'false' on error.
  public enterWorld(move: Move)
  {
    if (this.data.getLocation() !== null)
    {
      ERROR("Attempt to enter world with character"
        + " " + this.getErrorIdString() + " which"
        + " already has a location. Location is not"
        + " changed");
      return false;
    }

    let destination =
      ClientEntities.get(move.destinationId);

    if (!destination || !destination.isValid())
    {
      ERROR("Unable to enter world with character"
        + " " + this.getErrorIdString() + " because"
        + " destination entity (id: " + move.destinationId + ")"
        + " isn't valid");
      return false;
    }

    let entityData = destination.dynamicCast(GameEntity).data;

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