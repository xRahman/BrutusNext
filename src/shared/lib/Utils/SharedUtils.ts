/*
  Part of BrutusNEXT

  Various utility functions.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';

export module SharedUtils
{
  // -> Returns 'true' if 'variable' is of type 'FastBitSet',
  //    Returns 'false' otherwise.
  export function isBitvector(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'FastBitSet';
  }

  // -> Returns 'true' if 'variable' is of type 'Date',
  //    Returns 'false' otherwise.
  export function isDate(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Date';
  }

  // -> Returns 'true' if 'variable' is of type 'Map',
  //    Returns 'false' otherwise.
  export function isMap(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Map';
  }

  // Detects only native javascript Objects - not classes.
  // -> Returns 'true' if 'variable' is of type 'Object',
  //    Returns 'false' otherwise.
  export function isPlainObject(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Object';
  }

  // -> Returns 'true' if 'variable' is a primitive type
  //    (boolean, null, undefined, number, string or symbol).
  //    Returns 'false' otherwise.
  export function isPrimitiveType(variable: any)
  {
    // For some reason typeof 'null' is 'object' in javascript
    // so we have check for it explicitely.
    return variable === null || typeof variable !== 'object';
  }

  // -> Returns 'true' if 'variable' is of type 'Set',
  //    Returns 'false' otherwise.
  export function isSet(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Set';
  }
}