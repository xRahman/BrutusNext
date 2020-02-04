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
import { JsonObject } from "../../Shared/Class/JsonObject";
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

// These special property names are only written to serialized data
// (for example 'map' property holds an Array that represents serialized
//  data of a Map object).
const BITVECTOR = "bitvector";
const MAP = "map";
const SET = "set";

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
    const jsonObject = JsonObject.parse(data);

    // ! Throws exception on error.
    const className = readClassName(jsonObject, path);

    // ! Throws exception on error.
    const instance = ClassFactory.newInstanceByName(className);

    // ! Throws exception on error.
    return instance.deserialize(jsonObject, path);
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
    const jsonObject = this.saveToJsonObject(mode);

    return JsonObject.stringify(jsonObject);
  }

  // ! Throws exception on error.
  public deserialize(jsonObject: object, path?: string): this
  {
    // ! Throws exception on error.
    /// TODO: This will probably have to be replaced by code that
    /// converts data to the new version (instead of preventing
    /// data to be deserialized by throwing an exception).
    this.versionMatchCheck(jsonObject, path);

    // ! Throws exception on error.
    this.classMatchCheck(jsonObject, path);

    // ! Throws exception on error.
    this.deserializeProperties(jsonObject, this, path);

    return this;
  }

  // -------------- Protected methods -------------------

  // This method can be overriden to change how a property is serialized.
  protected customSerializeProperty
  (
    property: any,
    propertyName: string,
    className: string,
    mode: Serializable.Mode
  )
  : { serializedProperty?: any }
  {
    return {};
  }

  // This method can be overriden to change how a property is deserialized.
  protected customDeserializeProperty
  (
    propertyName: string,
    source: any,
    target: any,
    path?: string
  )
  : { deserializedProperty?: any }
  {
    return {};
  }

  // --------------- Private methods --------------------

  // *** Serialize Methods ***

  // ! Throws exception on error.
  private saveToJsonObject(mode: Serializable.Mode): object
  {
    const jsonObject = {};

    // Save these properties first to make JSON more readable.
    this.writeClassName(jsonObject);
    this.copyOwnProperty(jsonObject, ID);
    this.copyOwnProperty(jsonObject, PROTOTYPE_ID);
    this.copyOwnProperty(jsonObject, NAME);
    this.writeVersion(jsonObject, mode);

    // Cycle through all properties in source object.
    for (const propertyName in this)
    {
      if (isSavedOutOfOrder(propertyName))
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

      const serializedProperty =
        this.serializeProperty(property, propertyName, this.className, mode);

      writeProperty(jsonObject, propertyName, serializedProperty);
    }

    return jsonObject;
  }

  private copyOwnProperty(jsonObject: object, propertyName: string): void
  {
    if (this.hasOwnProperty(propertyName))
    {
      const property = readProperty(this, propertyName);

      writeProperty(jsonObject, propertyName, property);
    }
  }

  private writeVersion(jsonObject: object, mode: Serializable.Mode): void
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
        + ` because static '${VERSION}' property is missing`
        + ` on it. Make sure that 'static ${VERSION}' is`
        + ` inicialized in class ${this.className}`);
    }

    const version = this.getStaticProperty(VERSION);

    if (!Types.isNumber(version))
    {
      throw Error(`Failed to serialize ${this.debugId}`
        + ` because static '${VERSION}' property is not a number.`
        + ` Make sure that 'static ${VERSION}' is inicialized in`
        + ` class ${this.className} to some number`);
    }

    writeProperty(jsonObject, VERSION, version);
  }

  private writeClassName(jsonObject: object): void
  {
    writeProperty(jsonObject, CLASS_NAME, this.className);
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
  private serializeProperty
  (
    property: any,
    propertyName: string,
    className: string,
    mode: Serializable.Mode
  )
  : any
  {
    // Allow custom property serialization in descendants.
    const customValue =
      this.customSerializeProperty(property, propertyName, className, mode);

    if (customValue.serializedProperty !== undefined)
      return customValue.serializedProperty;

    // Primitive values (number, string, null, etc.) are just assigned.
    if (Types.isPrimitiveType(property) || property === undefined)
      return property;

    // ! Throws exception on error.
    return this.serializeObject(property, propertyName, className, mode);
  }

  // ! Throws exception on error.
  private serializeObject
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
      return this.serializeArray(property, className, mode);

    if (property instanceof Serializable)
    {
      if (isEntity(property))
        // ! Throws exception on error.
        return serializeEntity(property, className, propertyName);

      // ! Throws exception on error.
      return property.saveToJsonObject(mode);
    }

    if (Types.isDate(property))
    {
      throw Error("Attempt to serialize property of type Date()."
        + " Date object should not be used because it can't be"
        + " properly inherited using prototypal inheritance."
        + " Use class Time instead. Property is not serialized");
    }

    if (property instanceof Map)
      return serializeMap(property);

    if (Types.isBitvector(property))
      // ! Throws exception on error.
      return serializeBitvector(property, className, propertyName);

    if (property instanceof Set)
      return serializeSet(property);

    if (Types.isPlainObject(property))
      return this.serializePlainObject(property, className, mode);

    throw Error(`Property '${propertyName}' in class '${className}'`
      + ` (or inherited from one of it's ancestors) is a class`
      + ` but is neither inherited from Serializable nor has`
      + ` a type that we know how to save. Make sure that you only`
      + ` use primitive types (numbers, strings, etc.), Arrays,`
      + ` primitive javascript objects, Maps, Sets or classes`
      + ` inherited from Serializable as properties of classes`
      + ` inherited from Serializable. If you want a new type to`
      + ` be serialized, you need to add this functionality to`
      + ` Serializable.ts. Property is not serialized`);
  }

  // ! Throws exception on error.
  private serializeArray
  (
    sourceArray: Array<any>,
    className: string,
    mode: Serializable.Mode
  )
  : Array<any>
  {
    const targetArray = [];

    for (let i = 0; i < sourceArray.length; i++)
    {
      // ! Throws exception on error.
      const serializedItem = this.serializeProperty
      (
        sourceArray[i],
        `Array item [${i}]`,
        className,
        mode
      );

      targetArray.push(serializedItem);
    }

    return targetArray;
  }

  // ! Throws exception on error.
  private serializePlainObject
  (
    sourceObject: Types.Object,
    className: string,
    mode: Serializable.Mode
  )
  : object
  {
    const jsonObject = {};

    // Serialize all properties of sourceObject.
    for (const propertyName in sourceObject)
    {
      // Only serialize own (not inherited) properties.
      if (!sourceObject.hasOwnProperty(propertyName))
        continue;

      const property = sourceObject[propertyName];

      // Skip nonprimitive properties that don't have any own properties.
      if (!hasOwnValue(property))
        continue;

      const serializedProperty =
        this.serializeProperty(property, propertyName, className, mode);

      writeProperty(jsonObject, propertyName, serializedProperty);
    }

    return jsonObject;
  }

  // *** Deserialize Methods ***

  private getStaticProperty(propertyName: string): any
  {
    return (this.constructor as Types.Object)[propertyName];
  }

  // ! Throws exception on error.
  private versionMatchCheck(jsonObject: object, path?: string): void
  {
    const version = readProperty(jsonObject, VERSION);

    // If there isn't a 'version' property in jsonObject,
    // it won't be checked for (version is not used in
    // packets because they are always sent and received
    // from the same version of code).
    if (version === undefined)
      return;

    if (!Types.isString(version))
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

    if (version !== thisVersion)
    {
      throw Error(`Failed to deserialize because version of`
        + ` JSON data (${String(version)})${inFile(path)} doesn't`
        + ` match actual version (${String(thisVersion)})`);
    }
  }

  // ! Throws exception on error.
  private classMatchCheck
  (
    jsonObject: object,
    path?: string
  )
  : void
  {
    const className = readProperty(jsonObject, CLASS_NAME);

    if (className !== this.className)
    {
      throw Error(`Failed to deserialize because JSON data${inFile(path)}`
        + ` represents class '${String(className)}' while target class`
        + ` is '${this.className})`);
    }
  }

  // ! Throws exception on error.
  private deserializeProperties
  (
    sourceObject: Types.Object,
    targetObject: Types.Object,
    path?: string
  )
  : void
  {
    for (const propertyName in sourceObject)
    {
      // Skip inherited properties.
      if (!sourceObject.hasOwnProperty(propertyName))
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
      const property = this.deserializeProperty
      (
        propertyName,
        targetObject[propertyName],
        sourceObject[propertyName],
        path
      );

      writeProperty(targetObject, propertyName, property);
    }
  }

  // ! Throws exception on error.
  private deserializeProperty
  (
    propertyName: string,
    source: any,
    target: any,
    path?: string
  )
  : any
  {
    // Allow custom property deserialization in descendants.
    const customValue =
      this.customDeserializeProperty(propertyName, source, target, path);

    if (customValue.deserializedProperty !== undefined)
      return customValue.deserializedProperty;

    // ! Throws exception on error.
    this.validateSourceAndTarget(propertyName, source, target, path);

    if (Types.isPrimitiveType(source))
      // Properties of primitive types are simply assigned.
      return source;

    return this.deserializeObject(source, target, propertyName, path);
  }

  // ! Throws exception on error.
  private validateSourceAndTarget
  (
    propertyName: string,
    sourceProperty: any,
    targetProperty: any,
    path?: string
  )
  : void
  {
    if (sourceProperty === null)
    {
      throw Error(`Property '${propertyName}${inFile(path)}`
        + ` has 'null' value. 'null' is not allowed, make sure that it`
        + ` is not used anywhere`);
    }

    if (targetProperty === null)
    {
      throw Error(`Property '${propertyName}' of ${this.debugId} has`
        + ` 'null' value. 'null' is not allowed, make sure that it`
        + ` is not used anywhere`);
    }

    const typesMatch = typeof targetProperty === typeof sourceProperty;
    const targetIsValid = targetProperty === undefined || typesMatch;

    if (!targetIsValid)
    {
      throw Error(`Failed to deserialize because target property`
        + ` '${propertyName}'${inFile(path)} is not 'undefined'`
        + ` or the same type as source property`);
    }
  }

  private deserializeObject
  (
    sourceObject: object,
    targetObject: object,
    propertyName: string,
    path?: string
  )
  : object
  {
    if (Array.isArray(sourceObject))
      // ! Throws exception on error.
      return this.deserializeArray(sourceObject, path);

    const className = readProperty(sourceObject, CLASS_NAME);

    if (className === undefined)
      return this.deserializePlainObject(sourceObject, targetObject, path);

    switch (className)
    {
      case BITVECTOR_CLASS_NAME:
        // ! Throws exception on error.
        return deserializeBitvector(sourceObject, propertyName, path);

      case SET_CLASS_NAME:
        // ! Throws exception on error.
        return this.deserializeSet(sourceObject, propertyName, path);

      case MAP_CLASS_NAME:
        // ! Throws exception on error.
        return this.deserializeMap(sourceObject, propertyName, path);

      case ENTITY_CLASS_NAME:
        // ! Throws exception on error.
        return deserializeEntity(sourceObject, propertyName, path);

      default:
        // ! Throws exception on error.
        return this.deserializeSerializable
        (
          sourceObject,
          targetObject,
          propertyName,
          className,
          path
        );
    }
  }

  // ! Throws exception on error.
  private deserializePlainObject
  (
    sourceObject: object,
    targetObject: object,
    path?: string
  )
  : object
  {
    if (targetObject === null || targetObject === undefined)
      targetObject = {};

    // ! Throws exception on error.
    this.deserializeProperties(sourceObject, targetObject, path);

    return targetObject;
  }

  // ! Throws exception on error.
  private deserializeArray(sourceArray: Array<any>, path?: string): Array<any>
  {
    const targetArray = [];

    for (let i = 0; i < sourceArray.length; i++)
    {
      const arrayItem = this.deserializeProperty
      (
        `Array item [${i}]`,
        undefined,
        sourceArray[i],
        path
      );

      targetArray.push(arrayItem);
    }

    return targetArray;
  }

  // ! Throws exception on error.
  private deserializeSet
  (
    sourceObject: object,
    propertyName: string,
    path?: string
  )
  : Set<any>
  {
    const setArray = getDataProperty(sourceObject, propertyName, SET);

    // ! Throws exception on error.
    // In order to deserialize a Set object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselves (for example if you put
    // another Set into your Set). We let deserializeArray() do it for us.
    return new Set(this.deserializeArray(setArray, path));
  }

  // ! Throws exception on error.
  private deserializeMap
  (
    mapRecord: object,
    propertyName: string,
    path?: string
  )
  : Map<any, any>
  {
    const jsonData = getDataProperty(mapRecord, propertyName, MAP);
    const deserializedData = {};

    // ! Throws exception on error.
    this.deserializePlainObject(jsonData, deserializedData, path);

    const map = new Map();

    for (const [ key, value ] of Object.entries(deserializedData))
      map.set(key, value);

    // ! Throws exception on error.
    // In order to deserialize a Map object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselvs (for example if you put
    // another Map into your Map). We let deserializeArray() do it for us.
    return map;
  }

  // ! Throws exception on error.
  private deserializeSerializable
  (
    source: object,
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
        + `${inFile(path)} because target property is supposed to`
        + ` be an instance of Serializable class and it isn't`);
    }

    return target.deserialize(source, path);
  }
}

// ----------------- Auxiliary Functions ---------------------

// *** Serialize Functions ***

function writeProperty
(
  jsonObject: Types.Object,
  propertyName: string,
  value: any
)
: void
{
  jsonObject[propertyName] = value;
}

// -> Returns 'true' if 'property' has own (not just inherited) value.
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

function serializeSet(set: Set<any>): object
{
  const setRecord = {};

  writeProperty(setRecord, CLASS_NAME, SET_CLASS_NAME);
  writeProperty(setRecord, SET, Array.from(set));

  return setRecord;
}

function serializeMap(map: Map<any, any>): object
{
  const mapRecord = {};

  writeProperty(mapRecord, CLASS_NAME, MAP_CLASS_NAME);
  writeProperty(mapRecord, MAP, mapToJson(map));

  return mapRecord;
}

// ! Throws exception on error.
function serializeBitvector
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
  writeProperty(bitvectorRecord, MAP, bitvector.toJSON());

  return bitvectorRecord;
}

// ! Throws exception on error.
function serializeEntity
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

// -> Returns an Array representation of Map object.
function mapToJson(map: Map<any, any>): object
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
function deserializeEntity
(
  sourceObject: object,
  propertyName: string,
  path?: string
)
// Let typescript infer the type here so we don't have to import Entity
// (that would lead to cyclic import troubles).
{
  const id = getDataProperty(sourceObject, propertyName, path);

  return Entities.getReference(id);
}

function isEntity(variable: object): boolean
{
  // We can't import Entity to Serializable because it would cause
  // cyclic module dependency error. So instead we just test if there
  // is an 'id' property in 'variable'.
  return ID in variable;
}

function isSavedOutOfOrder(name: string): boolean
{
  return name === NAME
      || name === CLASS_NAME
      || name === ID
      || name === PROTOTYPE_ID;
}

// *** Deserialize Functions ***

function readProperty(jsonObject: Types.Object, propertyName: string): any
{
  return jsonObject[propertyName];
}

// ! Throws exception on error.
function readClassName(jsonObject: object, path?: string): string
{
  const className = readProperty(jsonObject, CLASS_NAME);

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

// ! Throws exception on error.
function getDataProperty
(
  sourceObject: object,
  propertyName: string,
  path?: string
)
: any
{
  const property = readProperty(sourceObject, propertyName);

  if (property === undefined || property === null)
  {
    throw Error(`Failed to deserialize data because property`
      + ` '${propertyName}'${inFile(path)} isn't valid`);
  }

  return property;
}

function deserializeBitvector
(
  sourceObject: object,
  propertyName: string,
  path?: string
)
: any
{
  const bitvectorData = getDataProperty(sourceObject, BITVECTOR, path);

  if (bitvectorData === undefined)
  {
    throw Error(`Failed to deserialize bitvector property ${propertyName}`
      + ` because '${BITVECTOR}' property is missing in source JSON data`);
  }

  return new FastBitSet(bitvectorData);
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