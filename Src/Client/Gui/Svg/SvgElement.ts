/*
  Part of BrutusNEXT

   Functions working with SVG elements
*/

export namespace SvgElement
{
  export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

  export type Type =
    | "svg"
    | "g"
    | "image"
    | "circle"
    | "line";

  export function create(elementType: Type): SVGElement
  {
    return document.createElementNS(SVG_NAMESPACE, elementType);
  }

  export function scale(element: SVGElement, scale: number): void
  {
    transform(element, `scale(${scale})`);
  }

  export function translate
  (
    element: SVGElement,
    xPixels: number,
    yPixels: number
  )
  : void
  {
   transform(element, `translate(${xPixels}, ${yPixels})`);
  }

  export function setName(element: SVGElement, name: string): void
  {
    element.setAttribute("name", name);
  }

  export function setId(element: SVGElement, id: string): void
  {
    element.id = id;
  }

  export function setWidthAndHeight
  (
    element: SVGElement,
    widthPixels: number,
    heightPixels: number
  )
  : void
  {
    element.setAttribute("width", String(widthPixels));
    element.setAttribute("height", String(heightPixels));
  }

  export function setcss
  (
    element: SVGElement,
    css: Partial<CSSStyleDeclaration>
  )
  : void
  {
    for (const property in css)
    {
      if (!css.hasOwnProperty(property))
        continue;

      const value = css[property];

      if (value !== undefined)
        element.style[property] = value;
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

function transform(element: SVGElement, transform: string): void
{
  element.setAttribute("transform", transform);
}