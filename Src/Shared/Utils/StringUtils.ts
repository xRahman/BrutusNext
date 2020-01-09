/*
  Part of BrutusNext

  String-related utility functions.
*/

export namespace StringUtils
{
  export type ScanResult =
  {
    [key: string]: string
  };

  // ! Throws exception on error.
  // Example of usage:
  //   const str = "[ A: 1, B: cat ]";
  //   let result { a: number, b: string } = {};
  //   result = scan(str, "[ A: ${a}, B: ${b} ]", result);
  //   console.log(result.a);  // "1"
  //   console.log(result.b);  // "cat"
  export function scan
  (
    str: string,
    template: string,
    result: ScanResult
  )
  : void
  {
    // ! Throws exception on error.
    const { substrings, properties } = parseTemplate(str, template);

    // ! Throws exception on error.
    const values = splitBySubstrings(str, ...substrings);

    // ! Throws exception on error.
    assignValues(str, template, properties, values, result);
  }

  // ! Throws exception on error.
  export function toNumber(str: string): number
  {
    const value = Number(str);

    if (Number.isNaN(value))
      throw Error(`Value ${str} does not represent a number`);

    return value;
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function assignValues
(
  str: string,
  template: string,
  properties: Array<string>,
  values: Array<string>,
  result: StringUtils.ScanResult
)
: StringUtils.ScanResult
{
  if (properties.length !== values.length)
  {
    throw Error(`Failed to scan string ${str} for values using template`
      + ` ${template}: String contains ${values.length} values but template`
      + ` specifies ${properties.length} of them`);
  }

  if (Object.entries(result).length !== properties.length)
  {
    throw Error(`Failed to scan string ${str} for values using template`
      + ` ${template}: Result object contains ${Object.entries(result).length}`
      + ` properties but template specifies ${properties.length} of them`);
  }

  for (let i = 0; i < values.length; i++)
  {
    const property = properties[i];
    const value = values[i];

    if (!(property in result))
    {
      throw Error(`Failed to scan string ${str} for values using template`
        + ` ${template}: Result object doesn't have property ${property}`);
    }

    result[property] = value;
  }

  return result;
}

function findArgument(str: string):
{
  substring: string,
  property: string,
  remainder: string
}
{
  // Example of template string:
  //   "[ A: ${a}, B: ${b} ]"
  const openingPosition = str.indexOf("${");
  const closingPosition = str.indexOf("}");

  const tagNotFound = openingPosition === -1 || closingPosition === -1;
  const tagIsEmpty = closingPosition - openingPosition < 2;

  if (tagNotFound || tagIsEmpty)
    return { substring: str, property: "", remainder: "" };

  const substring = str.substring(0, openingPosition - 1);
  const property = str.substring(openingPosition + 2, closingPosition);
  const remainder = str.substring(closingPosition + 1);

  return { substring, property, remainder };
}

// ! Throws exception on error.
function parseTemplate
(
  str: string,
  template: string
)
: { substrings: Array<string>, properties: Array<string> }
{
  const substrings: Array<string> = [];

  // Use Set to ensure that each property is only specified once.
  const properties = new Set<string>();

  // Template string example:
  //   "[ A: ${a}, B: ${b} ]"

  let remainder = template;

  while (remainder !== "")
  {
    const result = findArgument(remainder);

    if (result.substring !== "")
      substrings.push(result.substring);

    if (result.property !== "")
    {
      if (properties.has(result.property))
      {
        throw Error(`Failed to scan string ${str} for values using template`
        + ` ${template}: Property ${result.property} is specified more than`
        + ` once, that is not possible`);
      }

      properties.add(result.property);
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
  const splitResult = str.split(substring);

  if (splitResult.length < 2)
  {
    throw Error(`Failed to split string ${str} because it`
      + ` doesn't contain substring ${substring}`);
  }

  const before = splitResult[0];

  splitResult.shift();

  // 'str' may contain more than one occurance of 'substring'
  // so we need to join the rest of 'splitResult'.
  const after = splitResult.join(substring);

  return { before, after };
}

// ! Throws exception on error.
function splitBySubstrings
(
  str: string,
  ...substrings: string[]
)
: Array<string>
{
  if (substrings.length === 0)
  {
    throw Error(`Failed to split string '${str}' by substrings`
      + ` because no substrings were provided`);
  }

  const result = [];
  let parsedStr = str;
  let splitResult = { before: "", after: "" };

  for (const substring of substrings)
  {
    splitResult = splitBySubstring(parsedStr, substring);

    if (splitResult.before !== "")
      result.push(splitResult.before);

    parsedStr = splitResult.after;
  }

  if (splitResult.after !== "")
    result.push(splitResult.after);

  return result;
}