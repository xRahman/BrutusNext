/*
  Part of BrutusNEXT

  Adds ability to seach using abbreviations of aliases.
*/

'use strict';

import {EntityId} from '../shared/EntityId';
import {IdList} from '../shared/IdList';
import {AbbrevSearchList} from '../game/AbbrevSearchList';
import {GameEntity} from '../game/GameEntity';

export class IdSearchList extends IdList
{
  // -------------- Private class data ----------------

  private abbrevSearchList = new AbbrevSearchList();
  // Flag saying that abbrevSearchList is not to be saved to JSON.
  private static abbrevSearchList = { isSaved: false };

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public addEntity(entity: GameEntity)
  {
    super.addEntity(entity);

    // Add all aliases of this entity to abbrevSearchList.
    this.abbrevSearchList.addEntity(entity);
  }

  // Removes entity id from this list, but doesn't delete the entity from
  // the game.
  public removeFromList(entityId: EntityId)
  {
    let entity = entityId.getEntity({ typeCast: GameEntity });

    // Remove all aliases of this entity from abbrevSearchList.
    this.abbrevSearchList.removeEntity(entity);

    super.removeFromList(entityId);
  }

  // -------------- Private methods -------------------
}