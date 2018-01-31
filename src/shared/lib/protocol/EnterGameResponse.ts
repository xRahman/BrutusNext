/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character selection request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Move} from '../../../shared/lib/protocol/Move';
import {Response} from '../../../shared/lib/protocol/Response';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  /*
  // Is the request accepted?
  public result = EnterGameResponse.Result.UNDEFINED;
  */

  // Where did the character entered game.
  public characterMove: (Move | null) = null;

  // Serialized data of 'loadLocation' entity.
  public serializedLoadLocation: (SerializedEntity | null) = null;

  // ---------------- Public methods --------------------

  public setLoadLocation(loadLocation: Entity)
  {
    if (!loadLocation || !loadLocation.isValid())
    {
      ERROR("Invalid loadLocation. Charselect response"
        + " won't be valid");
      this.serializedLoadLocation = null;
      return;
    }

    this.serializedLoadLocation = new SerializedEntity();

    this.serializedLoadLocation.store
    (
      loadLocation,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }
}

/*
// ------------------ Type declarations ----------------------

export module EnterGameResponse
{
  export enum Result
  {
    UNDEFINED,
    OK,
    ERROR
  }
}
*/

Classes.registerSerializableClass(EnterGameResponse);