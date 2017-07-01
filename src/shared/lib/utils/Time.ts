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

import {Serializable} from '../../../shared/lib/class/Serializable';

export class Time extends Serializable
{
  // Same parameters as for Date() can be used.
  constructor(param: any = null)
  {
    super();

    this.version = 0;

    let date;

    // Whatever parameter we get, we use it to construct
    // a Date() object.
    if (param === null)
      date = new Date();
    else
     date = new Date(param);

    // And read the number of miliseconds from it.
    this.time = date.getTime();
  }

  public static get UNKNOWN_TIME_STRING() { return '<unknown time>'; }

  // Number of milliseconds since January 1, 1970, 00:00:00 UTC
  // (negative for prior times).
  private time: number = 0;

  // ---------------- Public methods --------------------

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
