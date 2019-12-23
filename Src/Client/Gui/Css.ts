/*
  Part of Kosmud

  Helper class used to extend Ccs definitions.
*/

/*
  Usage example:

    protected static readonly css = new Css
    (
      {
        width: "20%",
        height: "15%"
      }
    ).extends(Component.css);

  Notes:
    Class 'Css' is only used to construct the prototype chain,
    resulting value is a plain object with specified prototype
    object.
*/

export class Css
{
  constructor(private readonly css: Partial<CSSStyleDeclaration>) {}

  public extends
  (
    css: Partial<CSSStyleDeclaration>
  )
  : Partial<CSSStyleDeclaration>
  {
    Object.setPrototypeOf(this.css, css);

    return this.css;
  }
}