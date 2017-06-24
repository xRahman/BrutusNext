/*
  Part of BrutusNEXT

  Auxiliary static class that serializes objects to and from JSON.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';

let beautify = require('js-beautify').js_beautify;

export class JsonObject
{
  // ---------------- Public methods --------------------

  // Same as JSON.stringify() but with more readable formatting.
  public static stringify(jsonObject: Object): string
  {
    let jsonString = JSON.stringify(jsonObject);

    jsonString = beautify
    (
      jsonString,
      {
        "indent_size": 2,
        "indent_char": " ",
        "eol": "\n",
        "brace_style": "expand",
        "keep_array_indentation": true,
        "end_with_newline": false
      }
    );

    return jsonString;
  }

  // Same as JSON.parse() but with exception handling.
  public static parse(jsonString: string, path: string = null): Object
  {
    let jsonObject = {};

    try
    {
      jsonObject = JSON.parse(jsonString);
    }
    catch (e)
    {
      let pathString = this.composePathString(path);

      ERROR("Syntax error in JSON data: " + e.message + pathString);
      return null;
    }

    return jsonObject;
  }

  // ---------------- Private methods -------------------

  // Auxiliary function used for error reporting.
  // -> Returns string informing about file location or empty string
  //    if 'path' is not available.
  private static composePathString(path: string)
  {
    if (path === null)
      return "";

    return " in file " + path;
  }
}