/*
  Part of BrutusNEXT

  Utility functions.

*/
/*
'use strict';

import {ASSERT} from '../shared/ASSERT';

// Creates Error() object, reads stack trace from it.
// Returns string containing stack trace trimmed to start with function
// where assert actually got triggered.
export function getTrimmedStackTrace(): string
{
  // Create a temporary error object to construct stack trace for us.
  // (use type 'any' because TypeScript wouldn't allow to acecss .stack
  // property otherwise)
  let tmpErr: any = new Error();

  // Now we cut off first three lines from tmpErr.stack string.
  //   First line contains just: 'Error:' which we don't need.
  //   Second line contains name and line of ASSERT() function.
  //   Third line contains name and line of getTrimmedStackTrace() function.
  //   By second and third line we trim stack trace to begin on the line where
  // assertion actually failed, which is exacly what user needs to see.

  // Break stack trace string into an array of lines.
  let stackTraceLines = tmpErr.stack.split('\n');
  // Remove three lines, starting at index 0.
  stackTraceLines.splice(0, 3);
  // Join the array back into a single string
  let stackTrace = stackTraceLines.join('\n');

  return stackTrace;
}

export function dynamicCast<T>(instance, typeCast: { new (...args: any[]): T }): T
{
  // Dynamic type check - we make sure that our newly created object
  // is inherited from requested class (or an instance of the class itself).
  if (instance instanceof typeCast)
    // Here we typecast to <any> in order to pass newObject
    // as type T (you can't typecast directly to template type but you can
    // typecast to <any> which is then automatically cast to template type).
    return <any>instance;

  ASSERT(false,
    "Type cast error: Object is not an instance"
    + " of requested type (" + typeCast.name + ")");
}

/// TEST:
export async function delay(miliseconds: number)
{
  //return new Promise(resolve => global['timeout'] = setTimeout(resolve, miliseconds));
  return new Promise
  (
    (resolve, reject) =>
    {
      let error = new Error();
      error.message = "Script cancelled";
      global['timeout'] = setTimeout(reject(error), miliseconds);
    }
  );
}
*/

/*
/// TEST:
export async function internalDelay
(
  miliseconds: number,
  script: Script,
  compiledFunction: Function
)
{
  console.log("scriptName: " + scriptName);
  //return new Promise(resolve => global['timeout'] = setTimeout(resolve, miliseconds));
  return new Promise
  (
    (resolve, reject) =>
    {

      if (Script.isChanged(compiledFunction))
      {
        let error = new Error();
        error.message = "Script cancelled";
        global['timeout'] = setTimeout(reject(error), miliseconds);
      }
      else
      {
      }
    }
  );
}
*/