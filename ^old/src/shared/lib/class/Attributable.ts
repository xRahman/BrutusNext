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
      protected static counter: PropertyAttributes =
      {
        saved: false
      };
  }
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {Nameable} from '../../../shared/lib/class/Nameable';
import {Attributes} from '../../../shared/lib/class/Attributes';

///export class Attributable extends Nameable
export class Attributable
{
  // Default values of property attributes
  // (this is are inherited by descendants and can be overriden).
  protected static defaultAttributes: Attributes =
  {
    saved: true,
    edited: true,
    sentToClient: true,
    sentToServer: true
  };

  // ---------------- Public methods --------------------

  // In Javascript, 'name' of the constructor is the class name.
  public getClassName() { return this.constructor.name; }

  // -------------- Protected methods -------------------

  // -> Returns object containing static attributes for a given class property,
  //    Returns 'undefined' if 'property' doesn't have static attributes.
  // (Note that 'defaultAttributes' declare in the same class as the property
  //  are taken in effect, not possible override in a descendant class.)
  protected getAttributes(propertyName: string): Attributes
  {
    // Traverse prototype tree to find 'thi's on which
    // property 'propertyName' is 'own' property.
    ///let propertyThis = this.getPropertyThis(propertyName);
    let attributes: Attributes;
    // Use default attributes declared at the same object as property.
    ///let defaultAttributes = propertyThis.constructor['defaultAttributes'];
    let defaultAttributes = (this.constructor as any)['defaultAttributes'];
    // These are attributes declared as a static property with the same
    // name as non-static property.
    let propertyAttributes = (this.constructor as any)[propertyName];

    // This trick will 'copy' all properties from 'propertyAttributes'
    // to a new object by creating a new {} and setting 'propertyAttributes'
    // as it's prototype object.
    if (propertyAttributes)
      attributes = Object.create(propertyAttributes);
    else
      attributes = {};

    // Add default value for attributes that don't exist in
    // 'propertyAttributes'.
    for (let attribute in defaultAttributes)
    {
      if (!propertyAttributes || propertyAttributes[attribute] === undefined)
        (attributes as any)[attribute] = defaultAttributes[attribute];
    }

    // Do one more defaulting - against 'defaltAttributes' declared
    // here in Attributable class. This way 'defaultAttributes' on
    // descendatns don't have to list all existing attributes.
    for (let attribute in Attributable.defaultAttributes)
    {
      if (!attributes || (attributes as any)[attribute] === undefined)
      {
        (attributes as any)[attribute] =
          (Attributable.defaultAttributes as any)[attribute];
      }
    }

    return attributes;
  }

  // --------------- Private methods --------------------

  /// Deprecated - the check is not really needed.
  // private getPropertyAttributes(propertyName: string): Attributes
  // {
  //   // This trick dynamically accesses static class property without
  //   // the need to use something like NamedClass.property;
  //   // (it's the same as if you could write (typeof(istance)).property).
  //   let attributes = this.constructor[propertyName];

  //   if (attributes === null)
  //   {
  //     // 'this.constructor.name' is the name of the class.
  //     ERROR("'null' static property atributes for property"
  //       + " '" + propertyName + "'. Make sure that 'static"
  //       + " " + propertyName + "' declared in class"
  //       + " " + this.constructor.name + " (or in some of it's ancestors)"
  //       + " is not null");
  //     return undefined;
  //   }

  //   return attributes;
  // }

  /// This won't help because when a property is written
  /// on the instance, it becomes it's 'own' property and
  /// there is no way to find you where it's actually decalred.
  // // Traverses prototype tree to find 'this' on which
  // // property 'propertyName' is 'own' property.
  // private getPropertyThis(propertyName)
  // {
  //   if (this.hasOwnProperty(propertyName))
  //     return this;

  //   let prototype = Object.getPrototypeOf(this);

  //   if (prototype && prototype['getPropertyThis'])
  //   {
  //     let prototypeThis = prototype.getPropertyThis();

  //     if (prototypeThis)
  //       return prototypeThis;
  //   }

  //   ERROR("Failed to find 'this' for property"
  //     + " '" + propertyName + "'");

  //   return this;
  // }
}
