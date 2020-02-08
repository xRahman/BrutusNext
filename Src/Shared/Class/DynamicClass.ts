/*
  Part of BrutusNext

  Class with dynamic typecast
*/

import { Types } from "../../Shared/Utils/Types";

export class DynamicClass
{
  // ---------------- Public methods --------------------

  // In Javascript, name of the constructor is the class name.
  public get className(): string { return this.constructor.name; }

  // ! Throws exception on error.
  public dynamicCast<T>(Class: Types.AnyClass<T>): T
  {
    if (!(this instanceof Class))
    {
      throw Error (`Type cast error: ${this.debugId} is not`
        + ` an instance of class (${Class.name})`);
    }

    return (this as unknown) as T;
  }

  // -> Returns string describing this object for error logging.
  public get debugId(): string
  {
    return `{ class: ${this.className} }`;
  }
}