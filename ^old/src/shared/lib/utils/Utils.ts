/*
  Part of BrutusNEXT

  Various utility functions.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';

// Types used for constructs like 'new Promise((resolve, reject) => { ... })'.
export type ResolveFunction<T> = (value?: T | PromiseLike<T>) => void;
export type RejectFunction = (reason?: any) => void;


export module Utils
{
  // Most Unix filesystems have this limit on file name length.
  export const MAX_FILENAME_BYTE_LENGTH = 255;

  export function isColorCode(code: string): boolean
  {
    switch (code)
    {
      case '&n':
      case '&d':
      case '&i':
      case '&u':
      case '&l':
      case '&k':
      case '&Ki':
      case '&K':
      case '&r':
      case '&Ri':
      case '&R':
      case '&g':
      case '&Gi':
      case '&G':
      case '&y':
      case '&Y':
      case '&b':
      case '&Bi':
      case '&B':
      case '&m':
      case '&M':
      case '&c':
      case '&C':
      case '&w':
      case '&W':
        return true;        
    }

    return false;
  }

  // -> Returns 'true' if 'variable' is of type string.
  export function isString(variable: any): boolean
  {
    return typeof variable === 'string';
  }

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

  export function isSerializable(variable: any)
  {
    return variable instanceof Serializable;
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

  export function uppercaseFirstLowercaseRest(str: string): string
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
  export function atoi(input: string): number | null
  {
    // First convert input to float
    // (meaning that result can contain decimals).
    let result = Utils.atof(input);

    if (result === null)
      return null;

    // Check that result doesn't have any decimal part. 
    if (result % 1 !== 0)
      return null;

    return result;
  }

  // Converts string to float (number that can contain decimal point).
  // -> Returns null if 'input' is not a number.
  export function atof(input: string): number | null
  {
    // 'trim()' cuts off leating and trailing white spaces and newlines.
    // Typecast to 'any' is necessary to appease typescript.
    // '* 1' converts string to float number, or NaN if input isn't a number.
    let result = (input.trim() as any) * 1;

    if (result === NaN)
      return null;

    return result;
  }

  export function encodeAsFileName(str: string)
  {
    return truncateByteLength(str, MAX_FILENAME_BYTE_LENGTH);
  }

  export function hasValidByteLengthAsFileName(str: string)
  {
    let encodedStr = encodeStringAsFileName(str);

    return getByteLength(encodedStr) <= MAX_FILENAME_BYTE_LENGTH;
  }

  // Copies properties of 'defaults' object to 'target' object
  // if they are not present in it. This is even done recursively
  // so you can default only some sub-properties.
  // (Generic type is used to ensure that 'defaults' parameter is
  //  of the same type as 'target' parameter).
  // -> Returns modified 'target'.
  export function applyDefaults<T>(target: T, defaults: T)
  {
    for (let propertyName in defaults)
    {
      let sourceProperty = defaults[propertyName];
      let targetProperty = target[propertyName]

      if (!defaults.hasOwnProperty(propertyName))
        continue;

      if (sourceProperty === undefined)
        continue;

      if (targetProperty === undefined)
      {
        target[propertyName] = sourceProperty;
        continue;
      }

      // If both properties are plain objects, call applyDefaults()
      // recursively on them.
      if (isPlainObject(sourceProperty) && isPlainObject(targetProperty))
        applyDefaults(targetProperty, sourceProperty);
    }

    return target;
  }

  // Note: 'str' is trimmed from the right before the dot
  // is added so you don't end up with a dot on the new line,
  // after a space or a tab, etc.
  // -> Returns a new string which ends with a dot.
  export function ensureDotAtTheEnd(str: string): string
  {
    str = trimRight(str);

    if (str.slice(-1) !== '.')
      return str + '.';

    return str;
  }
}

// ----------------- Private Module Stuff --------------------

/// Not used anymore. All file names are encoded now.
// // Conversion table used to encode and decode e-mail
// // address so it can be used as file name on all OSses.
// const EMAIL_ENCODED_CHARACTERS = new Map
// (
//   [
//     ['*', '(star)'],
//     ['/', '(slash)'],
//     ['?', '(questionmark)'],
//     ['|', '(verticalbar)']
//   ]
// );

const FILENAME_RESERVED_CHARACTERS = new Map
(
  [
    ['~',  '~~'],                // Escape character.
    ['<',  '~LT~'],
    ['>',  '~GT~'],
    [':',  '~CL~'],    
    ['"',  '~QT~'],
    ['/',  '~FS~'],
    ['\\', '~BS~'],
    ['|',  '~VB~'],
    ['?',  '~QM~'],
    ['*',  '~AS~']
  ]
);

const RESERVED_FILENAMES = new Map
(
  [
    // Reserved characters.
    ['.',  '~.~'],
    ['..',  '~..~'],
    ['con',  '~CON~'],
    ['prn',  '~PRN~'],
    ['aux',  '~AUX~'],
    ['nul',  '~NUL~']
  ]
);

function getByteLength(str: string)
{
  // Note: I didn't manage to find an easy and simple way
  //   to compute byte lenghth of a string both in the browser
  //   and on node.js. To work around it, we try two methods.

  // This should work in the browser.
  if (typeof Blob !== 'undefined')
  {
    // Don't ask me what Blob is, I just googled it and copy&pasted it
    // (important point is, that blob.size tell us byte length of 'data').
    return new Blob([str]).size;
  }

  // This should work on node.js.
  if (typeof Buffer !== 'undefined')
    return Buffer.byteLength(str, 'utf8');

  FATAL_ERROR("Unable to compute byte length of a string because"
    + " neither 'Blob' object nor 'Buffer' object is supported.");

  return 0; // Never happens, FATAL_ERROR exits the app.
}

function reportTruncation
(
  str: string,
  truncatedStr: string,
  maxByteLength: number
)
{
  ERROR("Failed to correctly encode string '" + str + "' as filename"
    + " because it's longer than " + maxByteLength + " bytes after"
    + " encoding. Truncating it to '" + truncatedStr + "'. Note that"
    + " this means that if some other string used as file name exceeds"
    + " this limit, it could refer to the same file. You should prevent"
    + " entity names (or any other source of file names) to exceed byte"
    + " length of " + maxByteLength);
}

// -> Returns string encoded to be safely used as filename
//    and truncated to 'maxByteLength' bytes of length.
function truncateByteLength(str: string, maxByteLength: number)
{
  if (maxByteLength < 1)
  {
    ERROR("Invalid 'maxByteLength' parameter. String is not truncated");
    return str;
  }

  let truncatedStr = str;
  let encodedStr = encodeStringAsFileName(str);
  let byteLength = getByteLength(encodedStr);

  while (byteLength > maxByteLength && str.length > 0)
  {
    // Note that we are shortening the original, unencoded
    // string and reencoding it before byte length check.
    // That's because if we shortened encoded string, it
    // could stop being valid file name.
    truncatedStr = truncatedStr.slice(0, -1);

    encodedStr = encodeStringAsFileName(str);
    byteLength = getByteLength(encodedStr);
  }

  if (truncatedStr.length < str.length)
    reportTruncation(str, truncatedStr, maxByteLength);
  
  return encodedStr;
}

function replaceControlCharacter(str: string, charCode: number)
{
  // Create string from integer charcode value.
  let key = String.fromCharCode(charCode);

  // Coerce 'charCode' to string, so 0x00 becomes '0', etc.
  let value = '~' + charCode + '~';

  return str.split(key).join(value);
}

function escapeReservedCharacters(str: string)
{
  for (let [key, value] of FILENAME_RESERVED_CHARACTERS.entries())
    str = str.split(key).join(value);

  return str;
}

function escapeReservedFilenames(str: string)
{
  for (let [key, value] of RESERVED_FILENAMES.entries())
  {
    if (str === key)
    {
      str = value;
      return str;
    }
  }

  for (let i = 1; i <= 9; i++)
  {
    // Escape COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9.
    if (str === 'com' + i)
    {
      str = '~com' + i + '~';
      return str;
    }

    // Escape LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8, LPT9.
    if (str === 'lpt' + i)
    {
      str = '~lpt' + i + '~';
      return str;
    }
  }

  return str;
}

function escapeControlCharacters(str: string)
{
  // Escape control characters (0x00–0x1F)
  for (let i = 0x00; i < 0x1F; i++)
    str = replaceControlCharacter(str, i);

  // Escape control characters (0x80–0x9f)
  for (let i = 0x80; i < 0x9f; i++)
    str = replaceControlCharacter(str, i);

  return str;
}

function escapeTrailingCharacter(str: string, character: string)
{
  if (str.slice(-1) === character)
    str = str.slice(0, -1) + '~' + character + '~';

  return str;
}

function encodeStringAsFileName(str: string)
{
  str = str.toLowerCase();
  str = escapeReservedCharacters(str);
  str = escapeReservedFilenames(str);
  str = escapeControlCharacters(str);
  str = escapeTrailingCharacter(str, '.');
  str = escapeTrailingCharacter(str, ' ');

  return str;
}