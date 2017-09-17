/*
  Part of BrutusNEXT

  Server-side functionality related to character creation request packet.
*/

/*
  Note:
    This class needs to use the same name as it's ancestor in /shared,
  because class name of the /shared version of the class is written to
  serialized data on the client and is used to create /server version
  of the class when deserializing the packet.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
// import {Serializable} from '../../../shared/lib/class/Serializable';
// import {Entity} from '../../../shared/lib/entity/Entity';
// import {Account} from '../../../shared/lib/account/Account';
// import {Character} from '../../../shared/game/character/Character';
// import {Response} from '../../../shared/lib/protocol/Response';
// import {EntityData} from '../../../shared/lib/protocol/EntityData';

import {Connection} from '../../../server/lib/connection/Connection';
import {Chargen} from '../../../server/game/character/Chargen';
import {ChargenRequest as SharedChargenRequest} from
  '../../../shared/lib/protocol/ChargenRequest';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends SharedChargenRequest
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  public async process(connection: Connection)
  {
    Chargen.processRequest(this, connection);
  }
}

Classes.registerSerializableClass(ChargenRequest);