/*
  Part of BrutusNext

  Automatized serializing to and from JSON format including
  re-creating classes that were serialized.
*/

/*
  Notes:
    Properties that are not present in json object will not be
    deleted from target object when loading. It means that you
    can add new properties to existing classes without converting
    existing save files (but you should initialize them with
    default values).

    Properties are loaded even if they don't exist in class
    into which we are loading. This allows saving of properties
    created in runtime.

    Serializing of entities as a reference (using entity 'id')
    is implemented in Serializable rather than in Entity to allow
    referencing entities in non-entity Serializable classes.

    Descendants can override methods customSerializeProperty()
    and customDeserializeProperty() to change how specific
    properties are serialized.

  Implementation notes:
    At the moment, attributes are checked only for direct properties
    of Serializable instances so if you use a plain {} as a property,
    you can't set attributes to it's properties. You can, however,
    use a Serializable class instead of {} for this purpose.
*/

// There are long functions in this file.
// /* eslint-disable max-statements */
// /* eslint-disable complexity */

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

const VERSION = "version";
const CLASS_NAME = "className";
const NAME = "name";

// These are 'dummy' class names. They are only written to JSON
// but they don't really exists in code (Set and Map are build-in
// javascript classes, Bitvector translates to a 'fastbitset' object.
const BITVECTOR_CLASS_NAME = "Bitvector";
const SET_CLASS_NAME = "Set";
const MAP_CLASS_NAME = "Map";
const REFERENCE_CLASS_NAME = "Reference";

// These special property names are only written to serialized data
// (for example 'map' property holds an Array that represents serialized
//  data of a Map object).
const BITVECTOR = "bitvector";
const MAP = "map";
const SET = "set";

export const ID = "id";
export const PROTOTYPE_ID = "prototypeId";

export class Serializable extends Attributable
{
  // ------------- Protected static data ----------------

  // 'version' is used to convert data from older formats.
  //   If your class is saved to disk, you have to initialize it's
  // 'version' (otherwise you get an exception while serializing).
  protected static version = 0;

  // ------------- Public static methods ----------------

  // ! Throws exception on error.
  // Use this only for Serializable objects not inherited from Entity.
  // 'path' is only used in error messages to help with debugging.
  public static deserialize(data: string, path?: string): Serializable
  {
    // ! Throws exception on error.
    const jsonObject = JsonObject.parse(data);

    // ! Throws exception on error.
    const className = readClassName(jsonObject, path);

    // ! Throws exception on error.
    const serializable = ClassFactory.newInstanceByName(className);

    // ! Throws exception on error.
    return serializable.deserialize(jsonObject, path);
  }

  // --------------- Public accessors -------------------

  // -> Returns string describing this object for error logging.
  public get debugId(): string
  {
    // There is not much to say about generic serializable object.
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
  // Extracts data from plain javascript object to this instance.
  public deserialize
  (
    jsonObject: object,
    path?: string
  )
  : this
  {
    // ! Throws exeption if versions don't match.
    /// TODO: This will probably have to be replaced by code that
    /// converts data to the new version (instead of preventing
    /// data to be deserialized by throwing an exception).
    this.versionMatchCheck(jsonObject, path);

    // ! Throws exeption if versions don't match.
    this.classMatchCheck(jsonObject, path);

    // ! Throws exception on error.
    this.deserializeProperties(jsonObject, this, path);

    return this;
  }

  // -------------- Protected methods -------------------

  // This method can be overriden to change how a property is serialized.
  protected customSerializeProperty
  (
    param: Serializable.SerializeParam
  )
  : { serializedProperty?: any }
  {
    return {};
  }

  // This method can be overriden to change how a property is deserialized.
  protected customDeserializeProperty
  (
    param: Serializable.DeserializeParam
  )
  : { deserializedProperty?: any }
  {
    return {};
  }

  // --------------- Private methods --------------------

  // *** Serialize Methods ***

  // ! Throws exception on error.
  // Creates a Javascript object and fills it with properties of
  // 'this'. Data types that can't be directly serialized to JSON
  // (like Set or Map) are converted to something serializable
  // (Array, string, etc).
  private saveToJsonObject(mode: Serializable.Mode): object
  {
    const jsonObject = {};

    // A little hack - save some properties first (out of order)
    // to make resulting JSON more readable.
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

      // Skip nonprimitive properties that don't have any own properties.
      if (!hasOwnValue(property))
        continue;

      const serializedProperty = this.serializeProperty
      (
        {
          property,
          propertyName,
          className: this.className,
          mode
        }
      );

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
  private serializeProperty(param: Serializable.SerializeParam): any
  {
    // Allow custom property serialization in descendants.
    const customValue = this.customSerializeProperty(param);

    if (customValue.serializedProperty !== undefined)
      return customValue.serializedProperty;

    // Primitive values (number, string, null, etc.) are just assigned.
    if (Types.isPrimitiveType(param.property) || param.property === undefined)
      return param.property;

    return this.serializeObject(param);
  }

  private serializeObject(param: Serializable.SerializeParam): any
  {
    const property = param.property as object;
    const className = param.className;
    const propertyName = param.propertyName;
    const mode = param.mode;

    if (Array.isArray(property))
      return this.serializeArray(property, className, mode);

    if (isEntity(property))
      return serializeEntity(property, className, propertyName);

    // Property is a Serializable object (but not an entity).
    if (property instanceof Serializable)
      return property.saveToJsonObject(mode);

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
      return createBitvectorSaver(property).saveToJsonObject(mode);

    if (property instanceof Set)
      return createSetSaver(property).saveToJsonObject(mode);

    if (Types.isPlainObject(property))
      return this.serializePlainObject(param, property);

    throw Error(`Property '${param.propertyName}' in class`
      + ` '${param.className}' (or inherited from one of it's`
      + ` ancestors) is a class but is neither inherited from`
      + ` Serializable nor has a type that we know how to save.`
      + ` Make sure that you only use primitive types (numbers,`
      + ` strings, etc.), Arrays, primitive javascript objects,`
      + ` Maps or classes inherited from Serializable as properties`
      + ` of classes inherited from Serializable. If you want a new`
      + ` type to be saved, you need to add this functionality to `
      + ` Serializable.ts. Property is not saved`);
  }

  // Saves a property of type Array to a corresponding JSON Array object.
  private serializeArray
  (
    sourceArray: Array<any>,
    className: string,
    mode: Serializable.Mode
  )
  : Array<any>
  {
    const targetArray = [];

    // Serialize all items in source array and push them to 'jsonArray'.
    for (let i = 0; i < sourceArray.length; i++)
    {
      const serializedItem = this.serializeProperty
      (
        {
          property: sourceArray[i],
          propertyName: `Array item [${i}]`,
          className,
          mode
        }
      );

      targetArray.push(serializedItem);
    }

    return targetArray;
  }

  // ! Throws exception on error.
  private serializePlainObject
  (
    param: Serializable.SerializeParam,
    sourceObject: Types.Object
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

      const sourceProperty = sourceObject[propertyName];

      // Skip nonprimitive properties that don't have any own properties.
      if (!hasOwnValue(sourceProperty))
        continue;

      const serializedProperty = this.serializeProperty
      (
        {
          property: sourceProperty,
          propertyName,
          // TODO: Nezapisovat u plain objektů className
          className: "Object",
          mode: param.mode
        }
      );

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
        {
          propertyName,
          targetProperty: targetObject[propertyName],
          sourceProperty: sourceObject[propertyName],
          path
        }
      );

      writeProperty(targetObject, propertyName, property);
    }
  }

  // ! Throws exception on error.
  // Deserializes a single object property. Converts from serialized
  // format to original data type as needed (for example Set is
  // saved to JSON as an Array so it has to be reconstructed here).
  private deserializeProperty
  (
    param: Serializable.DeserializeParam
  )
  : any
  {
    // Allow custom property deserialization in descendants.
    const customValue = this.customDeserializeProperty(param);

    if (customValue.deserializedProperty !== undefined)
      return customValue.deserializedProperty;

    // ! Throws exception on error.
    this.validateSourceAndTarget(param);

    if (Types.isPrimitiveType(param.sourceProperty))
      // Properties of primitive types are simply assigned.
      return param.sourceProperty;

    return this.deserializeObject
    (
      param.sourceProperty,
      param.targetProperty,
      param.propertyName,
      param.path
    );
  }

  // ! Throws exception on error.
  private validateSourceAndTarget
  (
    {
      propertyName,
      sourceProperty,
      targetProperty,
      path
    }
    : Serializable.DeserializeParam
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

    const targetIsInvalid = targetProperty !== undefined
      && typeof targetProperty !== typeof sourceProperty;

    if (targetIsInvalid)
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

      case REFERENCE_CLASS_NAME:
        // ! Throws exception on error.
        return deserializeEntityReference(sourceObject, propertyName, path);

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
    targetProperty: object,
    path?: string
  )
  : object
  {
    let targetObject = targetProperty;

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
        {
          propertyName: `Array item [${i}]`,
          targetProperty: undefined,
          sourceProperty: sourceArray[i],
          path
        }
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
    const setData = getDataProperty(sourceObject, propertyName, SET);

    // ! Throws exception on error.
    // In order to deserialize a Set object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselves (for example if you put
    // another Set into your Set). We let deserializeArray() do it for us.
    return new Set(this.deserializeArray(setData, path));
  }

  // ! Throws exception on error.
  // Converts 'param.sourceProperty' to a Map object.
  private deserializeMap
  (
    sourceObject: object,
    propertyName: string,
    path?: string
  )
  : Map<any, any>
  {
    const mapData = getDataProperty(sourceObject, propertyName, MAP);

    // ! Throws exception on error.
    // In order to deserialize a Map object, we need to load all items
    // in array which represents it in serialized form, because they
    // may require special handling themselvs (for example if you put
    // another Map into your Map). We let deserializeArray() do it for us.
    return new Map(this.deserializeArray(mapData, path));
  }

  // ! Throws exception on error.
  private deserializeSerializable
  (
    sourceObject: object,
    targetObject: object,
    propertyName: string,
    className: string,
    path?: string
  )
  : Serializable
  {
    let target: object;

    // If target object is 'null' or 'undefined', we wouldn't be
    // able to write anything to it or call it's deserialize method.
    // So we first need to assign a new instance of correct type to
    // it - the type is saved in JSON as 'className' property.
    if (targetObject === null || targetObject === undefined)
      target = ClassFactory.newInstanceByName(className);
    else
      target = targetObject;

    if (!(target instanceof Serializable))
    {
      throw Error(`Failed to deserialize property '${propertyName}'`
        + `${inFile(path)} because target property is supposed to`
        + ` be an instance of Serializable class and it isn't`);
    }

    return target.deserialize(sourceObject, path);
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

function createSaver(className: string): Serializable
{
  const saver = new Serializable();

  // Fake the 'className' getter.
  // (We must use Object.defineProperty() because simple reassigning
  //  of getter method is not possible.)
  Object.defineProperty
  (
    saver,
    CLASS_NAME,
    { get: () => { return className; } }
  );

  return saver;
}

// ! Throws exception on error.
function createSetSaver(set: Set<any>): Serializable
{
  const saver = createSaver(SET_CLASS_NAME);

  // Set is saved as it's Array representation to property 'set'.
  writeProperty(saver, SET, saveSetToArray(set));

  return saver;
}

function serializeMap(map: Map<any, any>): object
{
  const mapRecord = {};

  writeProperty(mapRecord, CLASS_NAME, MAP_CLASS_NAME);
  writeProperty(mapRecord, MAP, saveMapToArray(map));

  return mapRecord;
}

// ! Throws exception on error.
// function createMapSaver(map: Map<any, any>): Serializable
// {
//   const saver = createSaver(MAP_CLASS_NAME);

//   // Map is saved as it's Array representation to property 'map'.
//   writeProperty(saver, MAP, saveMapToArray(map));

//   return saver;
// }

// ! Throws exception on error.
function createBitvectorSaver(bitvector: any): Serializable
{
  if (bitvector === null)
  {
    throw Error("Failed to create bitvector saver because"
    + " bitvector which should be saved is 'null'");
  }

  const saver = createSaver(BITVECTOR_CLASS_NAME);

  if (!("toJSON" in bitvector))
  {
    throw Error("Failed to create bitvector saver because bitvector"
      + " which should be saved doesn't have 'toJSON' method");
  }

  // Bitvector is saved as it's JSON string representation to
  // property 'bitvector'.
  writeProperty(saver, BITVECTOR, bitvector.toJSON());

  return saver;
}

function serializeEntity
(
  entity: object,
  className: string,
  propertyName: string
)
: object
{
  const id = readProperty(entity, ID);

  if (!Types.isString(id))
  {
    throw Error(`Failed to serialize class '${className}'`
      + ` because ${propertyName}.${ID} is not a string.`
      + ` Object's with 'id' property are considered entities`
      + ` and as such must have a string ${ID} property`);
  }

  return { className: REFERENCE_CLASS_NAME, id };
}

// ! Throws exception on error.
// function createEntitySaver
// (
//   entity: object,
//   param: Serializable.SerializeParam
// )
// : Serializable
// {
//   // ! Throws exception on error.
//   const id = getEntityId(entity, param);

//   const saver = createSaver(REFERENCE_CLASS_NAME);

//   // Only a string id is saved when an entity is serialized.
//   writeProperty(saver, ID, id);

//   return saver;
// }

// -> Returns an Array representation of Set object.
function saveSetToArray(set: Set<any>): Array<any>
{
  const result = [];

  for (const entry of set.values())
    result.push(entry);

  return result;
}

// -> Returns an Array representation of Map object.
function saveMapToArray(map: Map<any, any>): Array<any>
{
  const result = [];

  for (const entry of map.entries())
    result.push(entry);

  return result;
}

// ! Throws exception on error.
// Converts 'param.sourceProperty' to a reference to an Entity.
// If 'id' loaded from JSON already exists in Entities, existing
// entity will be returned. Otherwise an 'invalid' entity reference
// will be created and returned.
// -> Retuns an existing entity or an invalid entity reference.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function deserializeEntityReference
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

// // ! Throws exception on error.
// function getEntityId
// (
//   entity: object,
//   param: Serializable.SerializeParam
// )
// : string
// {
//   const id = readProperty(entity, ID);

//   if (!Types.isString(id))
//   {
//     throw Error(`Failed to serialize class '${param.className}'`
//       + ` because ${param.description}.${ID} is not a string.`
//       + ` Object's with 'id' property are considered entities`
//       + ` and as such must have a string ${ID} property`);
//   }

//   return id;
// }

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
    throw Error(`Failed to deserialize because property`
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

  export type DeserializeParam =
  {
    propertyName: string,
    sourceProperty: any,
    targetProperty: any,
    path?: string
  };

  export type SerializeParam =
  {
    property: any,
    propertyName: string, // Used for error messages.
    className: string,
    mode: Mode
  };
}