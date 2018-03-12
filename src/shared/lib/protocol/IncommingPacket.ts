/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Common interface for packets that can be processed.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Connection} from '../../../shared/lib/connection/Connection';

// An "instance of type IncommingPacket" used for dynamic type checking.
const incommingPacket = {} as IncommingPacket;

/// Tohle je blbost - checkovat všechny properties při každém
/// zpracování packetu je drahá sranda.
/// TODO: Přesunout nejspíš do Utils.
// Throws a TypeError if 'variable' isn't of type 'type'.
function assertType(type: any, variable: any)
{
  for (let property in type)
  {
    // Object 'type' may have inherited properties which
    // we don't want to check.
    if (!type.hasOwnProperty(property))
      continue;

    let existsInVariable = variable.hasOwnProperty(property);
    let isOfSameType = (typeof variable[property] === typeof type[property]);

    if (!existsInVariable || !isOfSameType)
      throw new TypeError("Variable is not of required type");
  }
}

export interface IncommingPacket
{
  process(connection: Connection): Promise<void>;
}

export module IncommingPacket
{
  export function dynamicCast(variable: any): IncommingPacket
  {
    assertType(incommingPacket, variable);

    return <IncommingPacket>variable;
  }
}