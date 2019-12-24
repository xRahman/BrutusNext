/*
  Part of BrutusNext

  Stores instances of all entities.
*/

import { Types } from "../../Shared/Utils/Types";
import { FileSystem } from "../../Server/FileSystem/FileSystem";
import { JsonObject } from "../../Shared/Class/JsonObject";
import { timeOfBoot } from "../../Server/BrutusNextServer";
import { Entity } from "../../Shared/Class/Entity";
import * as Shared from "../../Shared/Class/Entities";

// Counter of ids issued in this boot.
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

  // ! Throws exception on error.
  export async function loadEntity(directory: string, id: string)
  : Promise<Entity>
  {
    const fileName = getFileName(id);
    const path = FileSystem.joinPathSegments([ directory, fileName ]);
    // ! Throws exception on error.
    const json = await FileSystem.readExistingFile(path);

    // ! Throws exception on error.
    return loadEntityFromJson(json, id);
  }

  export function getFileName(id: string): string
  {
    return `${id}.json`;
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function loadEntityFromJson(json: string, expectedId: string): Entity
{
  // ! Throws exception on error.
  const jsonObject = JsonObject.parse(json);

  return Shared.Entities.loadEntityFromJsonObject(jsonObject, expectedId);
}

function generateId(): string
{
  // Increment lastIssuedId first so we start with 1 (initial value is 0).
  lastIssuedId++;

  // String id consists of a radix-36 representation of current boot
  // timestamp (in miliseconds from the start of computer age) and
  // a radix-36 representation of lastIssuedId separated by dash ('-').
  // (radix 36 is used because it's a maximum radix toString() allows to use
  // and thus it leads to the shortest possible string representation of id)
  const idCounter = lastIssuedId.toString(36);
  const bootTime = timeOfBoot.getTime().toString(36);

  return `${bootTime.padStart(8, "0")}-${idCounter.padStart(8, "0")}`;
}