/*
  Part of BrutusNEXT

  Class replacing javascript Date() object.
*/

/*
  The reason we don't use Date() directly is that id
  doesn't work with prototypal inheritance implemented
  using Object.create(). When a Date() method is called
  on {} created by Object.create(), an exception is
  thrown saying that a Date() must only be called on
  Date() object (which {} is not even though it has
  a Date() object as it's prototype object.

  So instead of Date() we use a Time() object, which internally
  stores time as a number and uses Date() methods to work
  with it. Property of type number works fine with prototype
  inheritance.
*/

/*
  If you need some Date() method which is not here, feel free
  to add it to Time class.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {JsonObject} from '../../../shared/lib/json/JsonObject';

export class Time extends Serializable
{
  // Same parameters as for Date() can be used.
  constructor(param?: any)
  {
    super();

    this.version = 0;

    let date: Date;

    // Whatever parameter we get, we use it to construct
    // a Date() object.
    if (param)
      date = new Date(param);
    else
      date = new Date();
      

    // And read the number of miliseconds from it.
    this.time = date.getTime();
  }

  private static get TIME_PROPERTY() { return 'time'; }

  public static get UNKNOWN_TIME_STRING() { return '<unknown time>'; }

  // Number of milliseconds since January 1, 1970, 00:00:00 UTC
  // (negative for prior times).
  private time: number = 0;

  // ---------------- Public methods --------------------

  // ~ Overrides Serializable.customSerializeProperty().
  // -> Returns 'undefined' if property is not customly serialized.
  protected customSerializeProperty(propertyName: string)
  {
    if (propertyName === Time.TIME_PROPERTY)
    {
      // Serialize to string instead of number to increase json
      // readability.
      return new Date(this.time).toJSON();
    }

    return undefined;
  }

  // ~ Overrides Serializable.customDeserializeProperty().
  // -> Returns 'undefined' if property is not customly deserialized.
  protected customDeserializeProperty
  (
    propertyName: string,
    sourceProperty: any
  )
  {
    if (propertyName === Time.TIME_PROPERTY)
    {
      // Use Date() constructor to convert serialized string value
      // to Date() object and getTime() method to convert it to
      // number of miliseconds.
      this.time = new Date(sourceProperty).getTime();
    }

    return undefined;
  }

  /*
  // ~ Overrides Serializable.serialize().
  //   (Serializes internal 'time' variable as string for
  //    better readability of resulting json.)
  protected saveToJsonObject(mode: Serializable.Mode): Object
  {
    console.log('Time.saveToJsonObject()');

    let jsonObject =
    {
      className: this.getClassName(),
      version: this.version,
      time: new Date(this.time).toJSON()
    };

    return jsonObject;
  }

  // ~ Overrides Serializable.deserialize().
  public deserialize(jsonObject: Object, path: string = null)
  {
    if (!jsonObject)
      return null;

    let time = jsonObject[Time.TIME_PROPERTY];

    if (time === undefined)
      return null;

    // Use Date() constructor to convert serialized string value
    // to Date() object and getTime() method to convert it to
    // number of miliseconds.
    this.time = new Date(time).getTime();

    return this;
  }
  */

  public getTime()
  {
    return this.time;
  }

  public toJSON()
  {
    return new Date(this.time).toJSON();
  }

  public toLocaleString()
  {
    return new Date(this.time).toLocaleString();
  }
}

Classes.registerSerializableClass(Time);