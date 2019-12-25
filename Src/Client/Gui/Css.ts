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

// Style with this 'id' must be defined in index.html
// (for example <style id="runtime_stylesheet"></style>)
const RUNTIME_STYLE_ID = "runtime_style";

export namespace Css
{
  export type Class =
  {
    name: string,
    css: Partial<CSSStyleDeclaration>,
    ":active"?: Partial<CSSStyleDeclaration>,
    "::after"?: Partial<CSSStyleDeclaration>,
    "::before"?: Partial<CSSStyleDeclaration>,
    ":checked"?: Partial<CSSStyleDeclaration>,
    ":default"?: Partial<CSSStyleDeclaration>,
    ":disabled"?: Partial<CSSStyleDeclaration>,
    ":empty"?: Partial<CSSStyleDeclaration>,
    ":enabled"?: Partial<CSSStyleDeclaration>,
    ":first-child"?: Partial<CSSStyleDeclaration>,
    "::first-letter"?: Partial<CSSStyleDeclaration>,
    "::first-line"?: Partial<CSSStyleDeclaration>,
    ":first-of-type"?: Partial<CSSStyleDeclaration>,
    ":focus"?: Partial<CSSStyleDeclaration>,
    ":hover"?: Partial<CSSStyleDeclaration>,
    ":in-range"?: Partial<CSSStyleDeclaration>,
    ":indeterminate"?: Partial<CSSStyleDeclaration>,
    ":invalid"?: Partial<CSSStyleDeclaration>,
    ":last-child"?: Partial<CSSStyleDeclaration>,
    ":last-of-type"?: Partial<CSSStyleDeclaration>,
    ":link"?: Partial<CSSStyleDeclaration>,
    ":only-of-type"?: Partial<CSSStyleDeclaration>,
    ":only-child"?: Partial<CSSStyleDeclaration>,
    ":optional"?: Partial<CSSStyleDeclaration>,
    ":out-of-range"?: Partial<CSSStyleDeclaration>,
    "::placeholder"?: Partial<CSSStyleDeclaration>,
    ":read-only"?: Partial<CSSStyleDeclaration>,
    ":read-write"?: Partial<CSSStyleDeclaration>,
    ":required"?: Partial<CSSStyleDeclaration>,
    ":root"?: Partial<CSSStyleDeclaration>,
    "::selection"?: Partial<CSSStyleDeclaration>,
    ":target"?: Partial<CSSStyleDeclaration>,
    ":valid"?: Partial<CSSStyleDeclaration>,
    ":visited"?: Partial<CSSStyleDeclaration>,

    [key: string]: Partial<CSSStyleDeclaration> | undefined
  };

  export function createClass(cssClass: Class): Class
  {
    for (const property in cssClass)
    {
      if (property === "className")
        continue;

      if (property === "css")
        addClass(cssClass.name, "", cssClass.css);
      else
        // Any othe property specifies a selector (like :hover).
        addClass(cssClass.name, property, cssClass[property]);
    }

    return cssClass;
  }
}

// ----------------- Auxiliary Functions ---------------------

// Converts javascript-style property name like 'backgroundColor'
// to css style ('background-color').
function convertToCssPropertyStyle(property: string): string
{
  return property.replace(/(?<capital_letter>[A-Z])/ug, "-$1").toLowerCase();
}

function addClass
(
  className: string,
  selector: string,
  styleDeclaration?: Partial<CSSStyleDeclaration>
)
: void
{
  if (styleDeclaration === undefined)
    return;

  let commands = "";

  for (const property in styleDeclaration)
  {
    if (!styleDeclaration.hasOwnProperty(property))
      continue;

    const command = convertToCssPropertyStyle(property);

    commands += `${command}: ${String(styleDeclaration[property])};`;
  }

  addToStylesheet(RUNTIME_STYLE_ID, className, selector, commands);
}

// ! Throws exception on error.
function addToStylesheet
(
  styleId: string,
  className: string,
  selector: string,
  commands: string
)
: void
{
  const rule = `.${className}${selector} {${commands}}`;
  const style = document.getElementById(styleId);

  if (!style)
  {
    throw Error(`Failed to add css class ${className} to stylesheet`
      + ` because style '${styleId}' doesn't exist in html document`);
  }

  const stylesheet = (style as HTMLStyleElement).sheet as CSSStyleSheet;

  if (stylesheet === undefined)
  {
    throw Error(`Failed to add css class ${className} to stylesheet`
      + ` because style '${styleId}' doesn't have a stylesheet`);
  }

  if (stylesheet.insertRule === undefined)
  {
    throw Error(`Failed to add css class ${className} to stylesheet`
      + ` because style '${styleId}' doesn't have 'insertRule() method`);
  }

  stylesheet.insertRule(rule, stylesheet.cssRules.length);
}

// export class Css
// {
//   constructor(private readonly css: Partial<CSSStyleDeclaration>) {}

//   public extends
//   (
//     css: Partial<CSSStyleDeclaration>
//   )
//   : Partial<CSSStyleDeclaration>
//   {
//     Object.setPrototypeOf(this.css, css);

//     return this.css;
//   }
// }