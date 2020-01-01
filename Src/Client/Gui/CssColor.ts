/*
  Part of BrutusNEXT

  Class wrapping a RGBA color used in CSS definitions
*/

export class CssColor
{
  constructor
  (
    private readonly r: number,
    private readonly g: number,
    private readonly b: number,
    private readonly a = 1
  )
  {
    // ! Throws exception on error.
    validateColor("r", r, { min: 0, max: 255 });

    // ! Throws exception on error.
    validateColor("g", g, { min: 0, max: 255 });

    // ! Throws exception on error.
    validateColor("b", b, { min: 0, max: 255 });

    // ! Throws exception on error.
    checkInterval("a", a, { min: 0, max: 1 });
  }

  public toString(): string
  {
    if (this.a === 1)
      return `rgb(${this.r}, ${this.g}, ${this.b})`;

    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function validateColor
(
  property: string,
  value: number,
  { min, max }: { min: number, max: number }
)
: void
{
  // ! Throws exception on error.
  mustBeWholeNumber(property, value);

  // ! Throws exception on error.
  checkInterval(property, value, { min, max });
}

// ! Throws exception on error.
function mustBeWholeNumber(property: string, value: number): void
{
  if (!Number.isInteger(value))
    throw Error(`Property '${property}' must be a whole`
    + ` number but it's value is ${value}`);
}

// ! Throws exception on error.
function checkInterval
(
  property: string,
  value: number,
  { min, max }: { min: number, max: number }
)
: void
{
  if (value < min || value > max)
  {
    throw Error(`Property '${property}' must be in interval`
      + ` <${min}, ${max}> but it's value is ${value}`);
  }
}