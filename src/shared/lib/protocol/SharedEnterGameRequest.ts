/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Enter game request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Request} from '../../../shared/lib/protocol/Request';
import {Connection} from '../../../shared/lib/connection/Connection';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class SharedEnterGameRequest extends Request
{
  constructor
  (
    protected characterId: string
  )
  {
    super();

    this.version = 0;
  }
}