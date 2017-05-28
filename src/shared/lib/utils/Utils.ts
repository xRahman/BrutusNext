/*
  Part of BrutusNEXT

  Various utility functions.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';

export module Utils
{
  // -> Returns 'true' if 'variable' is of type 'FastBitSet'.
  export function isBitvector(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'FastBitSet';
  }

  // -> Returns 'true' if 'variable' is of type 'Date'.
  export function isDate(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Date';
  }

  // -> Returns 'true' if 'variable' is of type 'Map',
  export function isMap(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Map';
  }

  // Detects only native javascript Objects - not classes.
  // -> Returns 'true' if 'variable' is of type 'Object',
  export function isPlainObject(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Object';
  }

  // Detects native javascript Arrays.
  // -> Returns 'true' if 'variable' is of type 'Array',
  export function isArray(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Array';
  }

  // -> Returns 'true' if 'variable' is a primitive type
  //    (boolean, null, undefined, number, string or symbol).
  export function isPrimitiveType(variable: any)
  {
    // For some reason typeof 'null' is 'object' in javascript
    // so we have check for it explicitely.
    return variable === null || typeof variable !== 'object';
  }

  // -> Returns 'true' if 'variable' is of type 'Set'.
  export function isSet(variable: any)
  {
    if (variable === null || variable === undefined || !variable.constructor)
      return false;

    return variable.constructor.name === 'Set';
  }

    // Make sure that all newlines are representedy by '\n'.
  export function normalizeCRLF(data: string)
  {
    if (data && data.length > 0)
    {
      // Remove all '\r' characters
      // (so '\n' stays as it is and '\r\n'
      //  or '\n\r' are converted to '\n').
      data = data.replace(/\r/gi, "");

      /// This would be conversion to '\r\n':
      /*
      // First remove all '\r' characters, then replace all '\n'
      // characters with '\r\n'.
      data = data.replace(/\r/gi, "");
      data = data.replace(/\n/gi, TelnetSocketDescriptor.NEW_LINE);
      */
    }

    return data;
  }

  // Removes all whitespace characters from the beginning of the string,
  // including tabs and line feeds.
  export function trimLeft(str: string): string
  {
	  return str.replace(/^\s+/,"");
  }

  // Removes all whitespace characters from the end of the string,
  // including tabs and line feeds.
  export function trimRight(str: string): string
  {
    return str.replace(/\s+$/,"");
  }

  // Makes the first character of 'str' uppercase and the rest lowercase.
  export function upperCaseFirstCharacter(str: string)
  {
    return str[0].toUpperCase()
      + str.toLowerCase().substr(1);
  }

  export function isAbbrev(abbrev: string, fullString: string): boolean
  {
    return fullString.indexOf(abbrev) !== -1;
  }

  // Converts string to integer number.
  // -> Returns null if string is not an integer number.
  export function atoi(input: string): number
  {
    // First convert input to float
    // (meaning that result can contain decimals).
    let result = Utils.atof(input);

    // Check that result doesn't have any decimal part. 
    if (result % 1 !== 0)
      return null;

    return result;
  }

  // Converts string to float (number that can contain decimal point).
  // -> Returns null if 'input' is not a number.
  export function atof(input: string): number
  {
    // 'trim()' cuts off leating and trailing white spaces and newlines.
    // Typecast to 'any' is necessary to appease typescript.
    // '* 1' converts string to float number, or NaN if input isn't a number.
    let result = (input.trim() as any) * 1;

    if (result === NaN)
      return null;

    return result;
  }
}