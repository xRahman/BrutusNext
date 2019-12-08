/* Part of BrutusNext */

/*
  Filesystem I/O operations.
*/

import "../../Shared/Utils/String";
import { Types } from "../../Shared/Utils/Types";
import { SavingQueue } from "../../Server/FileSystem/SavingQueue";

// Built-in node.js modules.
import * as FS from "fs-extra";

// 3rd party modules.
/// Module is removed for now but function isEmpty() used
/// to use it so it might be needed again.
// let extfs = require('extfs');

const UTF8 = "utf8";
const BINARY = "binary";
// const JSON = "json";

// Most Unix filesystems have this limit on file name length.
const MAX_FILENAME_LENGTH_BYTES = 255;

const RESERVED_FILENAME_CHARACTERS = new Map
(
  [
    // Escape character.
    [ "~", "~~" ],
    [ "<", "~LT~" ],
    [ ">", "~GT~" ],
    [ ":", "~CL~" ],
    [ "\"", "~QT~" ],
    [ "/", "~FS~" ],
    [ "\\", "~BS~" ],
    [ "|", "~VB~" ],
    [ "?", "~QM~" ],
    [ "*", "~AS~" ]
  ]
);

const RESERVED_FILENAMES = new Map
(
  [
    // Reserved characters.
    [ ".", "~.~" ],
    [ "..", "~..~" ],
    [ "con", "~CON~" ],
    [ "prn", "~PRN~" ],
    [ "aux", "~AUX~" ],
    [ "nul", "~NUL~" ]
  ]
);

// Key: relative path of saved file.
const savingQueues = new Map<string, SavingQueue>();

export namespace FileSystem
{
  // ---------------- Public methods --------------------

  // -> Returns true if 'str' is a valid filename
  //    on both Windows and Linux.
  export function isValidFileName(str: string)
  {
    if (str.length === 0 || str.length > 255)
      return false;

    // Disallow characters < > : " / \ | ? *
    if ((/[<>:"\/\\|?*\x00-\x1F]/g).test(str))
      return false;

    // Disallow names reserved on Windows.
    if ((/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i).test(str))
      return false;

    // Disallow '.' and '..'.
    if (/^\.\.?$/.test(str))
      return false;

    return true;
  }

  // ! Throws exception on error.
  export async function readExistingFile(path: string): Promise<string>
  {
    // ! Throws exception on error.
    const readResult = await readFile(path, true);

    if (readResult === "File doesn't exist")
    {
      throw Error(`File "${path}" doesn't exist`);
    }

    return readResult.data;
  }

  // ! Throws exception on error.
  export async function readFile
  (
    path: string,
    binary = false
  )
  // Return value is {} because 'string' would conflict with other value(s).
  : Promise<{ data: string } | "File doesn't exist">
  {
    // ! Throws exception on error.
    checkPathValidity(path);

    let data = "";
    const encoding = binary ? BINARY : UTF8;

    try
    {
      data = await FS.readFile(path, encoding);
    }
    catch (error)
    {
      if (!error)
        throw Error("Invalid error object");

      const errorCode = getErrorCode(error);

      if (errorCode === "ENOENT")
        return "File doesn't exist";

      throw Error(`Unable to read file '${path}': ${errorCode}`);
    }

    return { data };
  }

  // ! Throws exception on error.
  export async function writeFile
  (
    directory: string,
    fileName: string,
    data: string
  )
  : Promise<void>
  {
    const path = composePath(directory, fileName);

    if (!isValidFileName(fileName))
    {
      throw Error(`Failed to write file because path "${path}"`
        + ` doesn't contain a valid file name`);
    }

    // Following code is addresing feature of node.js file saving
    // functions which says that we must not attempt saving the same
    // file until any previous saving finishes (otherwise it is not
    // guaranteed that file will be saved correctly).
    //   To ensure this, we register all saving to each file and queue
    // saving requests if necessary.
    const result = requestSaving(path);

    if (result !== "Saving is possible right now")
    {
      await saveAwaiter(result);
    }

    // Now it's our turn so we can save ourselves.
    try
    {
      await write(path, data);
    }
    catch (error)
    {
      // We must finish saving even if error occured
      // to not to block the saving queue.
      finishSaving(path);
      throw error;
    }

    // Remove the lock and resolve saveAwaiter()
    // of whoever is waiting after us.
    finishSaving(path);
  }

  // ! Throws exception on error.
  export async function deleteFile(path: string): Promise<void>
  {
    // ! Throws exception on error.
    checkPathValidity(path);

    try
    {
      await FS.unlink(path);
    }
    catch (error)
    {
      const errorCode = getErrorCode(error);

      throw Error(`Failed to delete file "${path}": ${errorCode}`);
    }
  }

  // ! Throws exception on error.
  export async function exists(path: string): Promise<boolean>
  {
    // ! Throws exception on error.
    checkPathValidity(path);

    return FS.pathExists(path);
  }

  // ! Throws exception on error.
  export async function ensureDirectoryExists(directory: string): void
  {
    // ! Throws exception on error.
    checkPathValidity(directory);

    try
    {
      await FS.ensureDir(directory);
    }
    catch (error)
    {
      const errorCode = getErrorCode(error);

      throw Error(`Unable to ensure existence of`
        + ` directory "${directory}": ${errorCode}`);
    }
  }

  /// This function used 'extfs' module which I removed as (almost)
  /// unnecessary. If this function is needed, it needs to be implemented
  /// differently or 'extfs' needs to be added again.
  // // ! Throws exception on error.
  // //  Directory is empty if it doesn't exist or there are no files in it.
  // //  File is empty if it doesn't exist or it has zero size.
  // public static async isEmpty(path: string): Promise<boolean>
  // {
  //   // ! Throws exception on error.
  //   checkPathValidity(path);

  //   return await FS.isEmpty(path);
  // }

  // ! Throws exception on error.
  // -> Returns array of file names in directory, including
  //    subdirectories, excluding '.' and '..'.
  export async function readDirectoryContents
  (
    path: string
  )
  : Promise<Array<string>>
  {
    // ! Throws exception on error.
    checkPathValidity(path);

    try
    {
      return await FS.readdir(path);
    }
    catch (error)
    {
      const errorCode = getErrorCode(error);

      throw Error(`Unable to read contents of directory`
        + ` "${path}": ${errorCode}`);
    }
  }

  // ! Throws exception on error.
  export async function isDirectory(path: string): Promise<boolean>
  {
    // ! Throws exception on error.
    checkPathValidity(path);

    // ! Throws exception on error.
    return (await statFile(path)).isDirectory();
  }

  // ! Throws exception on error.
  export async function isFile(path: string): Promise<boolean>
  {
    // ! Throws exception on error.
    checkPathValidity(path);

    // ! Throws exception on error.
    return (await statFile(path)).isFile();
  }

  // ! Throws exception on error.
  export function encodeAsFileName(str: string): string
  {
    return truncateByteLength(str, MAX_FILENAME_LENGTH_BYTES);
  }

  // ! Throws exception on error.
  export function hasValidByteLengthAsFileName(str: string): boolean
  {
    const encodedStr = encodeStringAsFileName(str);

    return getByteLength(encodedStr) <= MAX_FILENAME_LENGTH_BYTES;
  }

  // ! Throws exception on error.
  export async function loadJsonFromFile(directory: string, fileName: string)
  : Promise<string>
  {
    const path = composePath(directory, fileName);

    const readResult = await readFile(path);

    if (readResult === "File doesn't exist")
    {
      throw Error(`Failed to load file '${path}'`
        + ` because it doesn't exist`);
    }

    return readResult.data;
  }

  export function composePath(directory: string, fileName: string): string
  {
    if (directory.endsWith("/"))
      return `${directory}${fileName}`;

    return `${directory}/${fileName}`;
  }
}

// ----------------- Auxiliary Functions ---------------------

// If a promise is returned, whoever is requesting saving
// must wait using saveAwaiter(promise).
function requestSaving
(
  path: string
)
: Promise<void> | "Saving is possible right now"
{
  let queue = savingQueues.get(path);

  if (queue === undefined)
  {
    // Nobody is saving to the path yet.
    queue = new SavingQueue();

    // Note: We don't push a resolve callback for the first
    // request, because it will be processed right away.
    savingQueues.set(path, queue);

    return "Saving is possible right now";
  }

  // Someone is already saving to the path.
  return queue.addRequest();
}

// ! Throws exception on error.
function finishSaving(path: string): void
{
  const queue = savingQueues.get(path);

  if (queue === undefined)
  {
    throw Error(`Attempt to report finished saving of file`
      + ` "${path}" which is not registered as being saved`);
  }

  const pollResult = queue.pollRequest();

  if (pollResult === "Queue is empty")
  {
    savingQueues.delete(path);
    return;
  }

  const resolveCallback: Types.ResolveFunction<void> = pollResult;

  // By calling the resolve callback we finish savingAwaiter()
  // of whoever called us. That should lead to the next saving
  // to proceed.
  resolveCallback();
}

// ! Throws exception on error.
function checkPathValidity(path: string)
{
  if (!isRelative(path))
  {
    throw Error(`File path "${path}" is not relative.`
    + ` Ensure that it starts with './'`);
  }

  if (containsDoubleDot(path))
  {
    throw Error(`File path "${path}" is not valid.`
    + ` Ensure that it doesn't contain '..'`);
  }
}

function isRelative(path: string): boolean
{
  if (path.substr(0, 2) !== "./")
    return false;

  return true;
}

function containsDoubleDot(path: string): boolean
{
  return path.indexOf("..") !== -1;
}

// ! Throws exception on error.
async function write(path: string, data: string)
{
  // ! Throws exception on error.
  checkPathValidity(path);

  try
  {
    // 'FS.outputFile()' creates the directory if it doesn't exist.
    await FS.outputFile(path, data, UTF8);
  }
  catch (error)
  {
    const errorCode = getErrorCode(error);

    throw Error (`Failed to save file "${path}": ${errorCode}`);
  }
}

// This is just a generic async function that will finish
// when 'promise' parameter gets resolved.
// (This only makes sense if you also store resolve callback
//  of the promise so you can call it to finish this awaiter.
//  See SavingQueue.addRequest() for example how is it done.)
async function saveAwaiter(promise: Promise<void>)
{
  return promise;
}

// ! Throws exception on error.
async function statFile(path: string): Promise<FS.Stats>
{
  // ! Throws exception on error.
  checkPathValidity(path);

  try
  {
    return await FS.stat(path);
  }
  catch (error)
  {
    const errorCode = getErrorCode(error);

    throw Error(`Unable to stat file "${path}": ${errorCode}`);
  }
}

// ! Throws exception on error.
function getByteLength(str: string)
{
  // This should work on node.js.
  if (typeof (Buffer as any) === "undefined")
  {
    throw Error("Unable to compute byte length of"
    + " a string because 'Buffer' object is supported.");
  }

  return Buffer.byteLength(str, "utf8");
}

// ! Throws exception on error.
// -> Returns string encoded to be safely used as filename
//    and truncated to 'maxByteLength' bytes of length.
function truncateByteLength(str: string, maxByteLength: number)
{
  if (maxByteLength < 1)
  {
    throw Error("Invalid 'maxByteLength' parameter."
      + " String is not truncated");
  }

  let truncatedStr = str;
  let encodedStr = encodeStringAsFileName(str);
  let byteLength = getByteLength(encodedStr);

  while (byteLength > maxByteLength && str.length > 0)
  {
    // Note that we are shortening the original, unencoded
    // string and reencoding it before byte length check.
    // That's because if we shortened encoded string, it
    // could stop being valid file name.
    truncatedStr = truncatedStr.slice(0, -1);

    encodedStr = encodeStringAsFileName(str);
    byteLength = getByteLength(encodedStr);
  }

  if (truncatedStr.length < str.length)
  {
    throw Error(`Failed to correctly encode string "${str}" as`
      + ` filename because it's longer than ${maxByteLength} bytes`
      + ` after encoding. Truncating it to "${truncatedStr}". Note`
      + ` that this means that if some other string used as file name`
      + ` exceeds this limit, it could refer to the same file. You should`
      + ` prevent entity names (or any other source of file names) to`
      + ` exceed byte length of ${maxByteLength}`);
  }

  return encodedStr;
}

function replaceControlCharacter(str: string, charCode: number)
{
  // Create string from integer charcode value.
  const key = String.fromCharCode(charCode);
  const value = `~${charCode}~`;

  return str.split(key).join(value);
}

function escapeReservedCharacters(str: string)
{
  let result = str;

  for (const [key, value] of RESERVED_FILENAME_CHARACTERS.entries())
    result = result.split(key).join(value);

  return result;
}

function escapeReservedFilenames(str: string)
{
  for (const [key, value] of RESERVED_FILENAMES.entries())
  {
    if (str === key)
      return value;
  }

  for (let i = 1; i <= 9; i++)
  {
    // Escape COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9.
    if (str === `com${i}`)
      return `~com${i}~`;

    // Escape LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8, LPT9.
    if (str === `lpt${i}`)
      return `~lpt${i}~`;
  }

  return str;
}

function escapeControlCharacters(str: string)
{
  let result = str;

  // Escape control characters (0x00–0x1F)
  for (let i = 0x00; i < 0x1F; i++)
    result = replaceControlCharacter(result, i);

  // Escape control characters (0x80–0x9F)
  for (let i = 0x80; i < 0x9F; i++)
    result = replaceControlCharacter(result, i);

  return result;
}

function escapeTrailingCharacter(str: string, character: string)
{
  if (str.slice(-1) === character)
    return `${str.slice(0, -1)}~${character}~`;

  return str;
}

function encodeStringAsFileName(str: string)
{
  let result = str.toLowerCase();

  result = escapeReservedCharacters(result);
  result = escapeReservedFilenames(result);
  result = escapeControlCharacters(result);
  result = escapeTrailingCharacter(result, ".");
  result = escapeTrailingCharacter(result, " ");

  return result;
}

// ! Throws exception on error.
function getErrorCode(error: any)
{
  if (!error)
    throw Error("Invalid error object");

  const code = (error as NodeJS.ErrnoException).code;

  if (code === undefined)
    throw Error("Missing 'code' property on error object");

  return code;
}