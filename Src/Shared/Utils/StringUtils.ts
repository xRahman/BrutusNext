/*
  Part of BrutusNext

  String-related utility functions.
*/

export namespace StringUtils
{
  // ! Throws exception on error.
  export function splitBySubstrings
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

      console.log(splitResult);

      if (splitResult.before !== "")
        result.push(splitResult.before);

      parsedStr = splitResult.after;
    }

    if (splitResult.after !== "")
      result.push(splitResult.after);

    return result;
  }
}

// ----------------- Auxiliary Functions ---------------------

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