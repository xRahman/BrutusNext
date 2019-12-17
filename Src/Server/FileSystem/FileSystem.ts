/*
  Part of BrutusNext

  Filesystem I/O operations
*/

import { ErrorUtils } from "../../Shared/Utils/ErrorUtils";
import { SavingQueue } from "../../Server/FileSystem/SavingQueue";

// Node.js modules.
import * as Path from "path";

// 3rd party modules.
import * as FS from "fs-extra";

type FileEncoding = "utf8" | "binary";

// Most Unix filesystems have limit of 255 bytes on file name length.
const MAX_FILENAME_LENGTH_BYTES = 255;

// This map is used to encode strings as useable file names.
// '~' is used as escape character.
const RESERVED_FILENAME_CHARACTERS = new Map
(
  [
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

// This map is used to encode strings as useable file names.
// '~' is used as escape character.
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

// [Key]: relative path of saved file.
const savingQueues = new Map<string, SavingQueue>();

export namespace FileSystem
{
  // ---------------- Public methods --------------------

  // Checks if 'fileName' is valid both on Windows and Linux.
  export function validateFileName
  (
    fileName: string
  )
  : "File name is valid" | { problem: string }
  {
    if (fileName.length === 0)
    {
      return { problem: "File name is empty" };
    }

    if (byteLengthOf(fileName) > MAX_FILENAME_LENGTH_BYTES)
    {
      const problem = `File name exceeds ${MAX_FILENAME_LENGTH_BYTES} bytes`;

      return { problem };
    }

    // Disallow characters < > : " / \ | ? *
    if ((/[<>:"/\\|?*\x00-\x1F]/ug).test(fileName))
    {
      const problem = `File name contains invalid charcters(s)`
        + ` (< > : " / \\ | ? *)`;

        return { problem };
    }

    // Disallow names reserved on Windows.
    if ((/^(?<suffix>con|prn|aux|nul|com[0-9]|lpt[0-9])$/ui).test(fileName))
    {
      return { problem: "File name is reserved on Windows" };
    }

    // Disallow '.' and '..'.
    if ((/^\.\.?$/u).test(fileName))
    {
      return { problem: "'.' and '..' cannot be used as file name" };
    }

    return "File name is valid";
  }

  // ! Throws exception on error.
  export async function readExistingFile
  (
    path: string,
    encoding: FileEncoding = "utf8"
  )
  : Promise<string>
  {
    // ! Throws exception on error.
    const readResult = await readFile(path, encoding);

    if (readResult === "File doesn't exist")
      throw Error(`File "${path}" doesn't exist`);

    return readResult.data;
  }

  // ! Throws exception on error.
  export async function readFile
  (
    path: string,
    encoding: FileEncoding = "utf8"
  )
  : Promise<{ data: string } | "File doesn't exist">
  {
    // ! Throws exception on error.
    mustBeRelative(path);

    try
    {
      const data = await FS.readFile(path, encoding);

      return { data };
    }
    catch (error)
    {
      // ! Throws exception on error.
      const errorCode = ErrorUtils.getErrorCode(error);

      if (errorCode === "ENOENT")
        return "File doesn't exist";

      throw ErrorUtils.prependMessage
      (
        `Unable to read file '${path}' (error code: ${errorCode})`,
        error
      );
    }
  }

  // ! Throws exception on error.
  export async function writeFile
  (
    path: string,
    data: string,
    encoding: FileEncoding = "utf8"
  )
  : Promise<void>
  {
    const fileName = Path.posix.basename(Path.posix.normalize(path));
    const validationResult = validateFileName(fileName);

    if (validationResult !== "File name is valid")
    {
      throw Error(`Failed to write file because "${fileName}"`
        + ` is not a valid file name (${validationResult.problem})`);
    }

    // Following code is addressing feature of node.js file saving
    // functions which says that we must not attempt saving the same
    // file until any previous saving finishes (otherwise it is not
    // guaranteed that file will be saved correctly).
    //   To ensure this, we queue saving requests to each file and
    // process them one by one.
    const ourTurn = queueSavingRequest(path);

    await ourTurn;

    try
    {
      // ! Throws exception on error.
      await writeData(path, data, encoding);
      startNextSaving(path);
    }
    catch (error)
    {
      startNextSaving(path);
      throw error;
    }
  }

  // ! Throws exception on error.
  export async function deleteFile(path: string): Promise<void>
  {
    // ! Throws exception on error.
    mustBeRelative(path);

    try
    {
      await FS.unlink(path);
    }
    catch (error)
    {
      // ! Throws exception on error.
      const errorCode = ErrorUtils.getErrorCode(error);

      throw ErrorUtils.prependMessage
      (
        `Failed to delete file '${path}' (error code: ${errorCode})`,
        error
      );
    }
  }

  // ! Throws exception on error.
  export async function exists(path: string): Promise<boolean>
  {
    // ! Throws exception on error.
    mustBeRelative(path);

    return FS.pathExists(path);
  }

  // ! Throws exception on error.
  export async function ensureDirectoryExists(directory: string): Promise<void>
  {
    // ! Throws exception on error.
    mustBeRelative(directory);

    try
    {
      await FS.ensureDir(directory);
    }
    catch (error)
    {
      // ! Throws exception on error.
      const errorCode = ErrorUtils.getErrorCode(error);

      throw ErrorUtils.prependMessage
      (
        `Unable to ensure existence of directory '${directory}'`
          + `(error code: ${errorCode})`,
        error
      );
    }
  }

  // ! Throws exception on error.
  // -> Returns array of file names in directory, including
  //    subdirectories, excluding '.' and '..'.
  export async function readDirectoryContents
  (
    directory: string
  )
  : Promise<Array<string>>
  {
    // ! Throws exception on error.
    mustBeRelative(directory);

    try
    {
      return await FS.readdir(directory);
    }
    catch (error)
    {
      const errorCode = ErrorUtils.getErrorCode(error);

      throw ErrorUtils.prependMessage
      (
        `Unable to read contents of directory '${directory}'`
          + `(error code: ${errorCode})`,
        error
      );
    }
  }

  // ! Throws exception on error.
  export async function isDirectory(path: string): Promise<boolean>
  {
    // ! Throws exception on error.
    mustBeRelative(path);

    // ! Throws exception on error.
    return (await statFile(path)).isDirectory();
  }

  // ! Throws exception on error.
  export async function isFile(path: string): Promise<boolean>
  {
    // ! Throws exception on error.
    mustBeRelative(path);

    // ! Throws exception on error.
    return (await statFile(path)).isFile();
  }

  // ! Throws exception on error.
  export function encodeAsFileName(str: string): string
  {
    const encodedStr = encodeStringAsFileName(str);

    if (byteLengthOf(encodedStr) > MAX_FILENAME_LENGTH_BYTES)
    {
      throw Error(`Failed to encode string "${str}" as file name`
        + ` because after encoding it exceeds maximum byte length`
        + ` of a file name. Truncating it could mask another file`
        + ` name, which could lead to nasty errors so it's better`
        + ` to use another unique file name instead`);
    }

    return encodedStr;
  }

/// TO BE DELETED.
/// Místo tohohle rovnou zavolat encodeAsFileName() a odchytnout exception.
// // ! Throws exception on error.
// export function hasValidByteLengthAsFileName(str: string): boolean
// {
//   const encodedStr = encodeStringAsFileName(str);

//   return getByteLength(encodedStr) <= MAX_FILENAME_LENGTH_BYTES;
// }

/// TO BE DELETED.
/// Tohle prostě jen přečte data ze souboru s tím, že soubor musí existovat.
/// To samý dělá funkce readExistingFile(), takže použít tu.
// // ! Throws exception on error.
// export async function loadJsonFromFile(directory: string, fileName: string)
// : Promise<string>
// {
//   const path = composePath(directory, fileName);

//   const readResult = await readFile(path);

//   if (readResult === "File doesn't exist")
//   {
//     throw Error(`Failed to load file '${path}'`
//       + ` because it doesn't exist`);
//   }

//   return readResult.data;
// }

  export function composePath(directory: string, fileName: string): string
  {
    return Path.posix.join(Path.posix.normalize(directory), fileName);
  }
}

// ----------------- Auxiliary Functions ---------------------

async function queueSavingRequest(path: string): Promise<void>
{
  const queue = savingQueues.get(path);

  if (queue === undefined)
  {
    savingQueues.set(path, new SavingQueue());

    // If the queue was empty, saving is possible right now
    // so we return an already resolved promise.
    return Promise.resolve();
  }

  return queue.addNewRequest();
}

// ! Throws exception on error.
function startNextSaving(path: string): void
{
  const queue = savingQueues.get(path);

  if (queue === undefined)
  {
    throw Error(`Attempt to finish saving of file "${path}"`
      + ` which is not registered as being saved`);
  }

  const nextRequest = queue.pullNextRequest();

  if (nextRequest === "Queue is empty")
  {
    savingQueues.delete(path);
    return;
  }

  nextRequest.startSaving();
}

// ! Throws exception on error.
function mustBeRelative(path: string): void
{
  if (Path.posix.isAbsolute(Path.posix.normalize(path)))
    throw Error(`File path "${path}" is not relative`);

  // Double dot can be used to traverse out of working directory
  // so we need to prevent it as well.
  if (path.includes(".."))
  {
    throw Error(`File path "${path}" is not valid.`
    + ` Ensure that it doesn't contain '..'`);
  }
}

// ! Throws exception on error.
async function writeData
(
  path: string,
  data: string,
  encoding: FileEncoding = "utf8"
)
: Promise<void>
{
  // ! Throws exception on error.
  mustBeRelative(path);

  try
  {
    // 'FS.outputFile()' creates the directory if it doesn't exist.
    await FS.outputFile(path, data, encoding);
  }
  catch (error)
  {
    const errorCode = ErrorUtils.getErrorCode(error);

    throw ErrorUtils.prependMessage
    (
      `Failed to save file '${path}' (error code: ${errorCode})`,
      error
    );
  }
}

// ! Throws exception on error.
async function statFile(path: string): Promise<FS.Stats>
{
  // ! Throws exception on error.
  mustBeRelative(path);

  try
  {
    return await FS.stat(path);
  }
  catch (error)
  {
    const errorCode = ErrorUtils.getErrorCode(error);

    throw ErrorUtils.prependMessage
    (
      `Unable to stat file '${path}' (error code: ${errorCode})`,
      error
    );
  }
}

// ! Throws exception on error.
function byteLengthOf(str: string): number
{
  // This should work on node.js.
  if (typeof (Buffer as any) === "undefined")
  {
    throw Error(`Unable to compute byte length of string`
    + ` "${str}" because 'Buffer' object is not supported.`
    + ` Maybe we are not running under Node.js?`);
  }

  return Buffer.byteLength(str, "utf8");
}

function escapeControlCharacter(str: string, charCode: number): string
{
  // Create string from integer charcode value.
  const key = String.fromCharCode(charCode);
  const value = `~${charCode}~`;

  return str.split(key).join(value);
}

function escapeReservedCharacters(str: string): string
{
  let result = str;

  for (const [ key, value ] of RESERVED_FILENAME_CHARACTERS.entries())
    result = result.split(key).join(value);

  return result;
}

function escapeReservedFilenames(str: string): string
{
  for (const [ key, value ] of RESERVED_FILENAMES.entries())
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

function escapeControlCharacters(str: string): string
{
  let result = str;

  // Escape control characters (0x00–0x1F)
  for (let i = 0x00; i < 0x1F; i++)
    result = escapeControlCharacter(result, i);

  // Escape control characters (0x80–0x9F)
  for (let i = 0x80; i < 0x9F; i++)
    result = escapeControlCharacter(result, i);

  return result;
}

function escapeTrailingCharacter(str: string, character: string): string
{
  if (str.endsWith(character))
    return `${str.slice(0, -1)}~${character}~`;

  return str;
}

function encodeStringAsFileName(str: string): string
{
  let result = str.toLowerCase();

  result = escapeReservedCharacters(result);
  result = escapeReservedFilenames(result);
  result = escapeControlCharacters(result);
  result = escapeTrailingCharacter(result, ".");
  result = escapeTrailingCharacter(result, " ");

  return result;
}