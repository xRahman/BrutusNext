/*
  Part of BrutusNEXT

  Impements handler of javascript Proxy object that is used as
  value of invalid variables.
*/

/*
  Accessing properties of InvalidValueProxyHandler.invalidVariable
  prints error to syslog. If a property of invalidVariable is read,
  of a method of invalidVariable is called, return value is again
  invalidVariable.
*/

'use strict';

import {AdminLevel} from '../../server/AdminLevel';
import {Syslog} from '../../server/Syslog';
import {Message} from '../../server/message/Message';

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
    // If someone accesses 'constructor' on us.
    if (property === 'constructor')
      return function() { }

    // If someone accesses 'name' on us.
    if (property === 'name')
      return "<InvalidVariable>";

    // If someone calls 'valueOf()' on us.
    if (property === 'valueOf')
      return function() { return "<InvalidVariable>"; }

    // If someone calls 'toString()' on us.
    if (property === 'toString')
      return function() { return "<InvalidVariable>"; }

    // If someone calls 'inspect' on us.
    // (This happens when utils.inspect() is used.)
    if (property === 'inspect')
      return function() { return "<InvalidVariable>"; }

    Syslog.log
    (
      "Attempt to read property '" + property + "' of an invalid variable\n"
        + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
      Message.Type.INVALID_ACCESS,
      AdminLevel.IMMORTAL
    );

    // Reading a property of invalid variable returns invalid variable.
    return InvalidValueProxyHandler.invalidVariable;
  }

  // A trap for setting property values.
  public set(target: any, property: any, value: any, receiver: any): boolean
  {
    console.log("InvalidFunctionProxyHandler.set trap triggered for property: "
      + property);

    Syslog.log
    (
      "Attempt to write to property '" + property + "'"
      + " of an invalid variable\n"
        + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
      Message.Type.INVALID_ACCESS,
      AdminLevel.IMMORTAL
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
    /// This error message is more missleading than helpful so it will
    /// be removed.
    ///   When a function is called, get() handler is triggered first
    /// and it's error message is printed. Then the actual function
    /// is called and apply() handler ui called (that's where we are
    /// now) so there would be another error message regarding the
    /// same event.
    ///   Furthemore, this error message would be prinded when
    /// utils.inspect() is used on an entity proxy, because inspect()
    /// function is accessed and called in that case. So we would get\
    /// an error message to syslog, that doesn't really belong to an
    /// error (inspecting an invalid entity is ok, it returns
    /// <InvalidEntity>).
    //Syslog.log
    //(
    //  "Attempt to call function on an invalid variable\n"
    //    + Syslog.getTrimmedStackTrace(Syslog.TrimType.PROXY_HANDLER),
    //  Syslog.msgType.INVALID_ACCESS,
    //  AdminLevels.IMMORTAL
    //);

    // Calling invalid variable as a function returns invalid variable.
    return InvalidValueProxyHandler.invalidVariable;
  }

  //// A trap for the new operator.
  //public construct(target)
  //{
  //}
}