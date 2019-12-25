/*
  Part of BrutusNext

  Stores instances of all entities.
*/

// Client-side entities probably won't be needed after
// all but I'll leave this here just in case.

import { Types } from "../../Shared/Utils/Types";
import { Entity } from "../../Shared/Class/Entity";
import * as Shared from "../../Shared/Class/Entities";

// Counter of issued ids
let lastIssuedId = 0;

export namespace Entities
{
  // ! Throws exception on error.
  export function newRootEntity<T>(Class: Types.NonabstractClass<T>): T
  {
    // ! Throws exception on error.
    return newEntity(Class.name).dynamicCast(Class);
  }

  // ! Throws exception on error.
  export function newEntity
  (
    // Either an entity id or a class name if you are instantiating
    // direcly from a hardcoded entity class.
    prototypeId: string
  )
  : Entity
  {
    const prototype = Shared.Entities.get(prototypeId);

    // ! Throws exception on error.
    return Shared.Entities.instantiateEntity(prototype, generateId());
  }

  // // ! Throws exception on error.
  // export async function loadEntity(directory: string, id: string)
  // : Promise<Entity>
  // {
  //   const fileName = getFileName(id);
  //   const path = FileSystem.joinPathSegments([ directory, fileName ]);
  //   // ! Throws exception on error.
  //   const json = await FileSystem.readExistingFile(path);

  //   // ! Throws exception on error.
  //   return loadEntityFromJson(json, id);
  // }

  // export function getFileName(id: string): string
  // {
  //   return `${id}.json`;
  // }
}

// ----------------- Auxiliary Functions ---------------------

// // ! Throws exception on error.
// function loadEntityFromJson(json: string, expectedId: string): Entity
// {
//   // ! Throws exception on error.
//   const jsonObject = JsonObject.parse(json);

//   return Shared.Entities.loadEntityFromJsonObject(jsonObject, expectedId);
// }

function generateId(): string
{
  // Increment lastIssuedId first so we start with 1 (initial value is 0).
  lastIssuedId++;

  // Timestamp is not part of Client-side entities because they
  // are not saved - everything is destroyed when browser tab is
  // closed and created anew when it is opened again.
  const idCounter = lastIssuedId.toString(36);

  return `${idCounter.padStart(8, "0")}`;
}