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

import {NamedClass} from '../../../server/lib/class/NamedClass';

export class AttributableClass extends NamedClass
{
  /*
  // This is a hack allowing descendants of AttributableClass to recursively
  // search for static properties of their ancestors.
  protected getThis() { return this; }
  */

  // Returns object containing static attributes for a given class property.
  protected getPropertyAttributes(property: string)
  {
    // This trick dynamically accesses static class property without
    // the need to use something like NamedClass.property;
    // (it's the same as if you could write (typeof(istance)).property).
    return this.constructor[property];
  }

  /*
  // Returns object containing static attributes for a given class property.
  protected getPropertyAttributes(instance: any, property: string)
  {
    // This trick dynamically accesses static class property without
    // the need to use something like NamedClass.property;
    // (it's the same as if you could write (typeof(istance)).property)
    if (instance.constructor[property] !== undefined)
      return instance.constructor[property];

    // If our static property is not found on instance, it can still
    // exist on some of it's ancestors.
    if
    (
      instance !== undefined
      && instance !== null
      && instance.getPropertyAttributes !== undefined
      && super.getThis() !== null
    )
    {
      // We need to pass super.getThis() as a parameter, because our ancestor's
      // method would see our static properties on this.constructor[property]
      // otherwise.
      return instance.getPropertyAttributes(super.getThis(), property);
    }
    else
    {
      return undefined;
    }
  }
  */
}
