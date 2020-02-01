/*
  Part of BrutusNext

  Functions related to Error object
*/

import "../../Shared/Utils/String";

export namespace ErrorUtils
{
  export function cloneError(error: Error): Error
  {
    // Note:
    //   We loose original type of Error object here.
    // That's because we can't use an instance of the
    // same class because it would have the same readonly
    // properties that we are trying to work around by cloning
    // the error object.
    //   We also can't use Object.create() because the result
    // wouldn't actualy be the Error object so the chrome console
    // wouldn't display it as such.
    const newError = new Error(error.message);

    Object.assign(newError, error);

    if (error.stack)
      newError.stack = error.stack;

    // Node.js specific (system errors)...
    if ((error as NodeJS.ErrnoException).code)
    {
      (newError as NodeJS.ErrnoException).code =
        (error as NodeJS.ErrnoException).code;
    }

    if ((error as NodeJS.ErrnoException).errno)
    {
      (newError as NodeJS.ErrnoException).errno =
        (error as NodeJS.ErrnoException).errno;
    }

    if ((error as NodeJS.ErrnoException).syscall)
    {
      (newError as NodeJS.ErrnoException).syscall =
        (error as NodeJS.ErrnoException).syscall;
    }

    return newError;
  }

  export function prependMessage(message: string, error: Error): Error
  {
    // This may happen because 'error' has type 'any' when caught.
    if (!(error instanceof Error))
      return new Error(`${message}: ${String(error)}`);

    let newMessage = message;

    if (error.message)
      newMessage += `\nReason: ${error.message}`;

    // Clone the 'error' because Error objects like DOMException have
    // readonly properties so we wouldn't be able to write to them.
    const clonedError = cloneError(error);

    setErrorMessage(clonedError, newMessage);

    return clonedError;
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

  export function setErrorMessage(error: Error, message: string): Error
  {
    error.message = message;

    // The first line of 'error.stack' property contains name of the error
    // class and error.message. So when we change error.message, we need to
    // change the first line of error.stack as well.
    updateStackErrorMessage(error);

    return error;
  }

  export function removeErrorMessage(stackTrace?: string): string
  {
    if (!stackTrace)
      return "";

    // Stack trace in Error object starts with error message
    // prefixed with 'Error' which would be confusing in the log.
    //   To remove it, we trim lines not starting with '    at '.
    // (Error message can be multi-line so removing just 1 line
    //  would not always be enough.)
    return stackTrace.removeLinesWithoutPrefix("    at ");
  }
}

// ----------------- Auxiliary Functions ---------------------

function updateStackErrorMessage(error: Error): Error
{
  if (!error.stack)
    return error;

  const trimmedStackStrace = ErrorUtils.removeErrorMessage(error.stack);

  error.stack = `${error.message}\n${trimmedStackStrace}`;

  return error;
}