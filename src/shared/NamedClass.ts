/*
  Part of BrutusNEXT

  Class that let's you know it's class name.
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';

export class NamedClass
{
  public static get CLASS_NAME_PROPERTY() { return 'className'; }

  public get className()
  {
    let className = this.constructor[NamedClass.CLASS_NAME_PROPERTY];

    // There are two ways how a class can be declared:
    // - either it is declared statically like 'class Character { ... }'
    // - or it is declared dynamically, without a name, like 'class {}'
    // Statically declared classes have a name set to Class.constructor.name,
    // dynamically created classes don't and it can't be set to them, because
    // constructor.name property is read-only (and it can't be changed).
    //   In order to know class names of all classes, we have to use another
    // property for it: constructor.className. For dynamically declared
    // classes it is set at declaration time (see Prototype::declareClass()).
    // For statically created classes it's set the first time it's requested
    // - that's what we are going to do here.
    if (className === undefined)
    {
      // Accessing property of this.constructor is the same as accessing
      // static class property (so it's like NamedClass.className), but
      // it will access property of actuall class of instance at which
      // it is called (so for an instance of Room it will be Room.className).
      this.constructor[NamedClass.CLASS_NAME_PROPERTY] = this.constructor.name;
      className = this.constructor.name;

      ASSERT_FATAL(className !== "",
        "Attempt to create class with missing constructor.className"
        + " and empty 'constructor.name'. This prorably means that you"
        + " have dynamically created a class using something like"
        + " NewClass = class {} and you didn't set"
        + " NewClass.constructor['className']");
    }

    return className;
  }

  //public className = "NamedClass";

  // This is a hack allowing descendants of AttributableClass to search for
  // static properties of their ancestors.
  protected getThis() { return null; }


  /*
  /// This is not used anymore. 'className' accessor is used instead.
  // Returns name of the class which inherited this method.
  private static getClassName()
  {
    return this.constructor.name;

    //// (.*) matches any number of any characters.
    //let classNameRegex = /class (.*) extends (.*)/;

    //// this.constructor.toString() is something like:
    //// 'class GameEntity extends something'
    //// We want to grab 'GameEntity' part of it.
    ////   Note: It will probably only work for classes that extend something,
    //// but this functionality is only available to classes that extend
    //// NamedClass so it will always by true.

    //// results[0] will be whole matched string,
    //// results[1] will be first string matched by (.*) - that's our class
    //// name.
    //let results = classNameRegex.exec(this.constructor.toString());

    //ASSERT_FATAL(results !== null && results.length > 1,
    //  "Unable to extract class name");

    //return (results && results.length > 1) ? results[1] : "";
  }
  */
}
