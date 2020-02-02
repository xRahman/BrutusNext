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
    const className = getClassName(jsonObject);

    // ! Throws exception on error.
    const serializable = ClassFactory.newInstanceByName(className);

    // ! Throws exception on error.
    return serializable.deserialize(jsonObject, className, path);
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
  // Creates a Javascript object and fills it with properties of
  // 'this'. Data types that can't be directly serialized to JSON
  // (like Set or Map) are converted to something serializable
  // (Array, string, etc).
  public saveToJsonObject(mode: Serializable.Mode): object
  {
    const jsonObject = {};

    // A little hack - save some properties first (out of order)
    // to make resulting JSON more readable.
    this.writeClassName(jsonObject);
    this.writeProperty(jsonObject, ID);
    this.writeProperty(jsonObject, PROTOTYPE_ID);
    this.writeProperty(jsonObject, NAME);
    this.writeVersion(jsonObject, mode);

    // Cycle through all properties in source object.
    for (const propertyName in this)
    {
      // Skip properties that we wrote out of order.
      if (isSkippedProperty(propertyName))
        continue;

      // Skip inherited properties (they are serialized on prototype entity).
      if (!this.hasOwnProperty(propertyName))
        continue;

      // Check if property is flagged to be serialized.
      if (!this.isSerialized(propertyName, mode))
        continue;

      // Skip nonprimitive properties that don't have any own properties.
      if (!hasOwnValue(this[propertyName]))
        continue;

      (jsonObject as Types.Object)[propertyName] = this.serializeProperty
      (
        {
          property: this[propertyName],
          description: propertyName,
          className: this.className,
          mode
        }
      );
    }

    return jsonObject;
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

  private writeProperty(jsonObject: object, propertyName: string): object
  {
    if (this.hasOwnProperty(propertyName))
    {
      (jsonObject as Types.Object)[propertyName] =
        (this as Types.Object)[propertyName];
    }

    return jsonObject;
  }

  private writeVersion(jsonObject: object, mode: Serializable.Mode): object
  {
    if (mode === "Send to client" || mode === "Send to server")
    {
      // Version is not written to serialized packets because they
      // are always sent and received by the same code so it's
      // unnecessary information.
      return jsonObject;
    }

    // 'this.constructor' contains static properties of this class.
    if (!this.constructor.hasOwnProperty(VERSION))
    {
      throw Error(`Failed to serialize ${this.debugId}`
        + ` because static '${VERSION}' property is missing`
        + ` on it. Make sure that 'static ${VERSION}' is`
        + ` inicialized in class ${this.className}`);
    }

    const version = (this.constructor as Types.Object)[VERSION];

    if (!Types.isNumber(version))
    {
      throw Error(`Failed to serialize ${this.debugId}`
        + ` because static '${VERSION}' property is not a number.`
        + ` Make sure that 'static ${VERSION}' is inicialized in`
        + ` class ${this.className} to some number`);
    }

    (jsonObject as Types.Object)[VERSION] = version;

    return jsonObject;
  }

  private writeClassName(jsonObject: object): object
  {
    (jsonObject as Types.Object)[CLASS_NAME] = this.className;

    return jsonObject;
  }

  // Determines if property 'propertyName' is to be serialized
  // in given serializable 'mode'.
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
  // Writes a single property to a corresponding JSON object.
  // -> Returns JSON object representing 'param.sourceProperty'.
  private serializeProperty(param: Serializable.SerializeParam): any
  {
    const property = param.property;

    // Allow custom property serialization in descendants.
    const customValue = this.customSerializeProperty(param);

    if (customValue.serializedProperty !== undefined)
      return customValue.serializedProperty;

    // Primitive values (number, string, null, etc.) are just assigned.
    if (Types.isPrimitiveType(property) || property === undefined)
      return property;

    return this.serializeObjectProperty(param);
  }

  private serializeObjectProperty(param: Serializable.SerializeParam): any
  {
    const property = param.property as object;
    const mode = param.mode;

    if (Types.isArray(property))
      return this.serializeArray(param, property as Array<any>);

    if (isEntity(property))
      // Entities are serialized separately. Only entity id will be saved.
      return createEntitySaver(property, param).saveToJsonObject(mode);

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

    if (Types.isMap(property))
      return createMapSaver(property as Map<any, any>).saveToJsonObject(mode);

    if (Types.isBitvector(property))
      return createBitvectorSaver(property).saveToJsonObject(mode);

    if (property instanceof Set)
      return createSetSaver(property).saveToJsonObject(mode);

    if (Types.isPlainObject(property))
      return this.serializePlainObject(param, property);

    throw Error(`Property '${param.description}' in class`
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
    param: Serializable.SerializeParam,
    sourceArray: Array<any>
  )
  : Array<any>
  {
    const jsonArray = [];

    // Serialize all items in source array and push them to 'jsonArray'.
    for (let i = 0; i < sourceArray.length; i++)
    {
      const serializedArrayItem = this.serializeProperty
      (
        {
          property: sourceArray[i],
          description: `Array item [${i}]`,
          className: param.className,
          mode: param.mode
        }
      );

      jsonArray.push(serializedArrayItem);
    }

    return jsonArray;
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

      (jsonObject as Types.Object)[propertyName] = this.serializeProperty
      (
        {
          property: sourceProperty,
          description: propertyName,
          className: "Object",
          mode: param.mode
        }
      );
    }

    return jsonObject;
  }

  // *** Deserialize Methods ***

  // ! Throws exception on error.
  // Extracts data from plain javascript object to this instance.
  public deserialize
  (
    jsonObject: object,
    sourceClassName: string,
    path?: string
  )
  : this
  {
    // ! Throws exeption if versions don't match.
    /// TODO: This will probably have to be replaced by code that
    /// converts data to the new version (instead of preventing
    /// data to be deserialized by throwing an exception).
    this.versionMatchCheck(jsonObject, path);

    // ! Throws exeption if class names in source and target data don't match.
    this.classMatchCheck(sourceClassName, this.className, path);

    // ! Throws exception on error.
    this.deserializeProperties(this, jsonObject, path);

    return this;
  }

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
    sourceClassName: string,
    targetClassName: string,
    path?: string
  )
  : void
  {
    if (sourceClassName !== targetClassName)
    {
      throw Error(`Failed to deserialize because JSON data${inFile(path)}`
        + ` represents class '${String(sourceClassName)}' while target`
        + ` class is '${targetClassName})`);
    }
  }

  // ! Throws exception on error.
  private deserializeProperties
  (
    targetObject: object,
    sourceObject: object,
    path?: string
  )
  : void
  {
    for (const propertyName in sourceObject)
    {
      // Skip inherited properties.
      if (!sourceObject.hasOwnProperty(propertyName))
        continue;

      // Properties 'className' and 'version' aren't assigned
      // ('className' represents the name of the javascript class
      //   which cannot be changed and 'version' is serialized only
      //   to be checked against).
      if (propertyName === CLASS_NAME || propertyName === VERSION)
        continue;

      // ! Throws exception on error.
      // We are cycling over properties in source object, not in Serializable
      // that is being loaded so properties that are not present in source JSON
      // object will not get overwritten with 'undefined'. This allows adding
      // new properties to existing classes without the need to convert all
      // save files.
      targetObject[propertyName] = this.deserializeProperty
      (
        {
          propertyName,
          targetProperty: targetObject[propertyName],
          sourceProperty: sourceObject[propertyName],
          path
        }
      );
    }
  }

  // ! Throws exception on error.
  // Deserializes a single object property. Converts from serialized
  // format to original data type as needed (for example Set is
  // saved to JSON as an Array so it has to be reconstructed here).
  private deserializeProperty(param: Serializable.DeserializeParam): any
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

    if (Array.isArray(param.sourceProperty))
      // ! Throws exception on error.
      return this.deserializeArray(param.sourceProperty, param.path);

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
    this.deserializeProperties(targetObject, sourceObject, path);

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
    let targetInstance = targetObject;

    // If target property is 'null' or 'undefined', we wouldn't be
    // able to write anything to it or call it's deserialize method.
    // So we first need to assign a new instance of correct type to
    // it - the type is saved in JSON as 'className' property.
    if (targetInstance === null || targetInstance === undefined)
      targetInstance = ClassFactory.newInstanceByName(className);

    if (!(targetInstance instanceof Serializable))
    {
      throw Error(`Failed to deserialize property '${propertyName}'`
        + `${inFile(path)} because target property is supposed to`
        + ` be an instance of Serializable class and it isn't`);
    }

    return targetInstance.deserialize(sourceObject, path);
  }
}

// ----------------- Auxiliary Functions ---------------------

// *** Serialize Functions ***

// -> Returns 'true' if 'variable' has own (not just inherited) value.
function hasOwnValue(variable: any): boolean
{
  // Variables of primitive types are always serialized.
  if (Types.isPrimitiveType(variable))
    return true;

  if (Types.isMap(variable) || Types.isSet(variable))
  {
    // Maps and Sets are always instantiated as 'new Map()'
    // or 'new Set()' so we only need to serialize them if
    // they contain something.
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
  (saver as Types.Object)[SET] = saveSetToArray(set);

  return saver;
}

// ! Throws exception on error.
function createMapSaver(map: Map<any, any>): Serializable
{
  const saver = createSaver(MAP_CLASS_NAME);

  // Map is saved as it's Array representation to property 'map'.
  (saver as Types.Object)[MAP] = saveMapToArray(map);

  return saver;
}

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
  (saver as Types.Object)[BITVECTOR] = bitvector.toJSON();

  return saver;
}

// ! Throws exception on error.
function createEntitySaver
(
  entity: object,
  param: Serializable.SerializeParam
)
: Serializable
{
  // ! Throws exception on error.
  const id = getEntityId(entity, param);

  const saver = createSaver(REFERENCE_CLASS_NAME);

  // Only a string id is saved when an entity is serialized.
  (saver as Types.Object)[ID] = id;

  return saver;
}

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

// ! Throws exception on error.
function getEntityId
(
  entity: Types.Object,
  param: Serializable.SerializeParam
)
: string
{
  const id = entity[ID];

  if (!Types.isString(id))
  {
    throw Error(`Failed to serialize class '${param.className}'`
      + ` because ${param.description}.${ID} is not a string.`
      + ` Object's with 'id' property are considered entities`
      + ` and as such must have a string ${ID} property`);
  }

  return id;
}

function isSkippedProperty(name: string): boolean
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
function getClassName(jsonObject: object): string
{
  const className = readProperty(jsonObject, CLASS_NAME);

  if (!className)
  {
    throw Error(`Unable to deserialize data because there is`
      + ` no '${CLASS_NAME}' property in it`);
  }

  if (!(typeof className === "string"))
  {
    throw Error(`Unable to deserialize data because property`
      + ` '${CLASS_NAME}' isn't a string`);
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
  const property = sourceObject[propertyName];

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

  export interface DeserializeParam
  {
    propertyName: string,
    sourceProperty: any,
    targetProperty: any,
    path?: string
  }

  export interface SerializeParam
  {
    property: any,
    description: string, // Used for error messages.
    className: string,
    mode: Mode
  }
}