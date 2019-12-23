/*
  Part of Kosmud

  Helper class used to extend Ccs definitions.
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