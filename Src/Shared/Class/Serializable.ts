/* Part of BrutusNext */

/*
  Class that automates serializing to and from JSON format
  including re-creating classes that were serialized.

  Notes:
    Only saved properties are loaded. Properties that are not
    present in the save will not be deleted. It means that you
    can add new properties to existing classes without converting
    existing save files (but you should initialize them with
    default values of course).

    Properties are loaded even if they don't exist in class
    into which we are loading. This allows saving of properties
    created in runtime.

    Serializing of entities using just an 'id' is implemented
    in Serializable rather than in Entity to allow serializable
    entity references in non-entity Serializable classes.

    Descendants can override methods customSerializeProperty()
    and customDeserializeProperty() to change how are specific
    properties serialized.
*/

/*
  Pozn.:
    Momentálně se static properties checkují jen pro přímé properties
    Serializable instance. Tj. když do entity dám plain {}, tak u jeho
    properties nemůžu říct, jestli se mají serializovat a jak se mají
    editovat. Můžu ale místo něj udělat classu zděděnou ze Serializable,
    u té to opět říct můžu.

    Když bych to chtěl změnit, tak by to asi znamenalo do SerializeParam
    přidat staticAttributes, do kterých se budu rekurzivně zanořovat.
    (A samozřejmě tuhle funkcionalitu přidat do Attributable class).
*/

import { Types } from "../../Shared/Utils/Types";
import { Syslog } from "../../Shared/Log/Syslog";
// import { Vector } from "../../Shared/Physics/Vector";
// import { Entities } from "../../Shared/Class/Entities";
// import { ClassFactory } from "../../Shared/Class/ClassFactory";
// import { JsonObject } from "../../Shared/Class/JsonObject";
// import { Attributable } from "../../Shared/Class/Attributable";

// 3rd party modules.
// Note: Disable tslint check for 'const x = require()' because we
//   don't have type definitions for 'fastbitset' module so it cannot
//   be imported using 'import' keyword.
// tslint:disable-next-line:no-var-requires
const FastBitSet = require("fastbitset");

const VERSION = "version";
const CLASS_NAME = "className";
const NAME = "name";

// These are 'dummy' class names. They are only written to JSON
// but they don't really exists in code (Set and Map are build-in
// javascript classes, Bitvector translates to a 'fastbitset' object.
const BITVECTOR_CLASS_NAME = "Bitvector";
const VECTOR_CLASS_NAME = "Vector";
const SET_CLASS_NAME = "Set";
const MAP_CLASS_NAME = "Map";
const REFERENCE_CLASS_NAME = "Reference";

// These special property names are only written to serialized data
// (for example 'map' property holds an Array that represents serialized
//  data of a Map object).
const BITVECTOR = "bitvector";
const VECTOR_X = "x";
const VECTOR_Y = "y";
const MAP = "map";
const SET = "set";
export const ID = "id";
export const PROTOTYPE_ID = "prototypeId";

interface ObjectType { [key: string]: any; }

// export class Serializable extends Attributable
// {
//    // ------------- Protected static data ----------------

//   // 'version' is used to convert data from older formats.
//   //   If your class is saved to disk, you have to initialize it's
//   // 'version' (otherwise you get an exception while serializing).
//   protected static version = 0;

//   // ------------- Public static methods ----------------

//   // ! Throws exception on error.
//   // Use this only for Serializable objects not inherited from Entity.
//   public static deserialize(data: string): Serializable
//   {
//     // ! Throws exception on error.
//     const jsonObject = JsonObject.parse(data);
//     const className = (jsonObject as any)[CLASS_NAME];

//     if (className === null || className === undefined)
//     {
//       throw Error(`Unable to deserialize data because there is`
//         + ` no '${CLASS_NAME}' property in it`);
//     }

//     if (typeof className !== "string")
//     {
//       throw Error(`Unable to deserialize data because property`
//         + ` '${CLASS_NAME}' isn't a string`);
//     }

//     const serializable = ClassFactory.newInstanceByName(className);

//     return serializable.deserialize(jsonObject);
//   }

//   // --------------- Public accessors -------------------

//   // -> Returns string describing this object for error logging.
//   public get debugId()
//   {
//     // There is not much to say about generic serializable object.
//     return `{ className: ${this.getClassName()} }`;
//   }

//   // ---------------- Public methods --------------------

//   // ! Throws exception on error.
//   public dynamicCast<T>(Class: Types.AnyClass<T>): T
//   {
//     // Dynamic type check - we make sure that entity is inherited
//     // from requested class (or an instance of the class itself).
//     if (!(this instanceof Class))
//     {
//       throw Error (`Type cast error: serializable`
//         + ` object ${this.debugId} is not an instance`
//         + ` of class (${Class.name})`);
//     }

//     return (this as unknown) as T;
//   }

//   // ! Throws exception on error.
//   public serialize(mode: Serializable.Mode): string
//   {
//     const jsonObject = this.saveToJsonObject(mode);

//     return JsonObject.stringify(jsonObject);
//   }

//   // ! Throws exception on error.
//   // Extracts data from plain javascript object to this instance.
//   public deserialize(jsonObject: object, path?: string): this
//   {
//     // ! Throws exeption if versions don't match.
//     this.versionMatchCheck(jsonObject, path);

//     // ! Throws exeption if class names in source and target data don't match.
//     this.classMatchCheck(jsonObject, path);

//     // Copy all properties from 'jsonObject'.
//     for (const propertyName in jsonObject)
//     {
//       // Properties 'className' and 'version' aren't assigned
//       // ('className' represents the name of the javascript class
//       //   which cannot be changed and 'version' is serialized only
//       //   to be checked agains).
//       if (propertyName === CLASS_NAME || propertyName === VERSION)
//         continue;

//       // We are cycling over properties in JSON object, not in Serializable
//       // that is being loaded. It means that properties that are not present
//       // in the save will not get overwritten with 'undefined'. This allows
//       // adding new properties to existing classes without the need to
//       // convert all save files.
//       (this as any)[propertyName] = this.deserializeProperty
//       (
//         {
//           propertyName,
//           targetProperty: (this as any)[propertyName],
//           sourceProperty: (jsonObject as any)[propertyName],
//           path
//         }
//       );
//     }

//     return this;
//   }

//   // ! Throws exception on error.
//   // Creates primitive Javascript object and fills it with properties
//   // of 'this'. Data types that can't be directly serialized to JSON
//   // (like Set or Map) are converted to something serializable (Array,
//   //  string, etc).
//   public saveToJsonObject(mode: Serializable.Mode): object
//   {
//     let jsonObject = {};

//     // A little hack - save 'name', 'id', 'version' and 'className' properties
//     // first (out of order) to make saved JSON files more readable.
//     jsonObject = this.writeClassName(jsonObject);
//     jsonObject = this.writeId(jsonObject, ID);
//     jsonObject = this.writeId(jsonObject, PROTOTYPE_ID);
//     jsonObject = this.writeName(jsonObject);
//     jsonObject = this.writeVersion(jsonObject, mode);

//     // Cycle through all properties in source object.
//     for (const propertyName in this)
//     {
//       // Skip 'name' and 'className' properties because they are already
//       // saved by hack (we don't have to skip 'version' property because
//       // it is static).
//       if (isSkippedProperty(propertyName))
//         continue;

//       // Skip inherited properties (they are serialized on prototype entity).
//       if (!this.hasOwnProperty(propertyName))
//         continue;

//       // Check if property is flagged to be serialized.
//       if (!this.isSerialized(propertyName, mode))
//         continue;

//       // Skip nonprimitive properties that don't have any own properties.
//       if (!hasOwnValue(this[propertyName]))
//         continue;

//       (jsonObject as any)[propertyName] = this.serializeProperty
//       (
//         {
//           property: this[propertyName],
//           description: propertyName,
//           className: this.getClassName(),
//           mode
//         }
//       );
//     }

//     return jsonObject;
//   }

//   // -------------- Protected methods -------------------

//   // This method can be overriden to change how a property is serialized.
//   protected customSerializeProperty(param: Serializable.SerializeParam): any
//   {
//     return "Property isn't serialized customly";
//   }

//   // This method can be overriden to change how a property is deserialized.
//   protected customDeserializeProperty(param: Serializable.DeserializeParam)
//   : any
//   {
//     return "Property isn't deserialized customly";
//   }

//   // --------------- Private methods --------------------

//   private writeName(jsonObject: object)
//   {
//     if (this.hasOwnProperty(NAME))
//       (jsonObject as any)[NAME] = (this as any)[NAME];

//     return jsonObject;
//   }

//   private writeVersion(jsonObject: object, mode: Serializable.Mode)
//   {
//     switch (mode)
//     {
//       case "Send to client":
//       case "Send to server":
//         // Version is not written to serialized packets because they
//         // are always sent and received by the same code so it's
//         // unnecessary information.
//         return jsonObject;
//     }

//     // 'this.constructor' contains static properties of this class.
//     if (!this.constructor.hasOwnProperty(VERSION))
//     {
//       throw Error(`Failed to serialize ${this.debugId}`
//         + ` because static '${VERSION}' property is missing`
//         + ` on it. Make sure that 'static ${VERSION}' is`
//         + ` inicialized in class ${this.getClassName()}`);
//     }

//     const version = (this.constructor as any)[VERSION];

//     if (!Types.isNumber(version))
//     {
//       throw Error(`Failed to serialize ${this.debugId}`
//         + ` because static '${VERSION}' property is not a number.`
//         + ` Make sure that 'static ${VERSION}' is inicialized in`
//         + ` class ${this.getClassName()} to some number`);
//     }

//     (jsonObject as any)[VERSION] = version;

//     return jsonObject;
//   }

//   private writeClassName(jsonObject: object)
//   {
//     (jsonObject as any)[CLASS_NAME] = this.getClassName();

//     return jsonObject;
//   }

//   private writeId(jsonObject: object, propertyName: string)
//   {
//     if (this.hasOwnProperty(propertyName))
//       (jsonObject as any)[propertyName] = (this as any)[propertyName];

//     return jsonObject;
//   }

//   // Determines if property 'propertyName' is to be serialized
//   // in given serializable 'mode'.
//   private isSerialized(propertyName: string, mode: Serializable.Mode)
//   {
//     const attributes = this.propertyAttributes(propertyName);

//     switch (mode)
//     {
//       case "Save to file":
//         return attributes.saved !== false;

//       case "Send to client":
//         return attributes.sentToClient !== false;

//       case "Send to server":
//         return attributes.sentToServer !== false;

//       case "Send to editor":
//         return attributes.edited !== false;

//       default:
//         throw Syslog.reportMissingCase(mode);
//     }
//   }

//   // ! Throws exception on error.
//   // Writes a single property to a corresponding JSON object.
//   // -> Returns JSON object representing 'param.sourceProperty'.
//   private serializeProperty(param: Serializable.SerializeParam): any
//   {
//     const property = param.property;
//     const mode = param.mode;

//     // Allow custom property serialization in descendants.
//     const customValue = this.customSerializeProperty(param);

//     if (customValue !== "Property isn't serialized customly")
//       return customValue;

//     // Primitive values (number, string, null, etc.) are just assigned.
//     if (Types.isPrimitiveType(property) || property === undefined)
//       return property;

//     if (Types.isArray(property))
//       return this.serializeArray(param, (property as Array<any>));

//     // We have eliminated all possibilities that 'property' isn't an
//     // object of some kind so we can safely typecast it.
//     const objectProperty = property as ObjectType;

//     if (isEntity(objectProperty))
//       // Entities are serialized separately (each entity is saved to
//       // a separate file). Only entity id will be saved.
//       return createEntitySaver(objectProperty, param).saveToJsonObject(mode);

//     // Property is a Serializable object (but not an entity).
//     if (property instanceof Serializable)
//       return property.saveToJsonObject(mode);

//     if (Types.isDate(property))
//     {
//       throw Error("Attempt to serialize property of type Date()."
//         + " Date object should not be used because it can't be"
//         + " properly inherited using prototypal inheritance."
//         + " Use class Time instead. Property is not serialized");
//     }

//     if (Types.isMap(property))
//       return createMapSaver(property as Map<any, any>).saveToJsonObject(mode);

//     if (Types.isBitvector(property))
//       return createBitvectorSaver(property).saveToJsonObject(mode);

//     if (property instanceof Vector)
//       return createVectorSaver(property).saveToJsonObject(mode);

//     if (property instanceof Set)
//       return createSetSaver(property).saveToJsonObject(mode);

//     if (Types.isPlainObject(property))
//       return this.serializePlainObject(param, objectProperty);

//     throw Error(`Property '${param.description}' in class`
//       + ` '${param.className}' (or inherited from one of it's`
//       + ` ancestors) is a class but is neither inherited from`
//       + ` Serializable nor has a type that we know how to save.`
//       + ` Make sure that you only use primitive types (numbers,`
//       + ` strings, etc.), Arrays, primitive javascript objects,`
//       + ` Maps or classes inherited from Serializable as properties`
//       + ` of classes inherited from Serializable. If you want a new`
//       + ` type to be saved, you need to add this functionality to `
//       + ` Serializable.ts. Property is not saved`);
//   }

//   // Saves a property of type Array to a corresponding JSON Array object.
//   private serializeArray
//   (
//     param: Serializable.SerializeParam,
//     sourceArray: Array<any>
//   )
//   {
//     const jsonArray = [];

//     // Serialize all items in source array and push them to 'jsonArray'.
//     for (let i = 0; i < sourceArray.length; i++)
//     {
//       const serializedArrayItem = this.serializeProperty
//       (
//         {
//           property: sourceArray[i],
//           description: `Array item [${i}]`,
//           className: param.className,
//           mode: param.mode
//         }
//       );

//       jsonArray.push(serializedArrayItem);
//     }

//     return jsonArray;
//   }

//   // ! Throws exception on error.
//   private serializePlainObject
//   (
//     param: Serializable.SerializeParam,
//     sourceObject: ObjectType
//   )
//   : object
//   {
//     const jsonObject = {};

//     // Serialize all properties of sourceObject.
//     for (const propertyName in sourceObject)
//     {
//       // Only serialize own (not inherited) properties.
//       if (!sourceObject.hasOwnProperty(propertyName))
//         continue;

//       const sourceProperty = sourceObject[propertyName];

//       // Skip nonprimitive properties that don't have any own properties.
//       if (!hasOwnValue(sourceProperty))
//         continue;

//       (jsonObject as any)[propertyName] = this.serializeProperty
//       (
//         {
//           property: sourceProperty,
//           description: propertyName,
//           className: "Object",
//           mode: param.mode
//         }
//       );
//     }

//     return jsonObject;
//   }

//   // ! Throws exception on error.
//   // Deserializes a single property from corresponding JSON object.
//   // Converts from serializable format to original data type as needed
//   // (for example Set class is saved to JSON as an Array so it has to be
//   //  reconstructed here).
//   private deserializeProperty(param: Serializable.DeserializeParam): any
//   {
//     {
//       // Allow custom property deserialization in descendants.
//       const result = this.customDeserializeProperty(param);

//       if (result !== "Property isn't deserialized customly")
//         return result;
//     }

//     {
//       // First handle the case that source property has 'null' value. In that
//       // case target property will also be 'null', no matter what type it is.
//       if (param.sourceProperty === null)
//       {
//         throw Error(`Property '${param.propertyName}'`
//           + `${inFile(param.path)} has 'null' value.`
//           + `'null' is not allowed, make sure that it`
//           + ` is not used anywhere`);
//       }
//     }

//     {
//       const result = deserializeAsBitvector(param);

//       if (result !== "Property is not a bitvector")
//         return result;
//     }

//     {
//       const result = deserializeAsVector(param);

//       if (result !== "Property is not a Vector")
//         return result;
//     }

//     {
//       const result = this.deserializeAsSet(param);

//       if (result !== "Property is not a Set")
//         return result;
//     }

//     {
//       const result = this.deserializeAsMap(param);

//       if (result !== "Property is not a Map")
//           return result;
//     }

//     {
//       const result = deserializeAsEntityReference(param);

//       if (result !== "Property is not a reference to an Entity")
//         return result;
//     }

//     {
//       const result = this.deserializeAsArray(param);

//       if (result !== "Property is not an Array")
//         return result;
//     }

//     {
//       // Attempt to load property as an object
//       // (including classes inherited from Serializable).
//       //   Note that this would also mean Arrrays and all other
//       // nonprimitive types, so they must be handled before this.
//       const result = this.deserializeAsObject(param);

//       if (result !== "Property is not an object")
//         return result;
//     }

//     // If propety has neither of types we have just tried,
//     // we load it as primitive type (primitive properties
//     // are simply assigned).
//     return param.sourceProperty;
//   }

//   // ! Throws exception on error.
//   private classMatchCheck(jsonObject: object, path?: string)
//   {
//     const sourceClassName = (jsonObject as any)[CLASS_NAME];
//     const targetClassName = this.getClassName();

//     if (sourceClassName === undefined)
//     {
//       throw Error(`Failed to deserialize because`
//         + ` there is no '${CLASS_NAME}' property`
//         + ` in JSON data${inFile(path)}`);
//     }

//     if (sourceClassName !== targetClassName)
//     {
//       throw Error(`Failed to deserialize because`
//         + ` JSON data${inFile(path)} belongs to class`
//         + ` '${sourceClassName}' while target class is`
//         + ` '${targetClassName})`);
//     }
//   }

//   // ! Throws exception on error.
//   private versionMatchCheck(jsonObject: object, path?: string)
//   {
//     const version = (jsonObject as any)[VERSION];

//     // If there isn't a 'version' property in jsonObject,
//     // it won't be checked for (it's generally not used in
//     // packets because they are always sent and received
//     // from the same code).
//     if (version === undefined)
//       return;

//     // 'this.constructor[VERSION]' acesses static property 'version'.
//     const thisVersion = (this.constructor as any)[VERSION];

//     if (version !== thisVersion)
//     {
//       throw Error(`Failed to deserialize because version of`
//         + ` JSON data (${version})${inFile(path)} doesn't match`
//         + ` required version (${thisVersion})`);
//     }
//   }

//   // ! Throws exception on error.
//   private deserializeAsSet(param: Serializable.DeserializeParam)
//   {
//     if (!isSetRecord(param.sourceProperty))
//       return "Property is not a Set";

//     const targetIsValid =
//        param.targetProperty === null
//     || param.targetProperty === undefined
//     || Types.isSet(param.targetProperty);

//     if (!targetIsValid)
//     {
//       throw Error(`Failed to deserialize because target property`
//         + ` '${param.propertyName}'${inFile(param.path)} is not 'Set',`
//         + ` 'null' or 'undefined' when deserializing property of type Set`);
//     }

//     return this.readSet(param);
//   }

//   // ! Throws exception on error.
//   private deserializeAsMap(param: Serializable.DeserializeParam)
//   {
//     if (!isMapRecord(param.sourceProperty))
//       return "Property is not a Map";

//     const targetIsValid =
//        param.targetProperty === null
//     || param.targetProperty === undefined
//     || Types.isMap(param.targetProperty);

//     if (!targetIsValid)
//     {
//       throw Error(`Failed to deserialize because target property`
//         + ` '${param.propertyName}'${inFile(param.path)} is not 'Map',`
//         + ` 'null' or 'undefined' when deserializing property of type Map`);
//     }

//     return this.readMap(param);
//   }

//   // ! Throws exception on error.
//   private deserializeAsArray(param: Serializable.DeserializeParam)
//   {
//     if (!Array.isArray(param.sourceProperty))
//       return "Property is not an Array";

//     // Here we need to use Types.isArray() instead of Array.isArray()
//     // because 'param.targetProperty' can be a {} with an array
//     // as it's prototype created by object.create().
//     const targetIsValid =
//        param.targetProperty === null
//     || param.targetProperty === undefined
//     || Types.isArray(param.targetProperty);

//     if (!targetIsValid)
//     {
//       throw Error(`Failed to deserialize because target property`
//         + ` '${param.propertyName}'${inFile(param.path)} is not 'Array'`
//         + ` 'null' or 'undefined' when deserializing property of type Array`);
//     }

//     return this.readArray(param);
//   }

//   // ! Throws exception on error.
//   private deserializeAsObject(param: Serializable.DeserializeParam)
//   {
//     if (Types.isPrimitiveType(param.sourceProperty))
//       return "Property is not an object";

//     const targetIsValid =
//        param.targetProperty === null
//     || param.targetProperty === undefined
//     || !Types.isPrimitiveType(param.targetProperty);

//     if (!targetIsValid)
//     {
//       throw Error(`Failed to deserialize because target property`
//         + ` '${param.propertyName}'${inFile(param.path)} is not 'object',`
//         + ` 'null' or 'undefined' when deserializing property of type object`);
//     }

//     return this.readObject(param);
//   }

//   // ! Throws exception on error.
//   private readObject(param: Serializable.DeserializeParam)
//   {
//     let instance = param.targetProperty;

//     // If target property is 'null' or 'undefined', we wouldn't be
//     // able to write anything to it or call it's deserialize method.
//     // So we first need to assign a new instance of correct type to
//     // it - the type is saved in JSON as 'className' property.
//     if (instance === null || instance === undefined)
//       instance = createNew(param);

//     if (instance === null || instance === undefined)
//     {
//       throw Error(`Failed to instantiate property '${param.propertyName}'`
//         + `${inFile(param.path)}`);
//     }

//     if (isDeserializable(instance))
//     {
//       return instance.deserialize(param.sourceProperty, param.path);
//     }

//     if (!Types.isPlainObject(instance))
//     {
//       throw Error("Attempt to deserialize a nonprimitive property which"
//         + " is neither an instance of Serializable class nor a plain"
//         + " Javascript object. This means that you have a class inherited"
//         + " from Serializable and you put a property in it which is"
//         + " neither inherited from Serializable nor a special type"
//         + " handled in Serializable.ts (like Set, Map, etc.). You either"
//         + " have to extend this property from Serializable class or add"
//         + " code to Serializable to handle it's serialization");
//     }

//     // We are loading a primitive Javascript object.
//     return this.deserializePlainObject
//     (
//       {
//         propertyName: param.propertyName,
//         sourceProperty: param.sourceProperty,
//         // We will be loading into our possibly newly created instance.
//         targetProperty: instance,
//         path: param.path
//       }
//     );
//   }

//   // ! Throws exception on error.
//   private deserializePlainObject(param: Serializable.DeserializeParam)
//   {
//     const sourceObject = param.sourceProperty;

//     // We are cycling over properties in source object, not in
//     // object that is being loaded. It means that we are only
//     // overwriting properties that exist on the source object.
//     //   We are not, however, enforcing that source properties
//     // exist in target object because that would prevent
//     // deserializing plain Javascript objects to a 'null' value
//     // property (properties with 'null' value are instantiated
//     // as {} before writing into them so they don't have any
//     // properties).
//     //   The same is true for loading Array items (the don't exist
//     // prior to loading) which applies to Map and Set objects as well
//     // (because they are serialized as Arrays).
//     for (const propertyName in sourceObject)
//     {
//       // Only deserialize own (not inherited) properties.
//       if (!sourceObject.hasOwnProperty(propertyName))
//         continue;

//       // Deserializing of each property may require special handling
//       // so we use readProperty() which will do it for us.
//       param.targetProperty[propertyName] = this.deserializeProperty
//       (
//         {
//           propertyName: param.propertyName,
//           // We pass 'undefined' as 'targetProperty' to make
//           // readObject() create a new instance for us.
//           targetProperty: undefined,
//           sourceProperty: param.sourceProperty[propertyName],
//           path: param.path
//         }
//       );
//     }

//     return param.targetProperty;
//   }

//   // ! Throws exception on error.
//   private readSet(param: Serializable.DeserializeParam): Set<any>
//   {
//     // ! Throws exception on error.
//     // In order to deserialize a Set object, we need to load all items
//     // in array which represents it in serialized form, because they
//     // may require special handling themselves (for example if you put
//     // another Set into your Set). We let readArray() do it for us.
//     const deserializedArray = this.readArray
//     (
//       {
//         propertyName: "Serialized record: Set",
//         targetProperty: [],   // Load into a new array.
//         sourceProperty: getProperty(param, SET),
//         path: param.path
//       }
//     );

//     return new Set(deserializedArray);
//   }

//   // ! Throws exception on error.
//   // Converts 'param.sourceProperty' to a Map object.
//   private readMap(param: Serializable.DeserializeParam): Map<any, any>
//   {
//     // ! Throws exception on error.
//     // In order to deserialize a Map object, we need to load all items
//     // in array which represents it in serialized form, because they
//     // may require special handling themselvs (for example if you put
//     // another Map into your Map). We let readArray() do it for us.
//     const deserializedArray = this.readArray
//     (
//       {
//         propertyName: "Serialized record: Map",
//         targetProperty: [],   // Load into a new array.
//         sourceProperty: getProperty(param, MAP),
//         path: param.path
//       }
//     );

//     return new Map(deserializedArray);
//   }

//   // ! Throws exception on error.
//   // Converts 'param.sourceProperty' to Array.
//   private readArray(param: Serializable.DeserializeParam): Array<any>
//   {
//     const array = param.sourceProperty;

//     if (array === null || array === undefined)
//     {
//       throw Error(`Failed to deserialize array because`
//         + ` source property '${param.propertyName}' is`
//         + ` invalid${inFile(param.path)}`);
//     }

//     if (!Array.isArray(array))
//     {
//       throw Error(`Failed to deserialize array because`
//         + ` source property '${param.propertyName}' is not`
//         + ` an array${inFile(param.path)}`);
//     }

//     const newArray = [];

//     for (let i = 0; i < array.length; i++)
//     {
//       newArray.push
//       (
//         this.readArrayItem(array[i], i, param.path)
//       );
//     }

//     return newArray;
//   }

//   // ! Throws exception on error.
//   // ('index' and 'path' are used only for error messages).
//   private readArrayItem(item: any, index: number, path?: string)
//   {
//     // Let 'readProperty()' method load the contents of an array item.
//     return this.deserializeProperty
//     (
//       {
//         propertyName: `Array item [${index}]`,
//         // We pass 'undefined' as 'targetProperty' to make
//         // readObject() create a new instance for us.
//         targetProperty: undefined,
//         sourceProperty: item,
//         path
//       }
//     );
//   }
// }

// // ----------------- Auxiliary Functions ---------------------

// // -> Returns 'true' if 'variable' has own (not just inherited) value.
// function hasOwnValue(variable: any): boolean
// {
//   // Variables of primitive types are always serialized.
//   if (Types.isPrimitiveType(variable))
//     return true;

//   if (Types.isMap(variable) || Types.isSet(variable))
//   {
//     // Maps and Sets are always instantiated as 'new Map()'
//     // or 'new Set()'. We only serialize them if they contain
//     // something.
//     return variable.size !== 0;
//   }

//   // Other nonprimitive variables are only saved if they contain
//   // any own (not inherited) properties which have some own (not
//   // inherited) value themselves.
//   for (const propertyName in variable)
//   {
//     if (!variable.hasOwnProperty(propertyName))
//       continue;

//     if (hasOwnValue(variable[propertyName]))
//       return true;
//   }

//   return false;
// }

// // Checks if 'param.sourceProperty' represents a saved FastBitSet object.
// function isBitvectorRecord(jsonObject: object): boolean
// {
//   if (!jsonObject)
//     return false;

//   return (jsonObject as any)[CLASS_NAME] === BITVECTOR_CLASS_NAME;
// }

// // Checks if 'param.sourceProperty' represents a saved Vector object.
// function isVectorRecord(jsonObject: object): boolean
// {
//   if (!jsonObject)
//     return false;

//   return (jsonObject as any)[CLASS_NAME] === VECTOR_CLASS_NAME;
// }

// // Checks if 'param.sourceProperty' represents a saved Set object.
// function isSetRecord(jsonObject: object): boolean
// {
//   if (!jsonObject)
//     return false;

//   return (jsonObject as any)[CLASS_NAME] === SET_CLASS_NAME;
// }

// // Checks if 'param.sourceProperty' represents a saved Map object.
// function isMapRecord(jsonObject: object): boolean
// {
//   if (!jsonObject)
//     return false;

//   return (jsonObject as any)[CLASS_NAME] === MAP_CLASS_NAME;
// }

// // Checks if 'param.sourceProperty' represents a saved reference to
// // an entity.
// function isReference(jsonObject: object): boolean
// {
//   if (!jsonObject)
//     return false;

//   return (jsonObject as any)[CLASS_NAME] === REFERENCE_CLASS_NAME;
// }

// function isDeserializable(instance: any): boolean
// {
//   return ("deserialize" in instance);
// }

// function createSaver(className: string)
// {
//   const saver = new Serializable();

//   // Fake the 'className' getter.
//   saver.getClassName = () => className;

//   return saver;
// }

// // ! Throws exception on error.
// function createSetSaver(set: Set<any>)
// {
//   const saver = createSaver(SET_CLASS_NAME);

//   // Set is saved as it's Array representation to property 'set'.
//   (saver as any)[SET] = saveSetToArray(set);

//   return saver;
// }

// // ! Throws exception on error.
// function createMapSaver(map: Map<any, any>)
// {
//   const saver = createSaver(MAP_CLASS_NAME);

//   // Map is saved as it's Array representation to property 'map'.
//   (saver as any)[MAP] = saveMapToArray(map);

//   return saver;
// }

// // ! Throws exception on error.
// function createBitvectorSaver(bitvector: any)
// {
//   if (bitvector === null)
//   {
//     throw Error("Failed to create bitvector saver because"
//     + " bitvector which should be saved is 'null'");
//   }

//   const saver = createSaver(BITVECTOR_CLASS_NAME);

//   if (!("toJSON" in bitvector))
//   {
//     throw Error("Failed to create bitvector saver because bitvector"
//       + " which should be saved doesn't have 'toJSON' method");
//   }

//   // Bitvector is saved as it's JSON string representation to
//   // property 'bitvector'.
//   (saver as any)[BITVECTOR] = bitvector.toJSON();

//   return saver;
// }

// // ! Throws exception on error.
// function createVectorSaver(vector: Vector)
// {
//   const saver = createSaver(VECTOR_CLASS_NAME);

//   // Write 'x' and 'y' to make packets more concise.
//   (saver as any)[VECTOR_X] = vector.x;
//   (saver as any)[VECTOR_Y] = vector.y;

//   return saver;
// }

// // ! Throws exception on error.
// function createEntitySaver
// (
//   entity: ObjectType,
//   param: Serializable.SerializeParam
// )
// : Serializable
// {
//   // ! Throws exception on error.
//   const id = getEntityId(entity, param);

//   const saver = createSaver(REFERENCE_CLASS_NAME);

//   // Only a string id is saved when an entity is serialized.
//   (saver as ObjectType)[ID] = id;

//   return saver;
// }

// // -> Returns an Array representation of Set object.
// function saveSetToArray(set: Set<any>): Array<any>
// {
//   const result = [];

//   for (const entry of set.values())
//     result.push(entry);

//   return result;
// }

// // -> Returns an Array representation of Map object.
// function saveMapToArray(map: Map<any, any>): Array<any>
// {
//   const result = [];

//   for (const entry of map.entries())
//     result.push(entry);

//   return result;
// }

// // -> Returns string informing about file location or empty string
// //    if 'path' is not available.
// function inFile(path?: string)
// {
//   if (!path)
//     return "";

//   return ` in file ${path}`;
// }

// // ! Throws exception on error.
// function getProperty
// (
//   param: Serializable.DeserializeParam,
//   propertyName: string
// )
// {
//   if (!param.sourceProperty)
//   {
//     throw Error(`Failed to deserialize because source property`
//       + ` '${param.propertyName}'${inFile(param.path)} isn't valid`);
//   }

//   const property = param.sourceProperty[propertyName];

//   if (property === undefined || property === null)
//   {
//     throw Error(`Failed to deserialize because property`
//       + ` '${propertyName}'${inFile(param.path)} isn't valid`);
//   }

//   return property;
// }

// // ! Throws exception on error.
// // Reads 'className' from 'param.sourceProperty'
// // and creates an instance of that class.
// function createNew(param: Serializable.DeserializeParam): object
// {
//   const className = param.sourceProperty[CLASS_NAME];

//   // If there isn't a 'className' property in source object,
//   // we will load into a plain object.
//   if (className === undefined)
//     return {};

//   // Note:
//   //   We don't have to check if 'className' is an Entity class,
//   // because entities are always serialized as a reference. So if
//   // there is an instance of some Serializable class saved directly
//   // in JSON, it can't be an entity class.

//   // ! Throws exception on error.
//   return ClassFactory.newInstanceByName(className);
// }

// // Converts 'param.sourceProperty' to a FastBitSet object.
// function readBitvector(param: Serializable.DeserializeParam)
// {
//   return new FastBitSet(getProperty(param, BITVECTOR));
// }

// // Converts 'param.sourceProperty' to a Vector object.
// function readVector(param: Serializable.DeserializeParam)
// {
//   const vector =
//   {
//     x: getProperty(param, VECTOR_X),
//     y: getProperty(param, VECTOR_Y)
//   };

//   return new Vector(vector);
// }

// // ! Throws exception on error.
// function deserializeAsBitvector(param: Serializable.DeserializeParam)
// {
//   if (!isBitvectorRecord(param.sourceProperty))
//     return "Property is not a bitvector";

//   const targetIsValid =
//      param.targetProperty === null
//   || param.targetProperty === undefined
//   || Types.isBitvector(param.targetProperty);

//   if (!targetIsValid)
//   {
//     throw Error(`Failed to deserialize because target property`
//       + ` '${param.propertyName}'${inFile(param.path)} is not 'bitvector',`
//       + ` 'null' or 'undefined' when deserializing property of type`
//       + ` bitvector`);
//   }

//   return readBitvector(param);
// }

// // ! Throws exception on error.
// function deserializeAsVector(param: Serializable.DeserializeParam)
// {
//   if (!isVectorRecord(param.sourceProperty))
//     return "Property is not a Vector";

//   const targetIsValid =
//      param.targetProperty === null
//   || param.targetProperty === undefined
//   || Types.isVector(param.targetProperty);

//   if (!targetIsValid)
//   {
//     throw Error(`Failed to deserialize because target property`
//       + ` '${param.propertyName}'${inFile(param.path)} is not 'Vector',`
//       + ` 'null' or 'undefined' when deserializing property of type Vector`);
//   }

//   return readVector(param);
// }

// // ! Throws exception on error.
// // Converts 'param.sourceProperty' to a reference to an Entity.
// // If 'id' loaded from JSON already exists in Entities, existing
// // entity will be returned. Otherwise an 'invalid' entity reference
// // will be created and returned.
// // -> Retuns an existing entity or an invalid entity reference.
// function readEntityReference(param: Serializable.DeserializeParam)
// {
//   const id = getProperty(param, ID);

//   return Entities.getReference(id);
// }

// // Attempts to convert 'param.sourceProperty' to reference to an Entity.
// function deserializeAsEntityReference(param: Serializable.DeserializeParam)
// {
//   if (!isReference(param.sourceProperty))
//     return "Property is not a reference to an Entity";

//   return readEntityReference(param);
// }

// function isEntity(variable: ObjectType)
// {
//   // We can't import Entity to Serializable because it would cause
//   // cyclic module dependency error. So instead we just test if there
//   // is an 'id' property in 'variable'.
//   return (ID in variable);
// }

// // ! Throws exception on error.
// function getEntityId(entity: ObjectType, param: Serializable.SerializeParam)
// {
//   const id = entity[ID];

//   if (typeof id !== "string")
//   {
//     throw Error(`Failed to serialize class '${param.className}'`
//       + ` because 'id' property '${id}' of it's property ${param.description}`
//       + ` is not a string. Object's with 'id' property are considered`
//       + ` entities and as such must have a string 'id' property`);
//   }

//   return id;
// }

// function isSkippedProperty(name: string)
// {
//   return name === NAME
//       || name === CLASS_NAME
//       || name === ID
//       || name === PROTOTYPE_ID;
// }

// ------------------ Type declarations ----------------------

export namespace Serializable
{
  export type Mode =
    "Save to file"
  | "Send to client"
  | "Send to server"
  | "Send to editor";

  export interface DeserializeParam
  {
    propertyName: string;
    sourceProperty: any;
    targetProperty: any;
    path?: string;
  }

  export interface SerializeParam
  {
    property: any;
    description: string; // Used for error messages.
    className: string;
    mode: Mode;
  }
}