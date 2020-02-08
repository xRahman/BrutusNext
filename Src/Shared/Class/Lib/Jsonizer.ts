/*
  Part of BrutusNext

  Stores properties to json object
*/

import { Types } from "../../../Shared/Utils/Types";
import { Json } from "../../../Shared/Class/Json";
import { Serializable } from "../../../Shared/Class/Serializable";

type PropertyToJson = Serializable.PropertyToJson;

// Names of classes that are transformed to JSON in a special way
// or are serialized only as a reference.
const BITVECTOR_CLASS_NAME = Serializable.BITVECTOR_CLASS_NAME;
const SET_CLASS_NAME = Serializable.SET_CLASS_NAME;
const MAP_CLASS_NAME = Serializable.MAP_CLASS_NAME;
const ENTITY_CLASS_NAME = Serializable.ENTITY_CLASS_NAME;

// Names of properties that require special handling.
const CLASS_NAME = Serializable.CLASS_NAME;
const NAME = "name";

const ID = Serializable.ID;
const PROTOTYPE_ID = Serializable.PROTOTYPE_ID;

// Special property name used to store serialized data of Map,
// Set and Bitvector.
const DATA = Serializable.DATA;

export class Jsonizer
{
  constructor
  (
    private readonly source: Serializable,
    private readonly StaticInterface: typeof Serializable,
    private readonly customPropertyToJson: PropertyToJson | undefined,
    private readonly mode: Serializable.Mode
  )
  {
  }

  // ---------------- Public methods --------------------

  public objectToJson(source: object, json?: object): object
  {
    if (json === undefined || json === null)
      json = {};

    // Save these properties first to make JSON more readable.
    copyOwnProperty(source, json, ID);
    copyOwnProperty(source, json, PROTOTYPE_ID);
    copyOwnProperty(source, json, NAME);

    for (const propertyName in source)
    {
      if (!this.hasOwnProperty(propertyName))
        continue;

      if (isWrittenOutOfOrder(propertyName))
        continue;

      // ! Throws exception on error.
      if (!this.StaticInterface.isSerialized(propertyName, this.mode))
        continue;

      const property = Json.readProperty(this, propertyName);

      // Skip values like [] or {} because they are created
      // by instantiation so they don't need to be in JSON.
      if (!hasOwnValue(property))
        continue;

      const propertyJson = this.propertyToJson(property, propertyName);

      Json.writeProperty(json, propertyName, propertyJson);
    }

    return json;
  }

  // --------------- Private methods --------------------

  // ! Throws exception on error.
  private propertyToJson(property: any, propertyName: string): any
  {
    const className = this.source.className;

    // Allow custom property serialization.
    if (this.customPropertyToJson)
    {
      return this.customPropertyToJson
      (
        property,
        propertyName,
        className
      );
    }

    // Primitive values (number, string, undefined, null, etc.)
    // are directly assigned.
    if (Types.isPrimitiveType(property))
      return property;

    if (Array.isArray(property))
      // ! Throws exception on error.
      return this.arrayToJson(property);

    if (property instanceof Serializable)
      // ! Throws exception on error.
      return this.serializableToJson(property, propertyName);

    if (Types.isDate(property))
    {
      throw Error("Attempt to serialize property of type Date()."
        + " Date object should not be used because it can't be"
        + " properly inherited using prototypal inheritance."
        + " Use class Time instead. Property is not serialized");
    }

    if (property instanceof Map)
      return mapToJson(property);

    if (Types.isBitvector(property))
      // ! Throws exception on error.
      return this.bitvectorToJson(property, propertyName);

    if (property instanceof Set)
      return setToJson(property);

    if (Types.isPlainObject(property))
      return this.objectToJson(property);

    throw Error(`Property '${propertyName}' in class '${className}'`
      + ` is an instance of a class which is neither inherited from`
      + ` Serializable nor has a type that we know how to serialize.`
      + ` Either extend it from Serializable or add this functionality`
      + ` to Serializable.ts. Property is not serialized`);
  }

  // ! Throws exception on error.
  private arrayToJson(array: Array<any>): Array<any>
  {
    const arrayJson = [];

    for (let i = 0; i < array.length; i++)
    {
      // ! Throws exception on error.
      const itemJson = this.propertyToJson(array[i], `Array item [${i}]`);

      arrayJson.push(itemJson);
    }

    return arrayJson;
  }

  // ! Throws exception on error.
  private serializableToJson
  (
    property: Serializable,
    propertyName: string
  )
  : object
  {
    if (isEntity(property))
      // ! Throws exception on error.
      return this.entityToJson(property, propertyName);

    // ! Throws exception on error.
    return property.toJson(this.mode);
  }

    // ! Throws exception on error.
  private bitvectorToJson(bitvector: any, propertyName: string): object
  {
    const json = {};

    if (!("toJSON" in bitvector))
    {
      throw Error(`Failed to serialize ${this.source.debugId} because`
        + ` property ${propertyName} doesn't have 'toJSON' method`);
    }

    Json.writeProperty(json, CLASS_NAME, BITVECTOR_CLASS_NAME);
    Json.writeProperty(json, DATA, bitvector.toJSON());

    return json;
  }

  // ! Throws exception on error.
  private entityToJson(entity: object, propertyName: string): object
  {
    const json = {};

    const id = Json.readProperty(entity, ID);

    if (!Types.isString(id))
    {
      throw Error(`Failed to serialize class '${this.source.className}'`
        + ` because ${propertyName}.${ID} is not a string`);
    }

    Json.writeProperty(json, CLASS_NAME, ENTITY_CLASS_NAME);
    Json.writeProperty(json, ID, id);

    return json;
  }
}

// ----------------- Auxiliary Functions ---------------------

function copyOwnProperty
(
  source: object,
  json: object,
  propertyName: string
)
: void
{
  if (source.hasOwnProperty(propertyName))
  {
    const property = Json.readProperty(source, propertyName);

    Json.writeProperty(json, propertyName, property);
  }
}

function isWrittenOutOfOrder(propertyName: string): boolean
{
  return propertyName === NAME
      || propertyName === CLASS_NAME
      || propertyName === ID
      || propertyName === PROTOTYPE_ID;
}

// -> Returns 'true' if 'variable' has own (not just inherited) value.
function hasOwnValue(variable: any): boolean
{
  // Variables of primitive types are always serialized.
  if (Types.isPrimitiveType(variable))
    return true;

  const isArrayType =
    Types.isMap(variable) || Types.isSet(variable) || Array.isArray(variable);

  if (isArrayType)
  {
    // Maps, Sets and Arrays are always instantiated as 'new Map()',
    // 'new Set()' or [], so we only need to serialize them if they
    // contain something.
    return variable.size !== 0;
  }

  // Other nonprimitive variables are only saved if they contain
  // any own (not inherited) properties which have some own (not
  // inherited) value themselves.
  for (const propertyName in variable)
  {
    if (!variable.hasOwnProperty(propertyName))
      continue;

    if (hasOwnValue(variable[propertyName]))
      return true;
  }

  return false;
}

function isEntity(variable: object): boolean
{
  // We can't import Entity here because it would cause cyclic
  // module dependency error. So instead we just test if there
  // is an 'id' property in 'variable'.
  return ID in variable;
}

function setToJson(set: Set<any>): object
{
  const json = {};

  Json.writeProperty(json, CLASS_NAME, SET_CLASS_NAME);
  Json.writeProperty(json, DATA, Array.from(set));

  return json;
}

function mapToJson(map: Map<any, any>): object
{
  const json = {};

  Json.writeProperty(json, CLASS_NAME, MAP_CLASS_NAME);
  Json.writeProperty(json, DATA, mapToObject(map));

  return json;
}

function mapToObject(map: Map<any, any>): object
{
  const result = {};

  for (const [ key, value ] of map.entries())
    Json.writeProperty(result, key, value);

  return result;
}