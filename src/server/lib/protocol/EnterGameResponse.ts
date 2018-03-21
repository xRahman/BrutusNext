/*
  Part of BrutusNEXT

  Server-side version of enter game response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SharedEnterGameResponse} from
  '../../../shared/lib/protocol/SharedEnterGameResponse';

type Result = SharedEnterGameResponse.Result;

export class EnterGameResponse extends SharedEnterGameResponse
{
  constructor(result: Result)
  {
    super(result);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

Classes.registerSerializableClass(EnterGameResponse);