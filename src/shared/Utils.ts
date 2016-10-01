/*
  Part of BrutusNEXT

  Various utility functions.
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';

export module Utils
{
  // Extracts 'property' value from 'attributes' object describing an enym 'enumName'.
  export function getEnumAttributes
  (
    attributes: Object,
    enumName: string,
    property: string
  )
  {
    if (property in attributes)
      return attributes[property];

    ERROR("Enum value " + property + " doesn't exist in attributes"
          + " of enum " + enumName + ". You probably added a value"
          + " to the enum but forgot to add it to it's attributes");

    return null;
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

    /* 
    // Input with decimals (like "1.23") will be converted to 'null'
    if (input.indexOf('.') !== -1)
      return null;

    // Now we are sure that input doesn't contain decimal points.
    return Utils.atof(input);
    */

    /*
    // 'trim()' cuts off leating and trailing white spaces and newlines.
    // Typecast to 'any' is necessary to appease typescript.
    // '* 1' converts string to float number, or NaN if input isn't a number.
    let result = (input.trim() as any) * 1;

    if (result === NaN)
      return null;

    return result;
    */
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