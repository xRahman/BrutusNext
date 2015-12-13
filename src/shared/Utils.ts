/*
  Part of BrutusNEXT

  Global utility functions.
*/

'use strict';

/*
import {Assert} from './Assert';
declare var GLOBAL: any;
GLOBAL.ASSERT = Assert.assert;
*/

/*
module.exports = class Utils
{
  // Checks number and types of function arguments.
  //
  // Usage example:
  //  checkArguments(arguments, "object", "object", "number");
  //
  // Valid argument types are:
  //   "object", "boolean", "number", "string", "symbol", "function"
  static checkArguments()
  {
    validateRequest(arguments);
    checkNumberOfArguments(arguments);
    checkTypesOfArguments(arguments);
  }

  static assert()
  {
    console.log("Assertion failed.");
  }
};

// ----------------------- Private module stuff -----------------------------

// Valid argument types. Used in checkArguments().
const validTypeNames = new Set(
[
  "object",
  "boolean",
  "number",
  "string",
  "symbol",
  "function"
]);

// Local function to check if checkArguments() actually received meaningful
// check request.
function validateRequest(argumentsToValidate)
{
  // First check if we got at least 2 arguments
  // (argumentsToValidate[0] should contain arguments to check,
  // argumentsToValidate[1] should contain required type for the first
  // argument)
  if (argumentsToValidate.length < 2)
  {
    throw new SyntaxError("Less than 2 parameters passed to checkArguments()."
      + " (Fist one needs to contain arguments to check and there needs to be"
      + " at least one type to check).");
  }

  // Now check if there is actualy something in argumentsToValidate[0]
  if (!argumentsToValidate[0])
  {
    throw new SyntaxError("Invalid arguments array passed to checkArguments()");
  }

  // And if it is actually an object (hopefully containing arguments to check).
  if (typeof argumentsToValidate[0] !== "object")
  {
    throw new SyntaxError("First argument passed to checkArguments() needs"
      + " to be object containing arguments to check.");
  }

  // Now check of the rest of the arguments (arguments[1] and so on)
  // contain valid type names
  for (let i = 1; i < argumentsToValidate.length; i++)
  {
    if (!validTypeNames.has(argumentsToValidate[i]))
    {
      throw new SyntaxError("Wrong syntax of checkArguments() call:"
        + " '" + argumentsToValidate[i]
        + "' is not a valid type. Valid types are: "
        + JSON.stringify(Array.from(validTypeNames)));
    }
  }
}

// Local function to compare received and required number of arguments
// and throw error if they differ.
function checkNumberOfArguments(argumentsToCheck)
{
  // Example of how argumentsToCheck can look like:
  //   checkArguments(arguments, "object", "object", "number");

  // Original arguments are stored in argumentsToCheck[0]
  let numberOfReceived = argumentsToCheck[0].length;
  // The rest of argumentsToCheck contains names of requested types.
  let numberOfRequired = argumentsToCheck.length - 1;

  if (numberOfReceived !== numberOfRequired)
  {
    let comparator;  // "less" or "more"

    if (numberOfReceived < numberOfRequired)
      comparator = "less";
    else
      comparator = "more";

    throw new TypeError("checkArguments() failed:"
      + " Received "
      + comparator
      + " than required number of arguments (Required: "
      + numberOfRequired
      + ", Received: "
      + numberOfReceived + ").");
  }
}

// Local function to check if all arguments are of requested types.
function checkTypesOfArguments(argumentsToCheck)
{
  // Example of how argumentsToCheck can look like:
  //   checkArguments(arguments, "object", "object", "number");

  for (let i = 1; i < argumentsToCheck.length; i++)
  {
    // First check explicitely for 'undefined' arguments to make the error
    // message more explaning.
    if (typeof(argumentsToCheck[0][i - 1]) === 'undefined')
    {
      throw new TypeError("checkArguments() failed:"
        + " arguments[" + (i - 1) + "] is undefined.");
    }

    // Now check if type of argument matches requested type.
    if (typeof(argumentsToCheck[0][i - 1]) !== argumentsToCheck[i])
    {
      throw new TypeError("checkArguments() failed:"
        + " arguments[" + (i - 1) + "] is not of requested type ('"
        + argumentsToCheck[i] + "').");
    }
  }
}
*/