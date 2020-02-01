/*
  Part of BrutusNext

  Augments javascript Number type with utility functions
*/

/*
  Note:
    To use this module, you need to force typescript to execute
    it's code. It means importing it like this:

      import "../../Shared/Utils/Number";
*/

import { Syslog } from "../../Shared/Log/Syslog";

// We are augmenting global namespace.
declare global
{
  export interface Number
  {
    isValid(): boolean,

    // ! Throws exception on error.
    validate(): number,

    // Clamps number to given interval.
    clampTo(minimum: number, maximum: number): number,

    atLeast(minimum: number): number,

    atMost(maximum: number): number,

    // ! Throws exception on error.
    // Throws an exception if number isn't in given interval.
    validateToInterval(minimum: number, maximum: number): void,

    // ! Throws exception on error.
    // Throws an exception if number is lesser than given minimum.
    validateToAtLeast(minimum: number): void,

    // ! Throws exception on error.
    // Throws an exception if number is greater than given maximum.
    validateToAtMost(maximum: number): void,

    // Clamps number to given interval and logs ERROR if it didn't fit.
    forceToInterval(minimum: number, maximum: number): number,

    // Clamps number to given given minimum and logs ERROR if it were lesser.
    forceToAtLeast(minimum: number): void,

    // Clamps number to given givenn maximum and logs ERROR if it were greater.
    forceToAtMost(maximum: number): void
  }
}

// Arrow functions can't be used to extend Number prototype
// because they capture global 'this' instead of the Number
// that we are extending. So we need to disable respective
// eslint rule.
/* eslint-disable @typescript-eslint/unbound-method */

Number.prototype.isValid = function isValid(): boolean
{
  return this.valueOf() !== null && this.valueOf() !== undefined
    && !Number.isNaN(this.valueOf()) && Number.isFinite(this.valueOf());
};

// ! Throws exception on error.
Number.prototype.validate = function validate(): number
{
  if (!this.isValid())
    throw Error(`Invalid number: ${this.valueOf()}`);

  return this.valueOf();
};

Number.prototype.clampTo = function clampTo
(
  minimum: number,
  maximum: number
)
: number
{
  if (this < minimum)
    return minimum;

  if (this > maximum)
    return maximum;

  return this.valueOf();
};

Number.prototype.atLeast = function atLeast(minimum: number): number
{
  if (this < minimum)
    return minimum;

  return this.valueOf();
};

Number.prototype.atMost = function atMost(maximum: number): number
{
  if (this > maximum)
    return maximum;

  return this.valueOf();
};

// ! Throws exception on error.
Number.prototype.validateToInterval = function validateToInterval
(
  minimum: number,
  maximum: number
)
: void
{
  if (this < minimum || this > maximum)
  {
    throw Error(`Value '${this.valueOf()}' is not in`
      + ` allowed interval <${minimum}, ${maximum}>`);
  }
};

// ! Throws exception on error.
Number.prototype.validateToAtLeast = function validateToAtLeast
(
  minimum: number
)
: void
{
  if (this < minimum)
  {
    throw Error(`Value '${this.valueOf()}' is lesser`
      + ` than allowed minimum '${minimum}'`);
  }
};

// ! Throws exception on error.
Number.prototype.validateToAtMost = function validateToAtMost
(
  maximum: number
)
: void
{
  if (this > maximum)
  {
    throw Error(`Value '${this.valueOf()}' is greater`
      + ` than allowed maximum '${maximum}'`);
  }
};

// ! Throws exception on error.
Number.prototype.forceToInterval = function forceToInterval
(
  minimum: number,
  maximum: number
)
: number
{
  const forcedValue = this.clampTo(minimum, maximum);

  if (this !== forcedValue)
  {
    Syslog.logError(`Value '${this.valueOf()}' is not in allowed interval`
      + ` <${minimum}, ${maximum}>. Changing it to '${forcedValue}'`);

    return forcedValue;
  }

  return this.valueOf();
};

// ! Throws exception on error.
Number.prototype.forceToAtLeast = function forceToAtLeast
(
  minimum: number
)
: number
{
  if (this < minimum)
  {
    Syslog.logError(`Value '${this.valueOf()}' is lesser than allowed`
      + ` minimum '${minimum}'. Changing it to '${minimum}'`);

    return minimum;
  }

  return this.valueOf();
};

// ! Throws exception on error.
Number.prototype.forceToAtMost = function forceToAtMost
(
  maximum: number
)
: number
{
  if (this > maximum)
  {
    Syslog.logError(`Value '${this.valueOf()}' is greater than allowed`
      + ` maximum ${maximum}'. Changing it to '${maximum}'`);

    return maximum;
  }

  return this.valueOf();
};

// Ensure this file is treated as a module.
export {};