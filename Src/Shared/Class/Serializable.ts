/*
  Part of BrutusNext

  Automated serializing of classes to JSON format
*/

/*
  Notes:
    Properties that are not present in json object will not be
    deleted from target object when deserializing. It means that
    you can add new properties to existing classes without converting
    existing save files (but you should initialize them with default
    values).

    Properties are loaded even if they don't exist in class
    into which we are loading. This allows saving of properties
    created in runtime.

    If a property contains an Entity class, only an id is serialized.
    When deserializing, an instance with the same id is assigned to
    that property if it is in memory, invalid reference otherwise.

    Serializing of entities as a reference (using entity 'id')
    is implemented in Serializable.ts rather than in Entity.ts to allow
    referencing entities in non-entity Serializable classes.

    Descendants of Serializable can override methods customSerializeProperty()
    and customDeserializeProperty() to change how specific properties are
    serialized.

  Implementation notes:
    At the moment, property attributes are checked only for direct properties
    of Serializable instances so if you use a plain {} as a property, you
    can't set attributes to it's properties. You can, however, use
    a Serializable class instead of {} for this purpose.
*/

import { Types } from "../../Shared/Utils/Types";
import { Syslog } from "../../Shared/Log/Syslog";
import { Entities } from "../../Shared/Class/Entities";
import { ClassFactory } from "../../Shared/Class/ClassFactory";
import { Json } from "../../Shared/Class/Json";
import { Attributable } from "../../Shared/Class/Attributable";

// 3rd party modules.
// Note: Disable eslint check for using 'require' because we
//   don't have type definitions for 'fastbitset' module so it cannot
//   be imported using 'import' keyword.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FastBitSet = require("fastbitset");

// Names of classes that are transformed to JSON in a special way
// or are serialized only as a reference.
const BITVECTOR_CLASS_NAME = "Bitvector";
const SET_CLASS_NAME = "Set";
const MAP_CLASS_NAME = "Map";
const ENTITY_CLASS_NAME = "Entity";

// Names of properties that require special handling.
const VERSION = "version";
const CLASS_NAME = "className";
const NAME = "name";

export const ID = "id";
export const PROTOTYPE_ID = "prototypeId";

// Special property name used to store serialized data of Map,
// Set and Bitvector.
const DATA = "data";

export class Serializable extends Attributable
{
  // ------------- Protected static data ----------------

  // 'version' is used to convert data from older formats.
  //   If your class is saved to disk, you have to initialize it's
  // 'version' (otherwise you get an exception while serializing).
  protected static version = 0;

  // ------------- Public static methods ----------------

  // ! Throws exception on error.
  // Use this method only for Serializable objects not inherited from Entity
  // ('path' is used in error messages to help with debugging).
  public static deserialize(data: string, path?: string): Serializable
  {
    // ! Throws exception on error.
    const json = Json.parse(data);

    // ! Throws exception on error.
    const className = readClassName(json, path);

    // ! Throws exception on error.
    const instance = ClassFactory.newInstanceByName(className);

    // ! Throws exception on error.
    return instance.fromJson(json, path);
  }

  // --------------- Public accessors -------------------

  // -> Returns string describing this object for error logging.
  public get debugId(): string
  {
    return `{ class: ${this.className} }`;
  }

  // ---------------- Public methods --------------------

  // ! Throws exception on error.
  public dynamicCast<T>(Class: Types.AnyClass<T>): T
  {
    if (!(this instanceof Class))
    {
      throw Error (`Type cast error: ${this.debugId} is not`
        + ` an instance of class (${Class.name})`);
    }

    return (this as unknown) as T;
  }

  // ! Throws exception on error.
  public serialize(mode: Serializable.Mode): string
  {
    const json = this.toJson(mode);

    return Json.stringify(json);
  }

  // ! Throws exception on error.
  public fromJson(json: object, path?: string): this
  {
    // ! Throws exception on error.
    /// TODO: This will probably have to be replaced by code that
    /// converts data to the new version (instead of preventing
    /// data to be deserialized by throwing an exception).
    this.versionMatchCheck(json, path);

    // ! Throws exception on error.
    this.classMatchCheck(json, path);

    // ! Throws exception on error.
    this.propertiesFromJson(json, this, path);

    return this;
  }

  // -------------- Protected methods -------------------

  // This method can be overriden to change how a property is serialized.
  protected propertyToCustomJson
  (
    property: any,
    propertyName: string,
    className: string,
    mode: Serializable.Mode
  )
  : { property?: any }
  {
    return {};
  }

  // This method can be overriden to change how a property is deserialized.
  protected propertyFromCustomJson
  (
    propertyName: string,
    source: any,
    target: any,
    path?: string
  )
  : { property?: any }
  {
    return {};
  }

  // --------------- Private methods --------------------

  // *** Serialize Methods ***

  // ! Throws exception on error.
  private toJson(mode: Serializable.Mode): object
  {
    const json = {};

    // Save these properties first to make JSON more readable.
    this.writeClassName(json);
    this.copyOwnProperty(json, ID);
    this.copyOwnProperty(json, PROTOTYPE_ID);
    this.copyOwnProperty(json, NAME);
    this.writeVersion(json, mode);

    // Cycle through all properties in source object.
    for (const propertyName in this)
    {
      if (isWrittenOutOfOrder(propertyName))
        continue;

      // Skip inherited properties (they are serialized on prototype entity).
      if (!this.hasOwnProperty(propertyName))
        continue;

      // ! Throws exception on error.
      if (!this.isSerialized(propertyName, mode))
        continue;

      const property = readProperty(this, propertyName);

      // Skip values like [] or {} that are created by instantiation
      // (they would unnecessarily clutter the JSON).
      if (!hasOwnValue(property))
        continue;

      const propertyJson =
        this.propertyToJson(property, propertyName, this.className, mode);

      writeProperty(json, propertyName, propertyJson);
    }

    return json;
  }

  private copyOwnProperty(json: object, propertyName: string): void
  {
    if (this.hasOwnProperty(propertyName))
    {
      const property = readProperty(this, propertyName);

      writeProperty(json, propertyName, property);
    }
  }

  private writeVersion(json: object, mode: Serializable.Mode): void
  {
    if (mode === "Send to client" || mode === "Send to server")
    {
      // Version is not written to serialized packets because they
      // are always sent and received by the same code so it's
      // unnecessary information.
      return;
    }

    // 'this.constructor' contains static properties of this class.
    if (!this.constructor.hasOwnProperty(VERSION))
    {
      throw Error(`Failed to serialize ${this.debugId}`
        + ` because it doesn't have static property`
        + ` '${VERSION}'. Make sure that 'static ${VERSION}'`
        + ` is inicialized in class ${this.className}`);
    }

    const version = this.getStaticProperty(VERSION);

    if (!Types.isNumber(version))
    {
      throw Error(`Failed to serialize ${this.debugId} because`
        + ` static property '${VERSION}' is not a number. Make`
        + ` sure that 'static ${VERSION}' is inicialized in`
        + ` class ${this.className} to a number`);
    }

    writeProperty(json, VERSION, version);
  }

  private writeClassName(json: object): void
  {
    writeProperty(json, CLASS_NAME, this.className);
  }

  // ! Throws exception on error.
  private isSerialized(propertyName: string, mode: Serializable.Mode): boolean
  {
    const attributes = this.propertyAttributes(propertyName);

    switch (mode)
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
        throw Syslog.reportMissingCase(mode);
    }
  }

  // ! Throws exception on error.
  private propertyToJson
  (
    property: any,
    propertyName: string,
    className: string,
    mode: Serializable.Mode
  )
  : any
  {
    // Allow custom property serialization in descendants.
    const customJson =
      this.propertyToCustomJson(property, propertyName, className, mode);

    if (customJson.property !== undefined)
      return customJson.property;

    // Primitive values (number, string, undefined, null, etc.)
    // are directly assigned.
    if (Types.isPrimitiveType(property))
      return property;

    // ! Throws exception on error.
    return this.objectToJson(property, propertyName, className, mode);
  }

  // ! Throws exception on error.
  private objectToJson
  (
    property: object,
    className: string,
    propertyName: string,
    mode: Serializable.Mode
  )
  : object
  {
    if (Array.isArray(property))
      // ! Throws exception on error.
      return this.arrayToJson(property, className, mode);

    if (property instanceof Serializable)
    {
      if (isEntity(property))
        // ! Throws exception on error.
        return entityToJson(property, className, propertyName);

      // ! Throws exception on error.
      return property.toJson(mode);
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
      return bitvectorToJson(property, className, propertyName);

    if (property instanceof Set)
      return setToJson(property);

    if (Types.isPlainObject(property))
      return this.plainObjectToJson(property, className, mode);

    throw Error(`Property '${propertyName}' in class '${className}'`
      + ` is an instance of a class which is neither inherited from`
      + ` Serializable nor has a type that we know how to save. Either`
      + ` extend it from Serializable or add this functionality to`
      + ` Serializable.ts. Property is not serialized`);
  }

  // ! Throws exception on error.
  private arrayToJson
  (
    array: Array<any>,
    className: string,
    mode: Serializable.Mode
  )
  : Array<any>
  {
    const arrayJson = [];

    for (let i = 0; i < array.length; i++)
    {
      // ! Throws exception on error.
      const itemJson = this.propertyToJson
      (
        array[i],
        `Array item [${i}]`,
        className,
        mode
      );

      arrayJson.push(itemJson);
    }

    return arrayJson;
  }

  // ! Throws exception on error.
  private plainObjectToJson
  (
    plainObject: Types.Object,
    className: string,
    mode: Serializable.Mode
  )
  : object
  {
    const json = {};

    // Serialize all properties of sourceObject.
    for (const propertyName in plainObject)
    {
      // Only serialize own (not inherited) properties.
      if (!plainObject.hasOwnProperty(propertyName))
        continue;

      const property = plainObject[propertyName];

      // Skip nonprimitive properties that don't have any own properties.
      if (!hasOwnValue(property))
        continue;

      const propertyJson =
        this.propertyToJson(property, propertyName, className, mode);

      writeProperty(json, propertyName, propertyJson);
    }

    return json;
  }

  // *** Deserialize Methods ***

  private getStaticProperty(propertyName: string): any
  {
    return (this.constructor as Types.Object)[propertyName];
  }

  // ! Throws exception on error.
  private versionMatchCheck(json: object, path?: string): void
  {
    const jsonVersion = readProperty(json, VERSION);

    // If there isn't a 'version' property in jsonObject,
    // it won't be checked for (version is not used in
    // packets because they are always sent and received
    // from the same version of code).
    if (jsonVersion === undefined)
      return;

    if (!Types.isString(jsonVersion))
    {
      throw Error(`Failed to deserialize because ${VERSION}`
        + ` property in JSON data${inFile(path)} isn't a string`);
    }

    const thisVersion = this.getStaticProperty(VERSION);

    if (!Types.isString(thisVersion))
    {
      throw Error(`Failed to deserialize because ${VERSION}`
        + ` property in target object isn't a string`);
    }

    if (jsonVersion !== thisVersion)
    {
      throw Error(`Failed to deserialize because version`
        + `${String(jsonVersion)}${inFile(path)} doesn't`
        + ` match target version ${String(thisVersion)}`);
    }
  }

  // ! Throws exception on error.
  private classMatchCheck
  (
    json: object,
    path?: string
  )
  : void
  {
    const className = readProperty(json, CLASS_NAME);

    if (className !== this.className)
    {
      throw Error(`Failed to deserialize because JSON data${inFile(path)}`
        + ` represents class '${String(className)}' while target class`
        + ` is '${this.className})`);
    }
  }

  // ! Throws exception on error.
  private propertiesFromJson
  (
    json: Types.Object,
    target: Types.Object,
    path?: string
  )
  : void
  {
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
        json[propertyName],
        path
      );

      writeProperty(target, propertyName, property);
    }
  }

  // ! Throws exception on error.
  private propertyFromJson
  (
    propertyName: string,
    json: any,
    target: any,
    path?: string
  )
  : any
  {
    // Allow custom property deserialization in descendants.
    const customJson =
      this.propertyFromCustomJson(propertyName, json, target, path);

    if (customJson.property !== undefined)
      return customJson.property;

    // ! Throws exception on error.
    this.validateJsonAndTarget(propertyName, json, target, path);

    if (Types.isPrimitiveType(json))
      // Properties of primitive types are simply assigned.
      return json;

    return this.objectFromJson(json, target, propertyName, path);
  }

  // ! Throws exception on error.
  private validateJsonAndTarget
  (
    propertyName: string,
    json: any,
    target: any,
    path?: string
  )
  : void
  {
    if (json === null)
    {
      throw Error(`Property '${propertyName}${inFile(path)}`
        + ` has 'null' value. 'null' is not allowed, make sure`
        + ` that it is not used anywhere`);
    }

    if (target === null)
    {
      throw Error(`Property '${propertyName}' in ${this.debugId} has`
        + ` 'null' value. 'null' is not allowed, make sure that it`
        + ` is not used anywhere`);
    }

    const typesMatch = typeof target === typeof json;

    if (target !== undefined && !typesMatch)
    {
      throw Error(`Failed to deserialize because target property`
        + ` '${propertyName}'${inFile(path)} is not 'undefined'`
        + ` or the same type as source property`);
    }
  }

  private objectFromJson
  (
    json: object,
    target: object,
    propertyName: string,
    path?: string
  )
  : object
  {
    if (Array.isArray(json))
      // ! Throws exception on error.
      return this.arrayFromJson(json, path);

    const className = readProperty(json, CLASS_NAME);

    if (className === undefined)
      return this.plainObjectFromJson(json, target, path);

    switch (className)
    {
      case BITVECTOR_CLASS_NAME:
        // ! Throws exception on error.
        return bitvectorFromJson(json, propertyName, path);

      case SET_CLASS_NAME:
        // ! Throws exception on error.
        return this.setFromJson(json, propertyName, path);

      case MAP_CLASS_NAME:
        // ! Throws exception on error.
        return this.mapFromJson(json, propertyName, path);

      case ENTITY_CLASS_NAME:
        // ! Throws exception on error.
        return entityFromJson(json, path);

      default:
        // ! Throws exception on error.
        return this.serializableFromJson
        (
          json,
          target,
          propertyName,
          className,
          path
        );
    }
  }

  // ! Throws exception on error.
  private plainObjectFromJson
  (
    json: object,
    target: object,
    path?: string
  )
  : object
  {
    if (target === null || target === undefined)
      target = {};

    // ! Throws exception on error.
    this.propertiesFromJson(json, target, path);

    return target;
  }

  // ! Throws exception on error.
  private arrayFromJson(arrayJson: Array<any>, path?: string): Array<any>
  {
    const array = [];

    for (let i = 0; i < arrayJson.length; i++)
    {
      const arrayItem = this.propertyFromJson
      (
        `Array item [${i}]`,
        undefined,
        arrayJson[i],
        path
      );

      array.push(arrayItem);
    }

    return array;
  }

  // ! Throws exception on error.
  private setFromJson
  (
    json: object,
    propertyName: string,
    path?: string
  )
  : Set<any>
  {
    // ! Throws exception on error.
    const setData = getProperty(json, propertyName, DATA);

    return new Set(this.arrayFromJson(setData, path));
  }

  // ! Throws exception on error.
  private mapFromJson
  (
    json: object,
    propertyName: string,
    path?: string
  )
  : Map<any, any>
  {
    const mapJson = getProperty(json, propertyName, DATA);
    const mapObject = {};

    // ! Throws exception on error.
    this.plainObjectFromJson(mapJson, mapObject, path);

    return mapFromObject(mapObject);
  }

  // ! Throws exception on error.
  private serializableFromJson
  (
    json: object,
    target: object,
    propertyName: string,
    className: string,
    path?: string
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
        + `${inFile(path)} because target class '${className}'`
        + ` isn't a Serializable class`);
    }

    return target.fromJson(json, path);
  }
}

// ----------------- Auxiliary Functions ---------------------

// *** Serialize Functions ***

function writeProperty
(
  json: Types.Object,
  propertyName: string,
  value: any
)
: void
{
  json[propertyName] = value;
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

function setToJson(set: Set<any>): object
{
  const json = {};

  writeProperty(json, CLASS_NAME, SET_CLASS_NAME);
  writeProperty(json, DATA, Array.from(set));

  return json;
}

function mapToJson(map: Map<any, any>): object
{
  const json = {};

  writeProperty(json, CLASS_NAME, MAP_CLASS_NAME);
  writeProperty(json, DATA, mapDataToJson(map));

  return json;
}

// ! Throws exception on error.
function bitvectorToJson
(
  bitvector: any,
  className: string,
  propertyName: string
)
: object
{
  const bitvectorRecord = {};

  if (!("toJSON" in bitvector))
  {
    throw Error(`Failed to serialize class '${className} because'`
      + ` property ${propertyName} doesn't have 'toJSON' method`);
  }

  writeProperty(bitvectorRecord, CLASS_NAME, BITVECTOR_CLASS_NAME);
  writeProperty(bitvectorRecord, DATA, bitvector.toJSON());

  return bitvectorRecord;
}

// ! Throws exception on error.
function entityToJson
(
  entity: object,
  className: string,
  propertyName: string
)
: object
{
  const entityRecord = {};

  const id = readProperty(entity, ID);

  if (!Types.isString(id))
  {
    throw Error(`Failed to serialize class '${className}'`
      + ` because ${propertyName}.${ID} is not a string.`
      + ` Object's with 'id' property are considered entities`
      + ` and as such must have a string ${ID} property`);
  }

  writeProperty(entityRecord, CLASS_NAME, ENTITY_CLASS_NAME);
  writeProperty(entityRecord, ID, id);

  return entityRecord;
}

function mapDataToJson(map: Map<any, any>): object
{
  const json = {};

  for (const [ key, value ] of map.entries())
    writeProperty(json, key, value);

  return json;
}

// ! Throws exception on error.
// Converts 'param.sourceProperty' to a reference to an Entity.
// If 'id' loaded from JSON already exists in Entities, existing
// entity will be returned. Otherwise an 'invalid' entity reference
// will be created and returned.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function entityFromJson
(
  json: object,
  path?: string
)
// Let typescript infer the type here so we don't have to import Entity
// (that would lead to cyclic import troubles).
{
  const id = getProperty(json, ID, path);

  return Entities.getReference(id);
}

function isEntity(variable: object): boolean
{
  // We can't import Entity to Serializable because it would cause
  // cyclic module dependency error. So instead we just test if there
  // is an 'id' property in 'variable'.
  return ID in variable;
}

function isWrittenOutOfOrder(propertyName: string): boolean
{
  return propertyName === NAME
      || propertyName === CLASS_NAME
      || propertyName === ID
      || propertyName === PROTOTYPE_ID;
}

// *** Deserialize Functions ***

function readProperty(json: Types.Object, propertyName: string): any
{
  return json[propertyName];
}

// ! Throws exception on error.
function getProperty(json: object, propertyName: string, path?: string): any
{
  const property = readProperty(json, propertyName);

  if (property === undefined || property === null)
  {
    throw Error(`Failed to deserialize data because property`
      + ` '${propertyName}'${inFile(path)} isn't valid`);
  }

  return property;
}

// ! Throws exception on error.
function readClassName(json: object, path?: string): string
{
  const className = readProperty(json, CLASS_NAME);

  if (!className)
  {
    throw Error(`Unable to deserialize json data${inFile(path)}`
      + ` because there is no '${CLASS_NAME}' property in it`);
  }

  if (!(typeof className === "string"))
  {
    throw Error(`Unable to deserialize json data${inFile(path)}`
      + ` because property '${CLASS_NAME}' isn't a string`);
  }

  return className;
}

// -> Returns string informing about file location or empty string
//    if 'path' is not available.
function inFile(path?: string): string
{
  if (!path)
    return "";

  return ` in file ${path}`;
}

function bitvectorFromJson
(
  json: object,
  propertyName: string,
  path?: string
)
: any
{
  const bitvectorData = getProperty(json, DATA, path);

  if (bitvectorData === undefined)
  {
    throw Error(`Failed to deserialize bitvector property ${propertyName}`
      + ` because '${DATA}' property is missing in source JSON data`);
  }

  return new FastBitSet(bitvectorData);
}

function mapFromObject(mapObject: object): Map<any, any>
{
  const map = new Map();

  for (const [ key, value ] of Object.entries(mapObject))
    map.set(key, value);

  return map;
}

// ------------------ Type declarations ----------------------

export namespace Serializable
{
  export type Mode =
    | "Save to file"
    | "Send to client"
    | "Send to server"
    | "Send to editor";
}