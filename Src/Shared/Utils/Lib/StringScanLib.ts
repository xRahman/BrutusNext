/*
  Part of BrutusNext

  Library functions used by StringUtils.scan()
*/

/*
  IMPORTANT:
    Don't use this module directly, use StringUtils.scan() instead.
*/

import { StringUtils } from "../../../Shared/Utils/StringUtils";

export namespace StringScanLib
{
  // ! Throws exception on error.
  export function scan
  (
    str: string,
    template: string,
    result: { [ key: string ]: any }
  )
  : void
  {
    // ! Throws exception on error.
    const { substrings, properties } = parseTemplate(template);

    // ! Throws exception on error.
    const values = splitBySubstrings(str, substrings);

    // ! Throws exception on error.
    assignValues(properties, values, result);
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function assignValue
(
  property: string,
  value: string,
  result: { [ key: string ]: any }
)
: void
{
  // '*' is used as a wild card to skip any number of characters
  // so we are not going to assign respective value anywhere.
  if (property === "*")
    return;

  if (!(property in result))
  {
    throw Error(`Result object doesn't have property '${property}'`);
  }

  if (typeof result[property] === "number")
  {
    result[property] = StringUtils.toNumber(value);
    return;
  }

  if (typeof result[property] === "string")
  {
    result[property] = value;
    return;
  }

  throw Error(`Property '${property}' with value`
      + ` '${String(result[property])}' in result`
      + ` object is of an unsupported type`);
}

// ! Throws exception on error.
function assignValues
(
  properties: Array<string>,
  values: Array<string>,
  result: { [ key: string ]: any }
)
: void
{
  if (properties.length !== values.length)
  {
    throw Error(`String contains ${values.length} values`
      + ` but template specifies ${properties.length}`);
  }

  for (let i = 0; i < values.length; i++)
  {
    assignValue(properties[i], values[i], result);
  }
}

function findArgument
(
  str: string
)
: { substring: string, property: string, remainder: string }
{
  // Example of template string:
  //   "[ A: &{a}, B: &{b} ]"
  const openingPosition = str.indexOf("&{");
  const closingPosition = str.indexOf("}");

  const tagNotFound = openingPosition === -1 || closingPosition === -1;
  const tagIsEmpty = closingPosition - openingPosition < 2;

  if (tagNotFound || tagIsEmpty)
    return { substring: str, property: "", remainder: "" };

  const substring = str.substring(0, openingPosition);
  const property = str.substring(openingPosition + 2, closingPosition);
  const remainder = str.substring(closingPosition + 1);

  return { substring, property, remainder };
}

// ! Throws exception on error.
function parseTemplate
(
  template: string
)
: { substrings: Array<string>, properties: Array<string> }
{
  const substrings: Array<string> = [];
  const properties: Array<string> = [];

  // Template string example:
  //   "[ A: &{a}, B: &{b} ]"

  let remainder = template;

  while (remainder !== "")
  {
    const result = findArgument(remainder);

    substrings.push(result.substring);

    if (result.property !== "" && result.remainder === "")
      substrings.push("");

    if (result.property !== "")
    {
      if (result.property !== "*" && properties.includes(result.property))
      {
        throw Error(`Property '${result.property}' is`
        + ` specified more than once, that is not possible`);
      }

      properties.push(result.property);
    }

    remainder = result.remainder;
  }

  return { substrings, properties: [ ...properties ] };
}

// ! Throws exception on error.
function splitBySubstring
(
  str: string,
  substring: string
)
: { before: string, after: string }
{
  const substringPosition = str.indexOf(substring);

  if (substringPosition === -1)
  {
    throw Error(`Failed to split string "${str}" because it`
      + ` doesn't contain substring "${substring}"`);
  }

  const before = str.substring(0, substringPosition);
  const after = str.substring(substringPosition + substring.length);

  return { before, after };
}

// ! Throws exception on error.
function splitBySubstrings
(
  str: string,
  substrings: Array<string>
)
: Array<string>
{
  if (substrings.length === 0)
  {
    throw Error(`Failed to split string "${str}" by substrings`
      + ` because no substrings were provided`);
  }

  const result: Array<string> = [];
  let parsedStr = str;
  let splitResult = { before: "", after: "" };

  for (const substring of substrings)
  {
    splitResult = splitBySubstring(parsedStr, substring);

    result.push(splitResult.before);

    parsedStr = splitResult.after;
  }

  // Discard the first result because value can't be
  // before the first substring.
  result.shift();

  return result;
}