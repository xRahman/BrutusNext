/*
  Part of BrutusNEXT

  Unique identifier.

  Use 'null' as a 'not pointing anywhere' id value. Id can be invalid
  even if it's not null, for example when it's pointing to an object
  which has already been deleted.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {Game} from "../game/Game";
import {GameEntity} from "../game/GameEntity";

export class EntityId extends Id
{
  /*
  // Returns direct reference to game entity identified by this id.
  // If this reference is null (for example if referenced entity
  // hasn't been created yet or if it has already been deleted),
  // fatal assert is triggered (so you know that you have referenced
  // something invalid).
  public getEntity(): GameEntity
  {
    // Direct reference is not initialized while loading, because
    // that would enforce certain order of loading (and prevent
    // bidirectional linking of entities using their ids). This means
    // that it might happen that directReference is not initialized
    // when entity id is 'dereferenced'. In that case we need to look
    // the entity up using the string id.
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
  */

  // Returns direct reference to game entity identified by this id.
  // If this reference is null (for example if referenced entity
  // hasn't been created yet or if it has already been deleted),
  // fatal assert is triggered (so you know that you have referenced
  // something invalid).
  public getEntity<T>
  (
    param: { typeCast: { new (...args: any[]): T } }
  )
  : T
  {
    // Direct reference is not initialized while loading, because
    // that would enforce certain order of loading (and prevent
    // bidirectional linking of entities using their ids). This means
    // that it might happen that directReference is not initialized
    // when entity id is 'dereferenced'. In that case we need to look
    // the entity up using the string id.
    if (this.directReference === null)
    {
      // Find referenced entity by string id.
      let entity = Game.entities.getItem(this);

      // This can never happen because it would trigger ASSERT_FATAL
      // in Game.entities.getItem() first, but better to be sure...
      if (entity === undefined)
      {
        entity = null;

        ASSERT(false,
          "Attempt to reference nonexisting GameEntity of type '"
          + this.type + "' by id '" + this.stringId + "'");

        return null;
      }

      this.directReference = entity;
    }

    return super.getEntity(param);
  }

  /*
  // Checks if entity still exists.
  public isValid(): boolean
  {
    // TODO: Nebude to tak jednoduché, viz TODO :\

    // If direct reference still exists, 
    if (this.directReference !== null)
      return true;

    return false;
  }
  */
}