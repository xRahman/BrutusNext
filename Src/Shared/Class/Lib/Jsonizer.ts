/*
  Part of BrutusNext

  Writes properties to json object
*/

import { Types } from "../../../Shared/Utils/Types";
import { Syslog } from "../../../Shared/Log/Syslog";
import { Json } from "../../../Shared/Class/Json";
import { Attributable } from "../../../Shared/Class/Attributable";
import { Serializable } from "../../../Shared/Class/Serializable";

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
    private readonly AttributableClass: typeof Attributable,
    private readonly customPropertyToJson:
      Serializable.PropertyToJson | undefined,
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

    // Cycle through all properties in source object.
    for (const propertyName in this)
    {
      if (isWrittenOutOfOrder(propertyName))
        continue;

      // Skip inherited properties (they are serialized on prototype entity).
      if (!this.hasOwnProperty(propertyName))
        continue;

      // ! Throws exception on error.
      if (!this.isSerialized(propertyName))
        continue;

      const property = Json.readProperty(this, propertyName);

      // Skip values like [] or {} that are created by instantiation
      // (they would unnecessarily clutter the JSON).
      if (!hasOwnValue(property))
        continue;

      const propertyJson = this.propertyToJson(property, propertyName);

      Json.writeProperty(json, propertyName, propertyJson);
    }

    return json;
  }

  // --------------- Private methods --------------------

  // ! Throws exception on error.
  private isSerialized(propertyName: string): boolean
  {
    const attributes = this.AttributableClass.propertyAttributes(propertyName);

    switch (this.mode)
    {
      case "Save to file":
        return attributes.saved === true;

      case "Send to client":
        return attributes.sentToClient === true;

      case "Send to server":
        return attributes.sentToServer === true;

      case "Send to editor":
        return attributes.edited === true;

      default:
        throw Syslog.reportMissingCase(this.mode);
    }
  }

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
        className,
        this.mode
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
    {
      if (isEntity(property))
        // ! Throws exception on error.
        return this.entityToJson(property, propertyName);

      // ! Throws exception on error.
      return property.toJson(this.mode);
    }

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
      + ` Serializable nor has a type that we know how to save. Either`
      + ` extend it from Serializable or add this functionality to`
      + ` Serializable.ts. Property is not serialized`);
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
  private bitvectorToJson(bitvector: any, propertyName: string): object
  {
    const bitvectorRecord = {};

    if (!("toJSON" in bitvector))
    {
      throw Error(`Failed to serialize class '${this.source.className}'`
        + ` because property ${propertyName} doesn't have 'toJSON' method`);
    }

    Json.writeProperty(bitvectorRecord, CLASS_NAME, BITVECTOR_CLASS_NAME);
    Json.writeProperty(bitvectorRecord, DATA, bitvector.toJSON());

    return bitvectorRecord;
  }

  // ! Throws exception on error.
  private entityToJson(entity: object, propertyName: string): object
  {
    const entityRecord = {};

    const id = Json.readProperty(entity, ID);

    if (!Types.isString(id))
    {
      throw Error(`Failed to serialize class '${this.source.className}'`
        + ` because ${propertyName}.${ID} is not a string`);
    }

    Json.writeProperty(entityRecord, CLASS_NAME, ENTITY_CLASS_NAME);
    Json.writeProperty(entityRecord, ID, id);

    return entityRecord;
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
  // We can't import Entity to Serializable because it would cause
  // cyclic module dependency error. So instead we just test if there
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
  Json.writeProperty(json, DATA, mapDataToJson(map));

  return json;
}

function mapDataToJson(map: Map<any, any>): object
{
  const json = {};

  for (const [ key, value ] of map.entries())
    Json.writeProperty(json, key, value);

  return json;
}