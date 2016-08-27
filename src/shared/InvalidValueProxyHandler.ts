/*
  Part of BrutusNEXT

  Impements handler of javascript Proxy object that is used as
  value of invalid variables.
*/

/*
  Accessing properties of InvalidValueProxyHandler.invalidVariable
  prints error to mudlog. If a property of invalidVariable is read,
  of a method of invalidVariable is called, return value is again
  invalidVariable.
*/

'use strict';

import {getTrimmedStackTrace} from '../shared/UTILS';
import {ASSERT} from '../shared/ASSERT';
import {AdminLevels} from '../server/AdminLevels';
import {Mudlog} from '../server/Mudlog';

// Module 'harmony-proxy' translates new ES6 Proxy API to old
// (harmony) proxy API. So basically it allows us to call
// 'new Proxy(target, handler);' even though ES6 proxies are
// not imlemented in node.js yet.
let Proxy = require('harmony-proxy');

// This handler of javascript Proxy object is used to emulate 'invalid value'
// variable. Access to these variables is trapped and logged.
export class InvalidValueProxyHandler
{
  public static invalidVariable = new Proxy
  (
    // 'invalidVariable' is a function proxy
    // ('() => { }' is an empty function object).
    () => { },
    // Access to properties is trapped by InvalidValueProxyHandler class.
    new InvalidValueProxyHandler()
  );

  // -------------------  Traps -------------------------
  /// Note: It's possible that it will be necessary to implement some
  ///   of commented-out handlers in the future, so I'll let them be here.

  //// A trap for Object.getPrototypeOf.
  //public getPrototypeOf(target)
  //{
  //}

  //// A trap for Object.setPrototypeOf.
  //public setPrototypeOf(target)
  //{
  //}

  //// A trap for Object.isExtensible.
  //public isExtensible(target)
  //{
  //}

  //// A trap for Object.preventExtensions.
  //public preventExtensions(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyDescriptor.
  //public getOwnPropertyDescriptor(target)
  //{
  //}

  //// A trap for Object.defineProperty.
  //public defineProperty(target)
  //{
  //}

  //// A trap for the in operator.
  //public has(target)
  //{
  //}

  // A trap for getting property values.
  public get(target: any, property: any): any
  {
    // If someone calls 'toString()' on us.
    if (property === "toString")
      return function() { return "<InvalidVariable>"; }

    Mudlog.log
    (
      "Attempt to read property '" + property + "' of an invalid variable\n"
      + getTrimmedStackTrace(),
      Mudlog.msgType.INVALID_VARIABLE_ACCESS,
      AdminLevels.IMMORTAL
    );

    // Reading a property of invalid variable returns invalid variable.
    return InvalidValueProxyHandler.invalidVariable;
  }

  // A trap for setting property values.
  public set(target: any, property: any, value: any, receiver: any): boolean
  {
    console.log("InvalidFunctionProxyHandler.set trap triggered for property: "
      + property);

    Mudlog.log
    (
      "Attempt to write to property '" + property + "'"
      + " of an invalid variable\n"
      + getTrimmedStackTrace(),
      Mudlog.msgType.INVALID_VARIABLE_ACCESS,
      AdminLevels.IMMORTAL
    );

    // Return value of 'set' trap noramlly indicates if writing succeeded.
    // We are not, however, going to return false on failure, because that
    // would throw a TypeError exception, which is exactly what we are trying
    // to prevent here.
    //   The purpose of proxyfying invalid variables is to report errors
    // ourselves and handle them in such a way that they won't crash the game.
    return true;
  }


  //// A trap for the delete operator.
  //public deleteProperty(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyNames.
  //public ownKeys(target)
  //{
  //}

  // A trap for a function call.
  public apply(target, thisArg, argumentsList)
  {
    Mudlog.log
    (
      "Attempt to call an invalid function",

      ///   Calling getTrimmedStackTrace() had been causing
      ///  recursion so I had to remove it from here.
      //"Attempt to call an invalid function\n"
      //+ getTrimmedStackTrace(),

      Mudlog.msgType.INVALID_VARIABLE_ACCESS,
      AdminLevels.IMMORTAL
    );

    // Calling invalid variable as a function returns invalid variable.
    return InvalidValueProxyHandler.invalidVariable;
  }

  //// A trap for the new operator.
  //public construct(target)
  //{
  //}
}