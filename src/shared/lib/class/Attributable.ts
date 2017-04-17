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

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Nameable} from '../../../shared/lib/class/Nameable';
import {Attributes} from '../../../shared/lib/class/Attributes';

export class Attributable extends Nameable
{
  // -> Returns object containing static attributes for a given class property,
  //    Returns 'undefined' if 'property' doesn't have static attributes.
  protected getPropertyAttributes(propertyName: string): Attributes
  {
    // This trick dynamically accesses static class property without
    // the need to use something like NamedClass.property;
    // (it's the same as if you could write (typeof(istance)).property).
    let attributes = this.constructor[propertyName];

    if (attributes === null)
    {
      ERROR("'null' static property atributes for property"
        + " '" + propertyName + "'. Make sure that 'static"
        + " " + propertyName + "' declared in class"
        + " " + this.className + " (or in some of it's ancestors)"
        + " is not null");
      return undefined;
    }

    return attributes;
  }
}
