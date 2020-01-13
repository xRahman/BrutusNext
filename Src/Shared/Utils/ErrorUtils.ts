/*
  Part of BrutusNext

  Functions related to Error object
*/

export namespace ErrorUtils
{
  export function clone(error: Error): Error
  {
    return Object.assign(new Error(error.message), error);
  }

  export function prependMessage(message: string, error: Error): Error
  {
    // This may happen because 'error' has type 'any' when caught.
    if (!(error instanceof Error))
      return new Error(`${message}: ${String(error)}`);

    // Clone the 'error' because Error objects like DOMException have
    // readonly properties so we wouldn't be able to write to them.
    const clonedError = clone(error);

    if (error.message)
      clonedError.message = `${message}: ${error.message}`;
    else
      clonedError.message = message;

    return error;
  }

  // ! Throws exception on error.
  // This only works under Node.js, not in browser.
  export function getErrorCode(error: Error): string
  {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === undefined)
    {
      throw Error("Missing 'code' property on error object."
        + " Maybe you are not runing under Node.js?");
    }

    return code;
  }
}