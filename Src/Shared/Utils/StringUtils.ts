/*
  Part of BrutusNext

  String-related utility functions.
*/

export namespace StringUtils
{
  // ! Throws exception on error.
  // Example of usage:
  //   const str = "[ A: NaN, B: "" ]";
  //   let result = { a: Number, b: String } = {};
  //   result = scan(str, "[ A: ${a}, B: ${b} ]", result);
  //   console.log(result.a);  // 1
  //   console.log(result.b);  // "cat"
  export function scan
  (
    str: string,
    template: string,
    result: { [ key: string ]: any }
  )
  : void
  {
    // ! Throws exception on error.
    const { substrings, properties } = parseTemplate(str, template);

    // ! Throws exception on error.
    const values = splitBySubstrings(str, substrings);

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
function assignValue
(
  str: string,
  template: string,
  property: string,
  value: string,
  result: { [ key: string ]: any }
)
: void
{
  if (!(property in result))
  {
    throw Error(`Failed to scan string ${str} for values using template`
      + ` ${template}: Result object doesn't have property ${property}`);
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

  throw Error(`Failed to scan string ${str} for values using`
      + ` template ${template}: Property '${property}' with value`
      + ` '${String(result[property])}' in result object is of an`
      + ` unsupported type`);
}

// ! Throws exception on error.
function assignValues
(
  str: string,
  template: string,
  properties: Array<string>,
  values: Array<string>,
  result: { [ key: string ]: any }
)
: void
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
    assignValue(str, template, properties[i], values[i], result);
  }
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
  const substringPosition = str.indexOf(substring);

  if (substringPosition === -1)
  {
    throw Error(`Failed to split string ${str} because it`
      + ` doesn't contain substring ${substring}`);
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
    throw Error(`Failed to split string '${str}' by substrings`
      + ` because no substrings were provided`);
  }

  const result: Array<string> = [];
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