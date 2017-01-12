/*
  Part of BrutusNEXT

  Various utility functions.
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';
import {AdminLevel} from '../server/AdminLevel';
import {Syslog} from '../server/Syslog';
import {Message} from '../server/message/Message';
import {TelnetSocketDescriptor} from '../server/net/telnet/TelnetSocketDescriptor';

export module Utils
{
  // Reports exception to Syslog, not just to console.
  export function reportException(err: Error)
  {
    Syslog.log
    (
      "Uncaught exception"
        + "\n"
        + err.stack,
      Message.Type.FATAL_RUNTIME_ERROR,
      AdminLevel.IMMORTAL
    );
  }

  // Make sure that all newlines are representedy by '\r\n'.
  export function normalizeCRLF(data: string)
  {
    if (data && data.length > 0)
    {
      // First remove all '\r' characters, then replace all '\n'
      // characters with '\r\n'.
      data = data.replace(/\r/gi, "").replace(/\n/gi, TelnetSocketDescriptor.NEW_LINE);
    }

    return data;
  }

  /*
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
  */

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