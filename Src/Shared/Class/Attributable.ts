/*
  Part of BrutusNext

  Enables static attributes of class methods and variables.
*/

/*
  Static property attributes are created by declaring static property of
  the same name and assigning an 'Attributes' object to it.

  You can also use static property 'defaultAttributes' property to set
  defaults for the whole class.

  Example:

  class MyClass
  {
    // A variable we want to set attributes for.
    protected counter = 0;
    // Static attributes of variable 'counter'.
    protected static counter: Attributes =
    {
      saved: false
    };
  }
*/

import { applyDefaults } from "../../Shared/Utils/ObjectUtils";
import { Attributes } from "../../Shared/Class/Attributes";
import { Types } from "../../Shared/Utils/Types";

const DEFAULT_ATTRIBUTES = "defaultAttributes";

export class Attributable
{
  // This can be redefined so the new defaults apply to whole
  // subclass.
  protected static defaultAttributes: Attributes =
  {
    saved: true,
    edited: true,
    sentToClient: true,
    sentToServer: true
  };

  // --------------- Public methods ---------------------

  // In Javascript, name of the constructor is the class name.
  public get className(): string { return this.constructor.name; }

  // -------------- Protected methods -------------------

  // (Note that 'defaultAttributes' declared in the same class as the property
  //  are taken in effect, not possible override in a descendant class.)
  protected propertyAttributes(propertyName: string): Attributes
  {
    const attributes: Attributes = {};

    // Any property of Attributable class can have specific attributes.
    // They are declared as a static class property with the same name.
    this.applyPropertyDefaults(attributes, propertyName);
    // If an Attributable class has a static property 'defaultValues', it
    // will serve as default values of attributes of all class properties.
    this.applyClassDefaults(attributes);
    // If neither property attribute nor class attribute is set, value
    // from Attributable.defaultAttributes will be used.
    this.applyGlobalDefaults(attributes);

    return attributes;
  }

  // ---------------- Private methods -------------------

  private applyPropertyDefaults
  (
    attributes: object,
    propertyName: string
  )
  : void
  {
    const propertyAttributes = (this.constructor as any)[propertyName];

    if (propertyAttributes === undefined)
      return;

    if (!Types.isPlainObject(propertyAttributes))
    {
      throw Error(`Static propety ${propertyName} in class`
        + ` ${this.className} is not a plain object`);
    }

    applyDefaults(attributes, propertyAttributes);
  }

  // ! Throws exception on error.
  private applyClassDefaults(attributes: object): object
  {
    const classDefaults = (this.constructor as any)[DEFAULT_ATTRIBUTES];

    if (classDefaults === undefined)
      return attributes;

    if (!Types.isPlainObject(classDefaults))
    {
      throw Error(`Static propety ${DEFAULT_ATTRIBUTES} in`
        + ` class ${this.className} is not a plain object'`);
    }

    applyDefaults(attributes, classDefaults);

    return attributes;
  }

  private applyGlobalDefaults(attributes: object): void
  {
    applyDefaults(attributes, Attributable.defaultAttributes);
  }
}