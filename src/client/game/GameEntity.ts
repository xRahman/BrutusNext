/*
  Part of BrutusNEXT

  Client-side game entity.
*/

'use strict';

///import {ERROR} from '../../shared/lib/error/ERROR';
///import {Attributes} from '../../shared/lib/class/Attributes';
import {Entity} from '../../shared/lib/entity/Entity';

export class GameEntity extends Entity
{
  //----------------- Protected data --------------------

  // ------------- Public static methods ----------------

  // ------------ Protected static methods --------------

  // ---------------- Public methods --------------------

  // -------------- Protected methods -------------------

  /// Moved to server-side code only.
  /*
  // ~ Overrides ContainerEntity.insertEntity() to prevent
  // changing 'location' of client-side entities.
  protected insertEntity(entity: ContainerEntity)
  {
    ERROR("Attempt to change location of client-side entity."
      + " That is not allowed, entities can only change"
      + " their location on the server");
  }
  */

  // --------------- Private methods --------------------
}