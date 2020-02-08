/*
  Part of BrutusNext

  Types and type-related utility functions
*/

import { Serializable } from "../../Shared/Class/Serializable";

// // Use 'isomorphic-ws' to use the same code on both client and server.
// import * as WebSocket from "isomorphic-ws";

export namespace Types
{
  export type Object = { [key: string]: any };

  // Used for example in 'new Promise((resolve, reject) => { ... })'.
  export type ResolveFunction<T> = (value?: T | PromiseLike<T>) => void;

  // Used for example in 'new Promise((resolve, reject) => { ... })'.
  export type RejectFunction = (reason?: any) => void;

// This type describes both abstract and nonabstract classes.
// Regular classes in typescript are considered to be a constructor
// function, hence the '(new (...args: any[]) => T)' part on the right
// of '|' character. However, some classes can be abstract and in that
//  case they don't have a constructor function because the whole point
// of an abstract class is that they cannot be instantiated. So the type
// of an abstract class is a Function with a prototype with no constructor.
export type AnyClass<T> =
  ((...args: any[]) => void & { prototype: T }) | (new (...args: any[]) => T);

// Nonabstract class in javascript is it's constructor function.
export type NonabstractClass<T> = new (...args: any[]) => T;

export function isString(variable: any): boolean
{
  return typeof variable === "string";
}

export function isBitvector(variable: any): boolean
{
  if (variable === null || variable === undefined || !variable.constructor)
    return false;

  return variable.constructor.name === "FastBitSet";
}

export function isDate(variable: any): boolean
{
  if (variable === null || variable === undefined || !variable.constructor)
    return false;

  return variable.constructor.name === "Date";
}

export function isMap(variable: any): boolean
{
  if (variable === null || variable === undefined || !variable.constructor)
    return false;

  return variable.constructor.name === "Map";
}

export function isSet(variable: any): boolean
{
  if (variable === null || variable === undefined || !variable.constructor)
    return false;

  return variable.constructor.name === "Set";
}

// Detects only native javascript Objects - not classes.
export function isPlainObject(variable: any): boolean
{
  if (variable === null || variable === undefined || !variable.constructor)
    return false;

  return variable.constructor.name === "Object";
}

export function isArray(variable: any): boolean
{
  if (variable === null || variable === undefined || !variable.constructor)
    return false;

  return variable.constructor.name === "Array";
}

// -> Returns 'true' if 'variable' is a primitive type
//    (boolean, null, undefined, number, string or symbol).
export function isPrimitiveType(variable: any): boolean
{
  // For some reason typeof 'null' is 'object' in javascript
  // so we have check for it explicitely.
  return variable === null || typeof variable !== "object";
}

export function isSerializable(variable: any): boolean
{
  return variable instanceof Serializable;
}

export function isNumber(variable: any): boolean
{
  return typeof variable === "number";
}

// // ! Throws exception on error.
// export function dynamicCast<T>(instance: unknown, Class: AnyClass<T>): T
// {
//   if (!(instance instanceof Class))
//   {
//     throw Error (`Variable is not an instance of class (${Class.name})`);
//   }

//   return instance as T;
// }
}