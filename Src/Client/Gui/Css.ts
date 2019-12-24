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
  // ! Throws exception on error.
  public static addCommandToStylesheet
  (
    styleId: string,
    selector: string,
    command: string
  )
  : void
  {
    const rule = `${selector} {${command}}`;
    const style = document.getElementById(styleId);

    if (!style)
    {
      throw Error(`Failed to add rule ${rule} to stylesheet because`
        + ` style with id '${styleId}' doesn't exist in html document`);
    }

    const stylesheet = (style as HTMLStyleElement).sheet as CSSStyleSheet;

    if (stylesheet === undefined)
    {
      throw Error(`Failed to add rule ${rule} to stylesheet because`
        + ` style with id '${styleId}' doesn't have a stylesheet`);
    }

    // if (stylesheet.addRule !== undefined)
    // {
    //   stylesheet.addRule(selector, rule);
    //   // TEST
    //   console.log(stylesheet);
    //   return;
    // }

    if (stylesheet.insertRule !== undefined)
    {
      stylesheet.insertRule(rule, stylesheet.cssRules.length);
      // TEST
      console.log(stylesheet);
      return;
    }

    throw Error(`Failed to add rule ${rule} to stylesheet because`
    + ` style with id '${styleId}' has neither 'insertRule()`
    + ` nor 'addRule() method`);
  }

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