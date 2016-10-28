/*
  Part of BrutusNEXT

  Class that let's you know it's class name.
*/

'use strict';

export class NamedClass
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
    return this.constructor[NamedClass.CLASS_NAME_PROPERTY];
  }

  // This is a hack allowing descendants of AttributableClass to search for
  // static properties of their ancestors.
  protected getThis() { return null; }
}
