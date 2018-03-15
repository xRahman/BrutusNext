/*
  Part of BrutusNEXT

  Client-side version of system message packet.
*/

/*
  This class is empty, all functionality is inherited from
  ancestor. It only exists so it can be added to Classes to
  be able to be dynamically instantiated.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SystemMessage as SharedSystemMessage} from
  '../../../shared/lib/protocol/SystemMessage';

export class SystemMessage extends SharedSystemMessage
{
  constructor()
  {
    super();

    this.version = 0;

  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module SystemMessage
{
  // Here we are just reexporting enum Type declared in our ancestor
  // (because enums must be declared outside of the class and so aren't
  //  inherited along with the class).
  export type Type = SharedSystemMessage.Type;
}

Classes.registerSerializableClass(SystemMessage);