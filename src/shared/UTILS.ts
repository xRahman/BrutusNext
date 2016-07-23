/*
  Part of BrutusNEXT

  Utility functions.

*/

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
  //   Second line contains name and line of getTrimmedStackTrace() function.
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