/*
  Part of BrutusNEXT

  Implements part of game entity that is used both on
  the client and the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {ContainerEntity} from '../../../shared/lib/entity/ContainerEntity';
import {SharedGameEntity} from '../../../shared/game/entity/SharedGameEntity';

export class ClientGameEntity extends SharedGameEntity
{
  //----------------- Protected data --------------------

  // ------------- Public static methods ----------------

  // ------------ Protected static methods --------------

  // ---------------- Public methods --------------------

  // -------------- Protected methods -------------------

  // Overrides ContainerEntity.insertEntity() to prevent
  // changing 'location' of client-side entities.
  protected insertEntity(entity: ContainerEntity)
  {
    ERROR("Attempt to change location of client-side entity."
      + " That is not allowed, entities can only change"
      + " their location on the server");
  }

  // --------------- Private methods --------------------
}