/*
  Part of BrutusNEXT

  Class that lets you know it's class name.
*/

/// Deprecated.
/// 'constructor.name' will be used as 'className'.
/// Dynamically created entities don't change the class name
/// (they have the name of the last hardcoded class in their
///  prototype class), Entity.name is used instead as a name
///  of the prototype.
/*
'use strict';

export class Nameable
{
  public static get CLASS_NAME_PROPERTY() { return 'className'; }

  public static get className()
  {
    // Dynamically created classes (prototype classes) use 'dynamicClassName'
    // property, because they don't have constructor.name and it can't be
    // set to them.
    if (this['dynamicClassName'] !== undefined)
      return this['dynamicClassName'];

    // Note:
    //   Because we are in a static method, 'this' is actualy the class
    // constructor and it's properties are static properties of the
    // class. So 'this.name' is actualy NamedClass.name (or whatever
    // class is accessed).
    return this.name;
  }

  public static set className(className: string)
  {
    // When 'dynamicClassName' is set, 'className' getter will return
    // it's value instead of 'constructor.name'. This is used by
    // dynamically created classes (prototype classes), which don't
    // have 'constructor.name'.
    this['dynamicClassName'] = className;
  }

  // This accessor exists for 'className' property to be saved to json
  // files to make them more readable.
  public get className()
  {
    // Return static variable 'className'.
    return this.constructor[Nameable.CLASS_NAME_PROPERTY];
  }

  // /// Deprecated
  // // This is a hack allowing descendants of Attributable class to search for
  // // static properties of their ancestors.
  // protected getThis() { return null; }
}
*/