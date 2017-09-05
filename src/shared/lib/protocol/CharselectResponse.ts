/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character selection request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {EntityMove} from '../../../shared/lib/protocol/EntityMove';
import {Response} from '../../../shared/lib/protocol/Response';
import {EntityData} from '../../../shared/lib/protocol/EntityData';
import {Classes} from '../../../shared/lib/class/Classes';

export class CharselectResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Is the request accepted?
  public result = CharselectResponse.Result.UNDEFINED;

  // Where did the character entered game.
  public characterMove: EntityMove = null;

  // Serialized data of 'loadLocation' entity.
  public loadLocation: EntityData = null;

  // ---------------- Public methods --------------------

  public setLoadLocation(loadLocation: Entity)
  {
    this.loadLocation = new EntityData();

    this.loadLocation.serializeEntity
    (
      loadLocation,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }
}

// ------------------ Type declarations ----------------------

export module CharselectResponse
{
  export enum Result
  {
    UNDEFINED,
    OK,
    ERROR
  }
}

Classes.registerSerializableClass(CharselectResponse);