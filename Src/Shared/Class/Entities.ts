/*
  Part of BrutusNEXT
*/

import { Types } from "../../Shared/Utils/Types";
import { ID, PROTOTYPE_ID } from "../../Shared/Class/Serializable";
import { Entity } from "../../Shared/Class/Entity";
import { ClassFactory } from "../../Shared/Class/ClassFactory";

// [Key]:   Entity id.
// [Value]: Entity instance.
const entities = new Map<string, Entity>();

// Use a static class because we need to inherit from it
// (new entities are only created on the server) which
// cannot be done using namespaces split to different files.
export namespace Entities
{
  // ! Throws exception on error.
  export function get(id: string): Entity
  {
    const entity = entities.get(id);

    if (entity === undefined)
      throw Error(`Entity with id '${id}' is not in Entities`);

    return entity;
  }

  // -> Returns respective entity if it exists in Entities,
  //    invalid entity otherwise.
  export function getReference(id: string): Entity
  {
    const entity = entities.get(id);

    if (entity === undefined)
      return createInvalidEntity(id);

    return entity;
  }

  export function has(id: string): boolean
  {
    return entities.has(id);
  }

  // ! Throws exception on error.
  export function remove(entity: Entity): void
  {
    if (!entities.delete(entity.getId()))
    {
      throw Error(`Failed to remove entity with id '${entity.getId()}'`
        + ` from Entities because it's not there`);
    }

    // Recursively delete all properties and set the prototype to 'null'.
    // This way if anyone has a reference to this entity and tries to access
    // it's properties, an exception will be thrown (so we will know that
    // someone tries to use a deleted entity).
    entity.invalidate();
  }

  // ! Throws exception on error.
  export function createRootPrototypeEntity<T extends Entity>
  (
    Class: Types.NonabstractClass<T>
  )
  : Entity
  {
    const prototype = new Class();

    prototype.setId(Class.name);

    // ! Throws exception on error.
    return instantiateEntity(prototype, Class.name);
  }

  // ! Throws exception on error.
  export function entityFromJson
  (
    json: object,
    expectedId?: string
  )
  : Entity
  {
    // ! Throws exception on error.
    const id = getStringProperty(json, ID);

    if (expectedId !== undefined && expectedId !== id)
    {
      throw Error(`Failed to load entity from json object because`
        + ` contained id ${id} differs expected id ${expectedId} (which`
        + ` is part of the name of file where the entity is saved)`);
    }

    // ! Throws exception on error.
    const prototypeId = getStringProperty(json, PROTOTYPE_ID);
    // ! Throws exception on error.
    const prototype = get(prototypeId);
    const entity = instantiateEntity(prototype, id);

    return entity.fromJson(json);
  }

  // ! Throws exception on error.
  export function instantiateEntity(prototype: Entity, id: string): Entity
  {
    const existingEntity = entities.get(id);

    // Allow overwritting of existing entities.
    if (existingEntity)
      return existingEntity;

    const entity = ClassFactory.instantiate(prototype);

    entity.setIds(id, prototype.getId());

    entities.set(id, entity);

    entity.onInstantiation();

    return entity;
  }
}

// ----------------- Auxiliary Functions ---------------------

function createInvalidEntity(id: string): Entity
{
  const invalidEntity =
  {
    getId: () => { return id; },
    isValid: () => { return false; },
    debugId: `{ Invalid entity reference, id: ${id} }`
  };

  // Most of the properties will be 'undefined'. That is intentional,
  // accessing them wil throw an exception.
  return invalidEntity as Entity;
}

// ! Throws exception on error.
function getStringProperty(jsonData: object, propertyName: string): string
{
  const property = (jsonData as any)[propertyName];

  if (!property)
    throw Error(`Missing or invalid ${propertyName} in json data`);

  if (!Types.isString(property))
    throw Error(`Property ${propertyName} in json data is not a string`);

  return property;
}