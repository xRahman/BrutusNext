/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character selection request.
*/

'use strict';

import {Request} from '../../../shared/lib/protocol/Request';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameRequest extends Request
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public characterId: (string | null) = null;
}

Classes.registerSerializableClass(EnterGameRequest);