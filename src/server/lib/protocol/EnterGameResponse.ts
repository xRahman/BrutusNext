/*
  Part of BrutusNEXT

  Server-side version of enter game response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {EnterGameResponse as SharedEnterGameResponse} from
  '../../../shared/lib/protocol/EnterGameResponse';

export class EnterGameResponse extends SharedEnterGameResponse
{
  constructor(result: SharedEnterGameResponse.Result)
  {
    super(result);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

// ------------------ Type declarations ----------------------

export module EnterGameResponse
{
  // Here we are just reexporting types declared in our ancestor
  // (because they aren't inherited along with the class).
  export type Result = SharedEnterGameResponse.Result;
}

Classes.registerSerializableClass(EnterGameResponse);