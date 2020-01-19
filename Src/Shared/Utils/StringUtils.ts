import { StringScanLib } from "../../Shared/Utils/Lib/StringScanLib";
import { ErrorUtils } from "../../Shared/Utils/ErrorUtils";

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
  //   result = scan(str, "[ A: &{a}, B: &{b} ]", result);
  //   console.log(result.a);  // 1
  //   console.log(result.b);  // "cat"
  // You can also use "&{*}" as 'wildcard' to match any string
  //   without assigning it to a property.
  // Example (only read value of 'A:'):
  //   result = scan(str, "&{*}A: &{a},&{*}", result);
  export function scan
  (
    str: string,
    template: string,
    result: { [ key: string ]: any }
  )
  : void
  {
    try
    {
      // ! Throws exception on error.
      StringScanLib.scan(str, template, result);
    }
    catch (error)
    {
      throw ErrorUtils.prependMessage(`Failed to scan string "${str}"`
        + ` for values using template string "${template}"`, error);
    }
  }

  // ! Throws exception on error.
  export function toNumber(str: string): number
  {
    const value = Number(str);

    if (Number.isNaN(value))
      throw Error(`Value "${str}" does not represent a number`);

    return value;
  }

  // Removes lines from the start of multiline string 'str' that
  // don't start with 'prefix'. Lines need to be separated by '\n'.
  export function removeLinesWithoutPrefix(str: string, prefix: string): string
  {
    const LINE_BREAK = "\n";
    const lines = str.split(LINE_BREAK);

    while (!lines[0].startsWith(prefix))
    {
      lines.shift();
    }

    return lines.join(LINE_BREAK);
  }
}