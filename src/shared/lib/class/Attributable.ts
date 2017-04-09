/*
  Part of BrutusNEXT

  Enables using static attributes of class methods and data variables.
*/

/*
  Static property attributes are created by declaring static property of the
  same name and assigning an object containing required attributes to it.

  Example:

  class MyClass
  {
    // A variable we want to set attributes for.
    protected counter = 0;
    // Static attributes of variable 'counter'.
    protected static counter = { isSaved: false };
  }
*/


'use strict';

import {Nameable} from '../../../shared/lib/class/Nameable';

export class Attributable extends Nameable
{
  // -> Returns object containing static attributes for a given class property,
  //    Returns 'undefined' if 'property' doesn't have static attributes.
  protected getPropertyAttributes(property: string)
  {
    // This trick dynamically accesses static class property without
    // the need to use something like NamedClass.property;
    // (it's the same as if you could write (typeof(istance)).property).
    return this.constructor[property];
  }
}
