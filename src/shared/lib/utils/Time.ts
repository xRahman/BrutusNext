/*
  Part of BrutusNEXT

  Class encapsulating javascript Date() object.
*/

/*
  The reason we don't use Date() directly is that id
  doesn't work with prototypal inheritance implemented
  using Object.create(). When a Date() method is called
  on {} created by Object.create(), an exception is
  thrown saying that a Date() must only be called on
  Date() object (which {} is not even though it has
  a Date() object as it's prototype object.

  So instead Date() we use a Time() object, which internally
  stores time as a number and uses Date() methods to work
  with it. Property of type number works fine with prototype
  inheritance.
*/

/*
  If you need some Date() method which is not here, feel free
  to add it to Time class.
*/

'use strict';

export class Time
{
  constructor(param: any = null)
  {
    let date;

    // Whatever parameter we get, we use to construct
    // a Date() object with it.
    if (param === null)
      date = new Date();
    else
     date = new Date(param);

    // And read the number of miliseconds from it.
    this.time = date.getTime();
  }

  // Number of milliseconds since January 1, 1970, 00:00:00 UTC
  // (negative for prior times).
  private time: number = 0;

  // ---------------- Public methods --------------------

  /// TODO: Buď to celé hodit za Proxy, nebo tu ručně vyjmenovat
  /// používané metody (viz toJSON()).

  public toJSON()
  {
    return new Date(this.time).toJSON();
  }

  public toLocaleString()
  {
    return new Date(this.time).toLocaleString();
  }
}
