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
import { ClassFactory } from "../../Shared/Class/ClassFactory";
import { Json } from "../../Shared/Class/Json";
import { Jsonizer } from "../../Shared/Class/Lib/Jsonizer";
import { Dejsonizer } from "../../Shared/Class/Lib/Dejsonizer";
import { Attributable } from "../../Shared/Class/Attributable";

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
    const className = getClassName
    (
      json,
      Serializable.CLASS_NAME,
      path
    );

    // ! Throws exception on error.
    const instance = ClassFactory.newInstanceByName(className);

    // ! Throws exception on error.
    return instance.fromJson(json, path);
  }

  // Tell typescript what type 'this.constructor' is.
  public ["constructor"]: typeof Serializable;

  protected customPropertyFromJson:
    Serializable.PropertyFromJson | undefined = undefined;

  protected customPropertyToJson:
    Serializable.PropertyToJson | undefined = undefined;

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
  public toJson(mode: Serializable.Mode): object
  {
    const json = {};

    this.writeClassName(json);
    this.writeVersion(json, mode);

    const jsonizer = new Jsonizer
    (
      this,
      this.constructor,
      this.customPropertyToJson,
      mode
    );

    return jsonizer.objectToJson(this, json);
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

    const dejsonizer = new Dejsonizer
    (
      this,
      this.customPropertyFromJson,
      path
    );

    // ! Throws exception on error.
    dejsonizer.objectFromJson(json, this);

    return this;
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------

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
    if (!this.constructor.hasOwnProperty(Serializable.VERSION))
    {
      throw Error(`Failed to serialize ${this.debugId}`
        + ` because it doesn't have static property`
        + ` '${Serializable.VERSION}'. Make sure that 'static`
        + ` ${Serializable.VERSION}' is inicialized in class`
        + ` ${this.className}`);
    }

    const version = this.getStaticProperty(Serializable.VERSION);

    if (!Types.isNumber(version))
    {
      throw Error(`Failed to serialize ${this.debugId} because`
        + ` static property '${Serializable.VERSION}' is not a`
        + ` number. Make sure that 'static ${Serializable.VERSION}'`
        + ` is inicialized in class ${this.className} to a number`);
    }

    Json.writeProperty(json, Serializable.VERSION, version);
  }

  private writeClassName(json: object): void
  {
    Json.writeProperty(json, Serializable.CLASS_NAME, this.className);
  }

  private getStaticProperty(propertyName: string): any
  {
    return (this.constructor as Types.Object)[propertyName];
  }

  // ! Throws exception on error.
  private versionMatchCheck(json: object, path?: string): void
  {
    const jsonVersion = Json.readProperty(json, Serializable.VERSION);

    // If there isn't a 'version' property in jsonObject,
    // it won't be checked for (version is not used in
    // packets because they are always sent and received
    // from the same version of code).
    if (jsonVersion === undefined)
      return;

    if (!Types.isString(jsonVersion))
    {
      throw Error(`Failed to deserialize because ${Serializable.VERSION}`
        + ` property in JSON data${inFile(path)} isn't a string`);
    }

    const thisVersion = this.getStaticProperty(Serializable.VERSION);

    if (!Types.isString(thisVersion))
    {
      throw Error(`Failed to deserialize because ${Serializable.VERSION}`
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
    const className = Json.readProperty(json, Serializable.CLASS_NAME);

    if (className !== this.className)
    {
      throw Error(`Failed to deserialize because JSON data${inFile(path)}`
        + ` represents class '${String(className)}' while target class`
        + ` is '${this.className})`);
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function getClassName
(
  json: object,
  propertyName: string,
  path?: string
)
: string
{
  const className = Json.readProperty(json, propertyName);

  if (className === undefined || className === null)
  {
    throw Error(`Failed to deserialize data because property`
      + ` '${propertyName}'${inFile(path)} isn't valid`);
  }

  if (typeof className !== "string")
  {
    throw Error(`Unable to deserialize json data${inFile(path)}`
      + ` because property '${Serializable.CLASS_NAME}' isn't a string`);
  }

  return className;
}

function inFile(path?: string): string
{
  if (!path)
    return "";

  return ` in file ${path}`;
}

// ------------------ Type Declarations ----------------------

export namespace Serializable
{
  export type Mode =
    | "Save to file"
    | "Send to client"
    | "Send to server"
    | "Send to editor";

  export type PropertyFromJson =
  (
    propertyName: string,
    source: any,
    target: any,
    path?: string
  ) => any;

  export type PropertyToJson =
  (
    property: any,
    propertyName: string,
    className: string,
    mode: Mode
  ) => any;

  // Names of properties that require special handling.
  export const VERSION = "version";
  export const CLASS_NAME = "className";
  export const ID = "id";
  export const PROTOTYPE_ID = "prototypeId";

  // Names of classes that are transformed to JSON in a special way
  // or are serialized only as a reference.
  export const BITVECTOR_CLASS_NAME = "Bitvector";
  export const SET_CLASS_NAME = "Set";
  export const MAP_CLASS_NAME = "Map";
  export const ENTITY_CLASS_NAME = "Entity";

  // Special property name used to store serialized data of Map,
  // Set and Bitvector.
  export const DATA = "data";
}