/*
  Part of BrutusNext

  Extracts properties from json object
*/

import { Types } from "../../../Shared/Utils/Types";
import { Json } from "../../../Shared/Class/Json";
import { Entities } from "../../../Shared/Class/Entities";
import { ClassFactory } from "../../../Shared/Class/ClassFactory";
import { Serializable } from "../../../Shared/Class/Serializable";

// 3rd party modules.
// Note: Disable eslint check for using 'require' because we
//   don't have type definitions for 'fastbitset' module so it cannot
//   be imported using 'import' keyword.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FastBitSet = require("fastbitset");

// Names of classes that are transformed to JSON in a special way
// or are serialized only as a reference.
const BITVECTOR_CLASS_NAME = Serializable.BITVECTOR_CLASS_NAME;
const SET_CLASS_NAME = Serializable.SET_CLASS_NAME;
const MAP_CLASS_NAME = Serializable.MAP_CLASS_NAME;
const ENTITY_CLASS_NAME = Serializable.ENTITY_CLASS_NAME;

// Names of properties that require special handling.
const VERSION = Serializable.VERSION;
const CLASS_NAME = Serializable.CLASS_NAME;

const ID = Serializable.ID;

// Special property name used to store serialized data of Map,
// Set and Bitvector.
const DATA = Serializable.DATA;

export class Dejsonizer
{
  constructor
  (
    private readonly target: Serializable,
    private readonly customPropertyFromJson:
      Serializable.PropertyFromJson | undefined,
    private readonly path?: string
  )
  {
  }

  // ---------------- Public methods --------------------

  // ! Throws exception on error.
  public objectFromJson
  (
    json: Types.Object,
    target: Types.Object
  )
  : object
  {
    if (target === null || target === undefined)
      target = {};

    for (const propertyName in json)
    {
      // Skip inherited properties.
      if (!json.hasOwnProperty(propertyName))
        continue;

      // 'className' represents the name of the javascript class
      // which cannot be changed and 'version' is serialized only
      // to be checked against.
      if (propertyName === CLASS_NAME || propertyName === VERSION)
        continue;

      // ! Throws exception on error.
      // We are cycling over properties in source JSON object, not in target
      // object to ensure that properties which are not present in source data
      // will not get overwritten with 'undefined'. This allows adding new
      // properties to existing classes without the need to convert all save
      // files.
      const property = this.propertyFromJson
      (
        propertyName,
        target[propertyName],
        json[propertyName]
      );

      Json.writeProperty(target, propertyName, property);
    }

    return target;
  }

  // --------------- Private methods --------------------

  private bitvectorFromJson(json: object): any
  {
    const bitvectorData = this.getProperty(json, DATA);

    return new FastBitSet(bitvectorData);
  }

  private mapFromObject(mapObject: object): Map<any, any>
  {
    const map = new Map();

    for (const [ key, value ] of Object.entries(mapObject))
      map.set(key, value);

    return map;
  }

  // ! Throws exception on error.
  private propertyFromJson(propertyName: string, json: any, target: any): any
  {
    // Allow custom property deserialization.
    if (this.customPropertyFromJson)
      return this.customPropertyFromJson(propertyName, json, target);

    // ! Throws exception on error.
    this.validateJsonAndTarget(propertyName, json, target);

    if (Types.isPrimitiveType(json))
      // Properties of primitive types are simply assigned.
      return json;

    if (Array.isArray(json))
      // ! Throws exception on error.
      return this.arrayFromJson(json);

    const className = Json.readProperty(json, CLASS_NAME);

    if (className === undefined)
      return this.objectFromJson(json, target);

    switch (className)
    {
      case BITVECTOR_CLASS_NAME:
        // ! Throws exception on error.
        return this.bitvectorFromJson(json);

      case SET_CLASS_NAME:
        // ! Throws exception on error.
        return this.setFromJson(json);

      case MAP_CLASS_NAME:
        // ! Throws exception on error.
        return this.mapFromJson(json);

      case ENTITY_CLASS_NAME:
        // ! Throws exception on error.
        return this.entityFromJson(json);

      default:
        // ! Throws exception on error.
        return this.serializableFromJson
        (
          json,
          target,
          propertyName,
          className
        );
    }
  }

  // ! Throws exception on error.
  private validateJsonAndTarget
  (
    propertyName: string,
    json: any,
    target: any
  )
  : void
  {
    if (json === null)
    {
      throw Error(`Property '${propertyName}${this.inFile()}`
        + ` has 'null' value. 'null' is not allowed, make sure`
        + ` that it is not used anywhere`);
    }

    if (target === null)
    {
      throw Error(`Property '${propertyName}' in ${this.target.debugId}`
        + ` has 'null' value. 'null' is not allowed, make sure that it is`
        + ` not used anywhere`);
    }

    const typesMatch = typeof target === typeof json;

    if (target !== undefined && !typesMatch)
    {
      throw Error(`Failed to deserialize because target property`
        + ` '${propertyName}'${this.inFile()} is not 'undefined'`
        + ` or the same type as source property`);
    }
  }

  // ! Throws exception on error.
  private arrayFromJson(arrayJson: Array<any>): Array<any>
  {
    const array = [];

    for (let i = 0; i < arrayJson.length; i++)
    {
      const arrayItem = this.propertyFromJson
      (
        `Array item [${i}]`,
        undefined,
        arrayJson[i]
      );

      array.push(arrayItem);
    }

    return array;
  }

  // ! Throws exception on error.
  private setFromJson(json: object): Set<any>
  {
    // ! Throws exception on error.
    const setData = this.getProperty(json, DATA);

    return new Set(this.arrayFromJson(setData));
  }

  // ! Throws exception on error.
  private mapFromJson(json: object): Map<any, any>
  {
    const mapJson = this.getProperty(json, DATA);
    const mapObject = {};

    // ! Throws exception on error.
    this.objectFromJson(mapJson, mapObject);

    return this.mapFromObject(mapObject);
  }

  // ! Throws exception on error.
  // Converts 'param.sourceProperty' to a reference to an Entity.
  // If 'id' loaded from JSON already exists in Entities, existing
  // entity will be returned. Otherwise an 'invalid' entity reference
  // will be created and returned.
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private entityFromJson(json: object)
  // Let typescript infer the type here so we don't have to import Entity
  // (that would lead to cyclic import troubles).
  {
    const id = this.getProperty(json, ID);

    if (typeof id !== "string")
    {
      throw Error(`Unable to deserialize json data${this.inFile()}`
        + ` because property '${ID}' isn't a string`);
    }

    return Entities.getReference(id);
  }

  // ! Throws exception on error.
  private serializableFromJson
  (
    json: object,
    target: object,
    propertyName: string,
    className: string
  )
  : Serializable
  {
    // If target object is 'null' or 'undefined', we wouldn't be
    // able to write anything to it or call it's deserialize method.
    // So we first need to assign a new instance of correct type to
    // it - the type is saved in JSON as 'className' property.
    if (target === null || target === undefined)
      target = ClassFactory.newInstanceByName(className);

    if (!(target instanceof Serializable))
    {
      throw Error(`Failed to deserialize property '${propertyName}'`
        + `${this.inFile()} because target class '${className}'`
        + ` isn't a Serializable class`);
    }

    return target.fromJson(json, this.path);
  }

  // ! Throws exception on error.
  private getProperty(json: object, propertyName: string): any
  {
    const property = Json.readProperty(json, propertyName);

    if (property === undefined || property === null)
    {
      throw Error(`Failed to deserialize data because property`
        + ` '${propertyName}'${this.inFile()} isn't valid`);
    }

    return property;
  }

  private inFile(): string
  {
    if (!this.path)
      return "";

    return ` in file ${this.path}`;
  }
}