/*
  Part of BrutusNEXT

  Unique identifier.

  Use 'null' as a 'not pointing anywhere' id value. Id can be invalid
  even if it's not null, for example when it's pointing to an object
  which has already been deleted.
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {Game} from "../game/Game";
import {GameEntity} from "../game/GameEntity";

export class EntityId extends Id
{
  // Returns direct reference to game entity identified by this id.
  // If this reference is null (for example if referenced entity
  // hasn't been created yet or if it has already been deleted),
  // fatal assert is triggered (so you know that you have referenced
  // something invalid).
  public getEntity(): GameEntity
  {
    // Direct reference is not initialized when loading, because
    // that would enforce certain order of loading (and prevent
    // bidirectional linking of entities using their ids). This means
    // that it might happen that directReference is not initialized
    // when entity id is 'dereferenced'. In that case we need to look
    // the entity up using string id.
    if (this.directReference === null)
    {
      // Find referenced entity by string id.
      let entity = Game.entities.getItem(this);

      // This can never happen because it would trigger ASSERT_FATAL
      // in Game.entities.getItem() first, but better to be sure...
      if (entity === undefined)
      {
        entity = null;

        ASSERT_FATAL(false,
          "Attempt to reference a GameEntity of type '"
          + this.type + "', which is not available.");
      }

      this.directReference = entity;
    }

    // Typecast allows calling of methods of GameEntity class.
    return <GameEntity>this.directReference;
  }
}