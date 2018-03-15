/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  System message.
*/

'use strict';

import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class SystemMessage extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public type = SystemMessage.Type.UNDEFINED;

  public message: (string | null) = null;
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module SystemMessage
{
  export enum Type
  {
    UNDEFINED,
    CLIENT_CLOSED_BROWSER_TAB
  }
}