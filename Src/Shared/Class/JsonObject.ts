/*
  Part of BrutusNext

  Wraps javascript JSON class.
*/

import { ErrorUtils } from "../../Shared/Utils/ErrorUtils";
import { Types } from "../../Shared/Utils/Types";

// 3rd party modules
import { js_beautify as beautify } from "js-beautify";

export namespace JsonObject
{
  // ---------------- Public methods --------------------

  // Same as JSON.stringify() but with more readable formatting.
  export function stringify(jsonObject: object): string
  {
    let jsonString = JSON.stringify(jsonObject);

    jsonString = beautify
    (
      jsonString,
      {
        // eslint-disable-next-line @typescript-eslint/camelcase
        indent_size: 2,
        // eslint-disable-next-line @typescript-eslint/camelcase
        indent_char: " ",
        // eslint-disable-next-line @typescript-eslint/camelcase
        eol: "\n",
        // eslint-disable-next-line @typescript-eslint/camelcase
        brace_style: "expand",
        // eslint-disable-next-line @typescript-eslint/camelcase
        keep_array_indentation: true,
        // eslint-disable-next-line @typescript-eslint/camelcase
        end_with_newline: false
      }
    );

    return jsonString;
  }

  // ! Throws exception on error.
  // Same as JSON.parse() but with more informative error message.
  export function parse(jsonString: string, path?: string): object
  {
    let result: object;

    try
    {
      result = JSON.parse(jsonString) as object;
    }
    catch (error)
    {
      throw ErrorUtils.prependMessage
      (
        `Syntax error in JSON data${fileInfo(path)}`,
        error
      );
    }

    if (!Types.isPlainObject(result))
    {
      throw Error(`Failed to parse JSON data${fileInfo(path)}:`
        + ` Parsed result is not an object`);
    }

    return result;
  }
}

// ----------------- Auxiliary Functions ---------------------

function fileInfo(path?: string): string
{
  if (path === undefined)
    return "";

  return ` in file ${path}`;
}