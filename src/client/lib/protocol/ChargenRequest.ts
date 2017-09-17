/*
  Part of BrutusNEXT

  Client-side functionality related to character creation request packet.
*/

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
}

Classes.registerSerializableClass(ChargenRequest);