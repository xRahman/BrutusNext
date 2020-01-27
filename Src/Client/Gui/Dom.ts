/*
  Part of BrutusNEXT

  Functions manipulating DOM elements
*/

import { Syslog } from "../../Shared/Log/Syslog";
import { StringUtils } from "../../Shared/Utils/StringUtils";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const SVG_XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

export namespace Dom
{
  export type Element = HTMLElement | SVGElement;

  export type InsertMode =
    | "APPEND"    // Insert as the last child.
    | "PREPEND"   // Insert as the first child.
    | "REPLACE";  // Html contents of parent element is cleared first.

  export function addCssClass(element: Element, cssClassName: string): void
  {
    element.classList.add(cssClassName);
  }

  export function setName(element: Element, name: string): void
  {
    element.setAttribute("name", name);
  }

  export function getName(element: Element): string
  {
    const name = element.getAttribute("name");

    if (name === null)
      return "";

    return name;
  }

  export function hide(element: Element): void
  {
    element.style.display = "none";
  }

  export function isHidden(element: Element): boolean
  {
    return element.style.display === "none";
  }

  export function removeFromParent(element: Element): void
  {
    element.parentNode?.removeChild(element);
  }

  export function setId(element: Element, id: string): void
  {
    element.id = id;
  }

  export function setCss
  (
    element: Element,
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

  export function setHref(element: Element, path: string): void
  {
    element.setAttributeNS(SVG_XLINK_NAMESPACE, "href", path);
  }

  export function removeAllChildren(element: Element): void
  {
    while (element.lastChild !== null)
    {
      element.removeChild(element.lastChild);
    }
  }

  export function insertHtml
  (
    element: Element,
    html: string,
    insertMode: InsertMode = "APPEND"
  )
  : void
  {
    switch (insertMode)
    {
      case "APPEND":
        element.insertAdjacentHTML("beforeend", html);
        break;

      case "PREPEND":
        element.insertAdjacentHTML("afterbegin", html);
        break;

      case "REPLACE":
        removeAllChildren(element);
        element.insertAdjacentHTML("afterbegin", html);
        break;

      default:
        throw Syslog.reportMissingCase(insertMode);
    }
  }

  export function insertElement
  (
    element: Element,
    child: Element,
    insertMode: InsertMode
  )
  : void
  {
    switch (insertMode)
    {
      case "APPEND":
        element.appendChild(child);
        break;

      case "PREPEND":
        element.insertBefore(child, element.firstChild);
        break;

      case "REPLACE":
        removeAllChildren(element);
        element.appendChild(child);
        break;

      default:
        throw Syslog.reportMissingCase(insertMode);
    }
  }

  export function enableMouseEvents(element: Element): void
  {
    setCss(element, { pointerEvents: "auto" });
  }

  export function disableMouseEvents(element: Element): void
  {
    setCss(element, { pointerEvents: "none" });
  }

  export function getDisplayMode(element: Element): string
  {
    return element.style.display;
  }

  export function setDisplayMode(element: Element, displayMode: string): void
  {
    element.style.display = displayMode;
  }

  export function setWidth(element: Element, widthPixels: number): void
  {
    element.setAttribute("width", String(widthPixels));
  }

  export function setHeight(element: Element, heightPixels: number): void
  {
    element.setAttribute("height", String(heightPixels));
  }

  export function setSize
  (
    element: Element,
    widthPixels: number,
    heightPixels: number
  )
  : void
  {
    setWidth(element, widthPixels);
    setHeight(element, heightPixels);
  }

  export function setX(element: Element, xPixels: number): void
  {
    element.setAttribute("x", String(xPixels));
  }

  export function setY(element: Element, yPixels: number): void
  {
    element.setAttribute("y", String(yPixels));
  }

  export function setPosition
  (
    element: Element,
    xPixels: number,
    yPixels: number
  )
  : void
  {
    setX(element, xPixels);
    setY(element, yPixels);
  }

  export function setRelativeX(element: Element, xPercent: number): void
  {
    element.setAttribute("x", `${xPercent}%`);
  }

  export function setRelativeY(element: Element, yPercent: number): void
  {
    element.setAttribute("y", `${yPercent}%`);
  }

  export function setRelativePosition
  (
    element: Element,
    xPercent: number,
    yPercent: number
  )
  : void
  {
    setRelativeX(element, xPercent);
    setRelativeY(element, yPercent);
  }

  // ! Throws exception on error.
  export function scale(element: Element, scaleFactor: number): void
  {
    const existingTranslate = getExistingTranslate(element);

    const transform: Transform = { scale: `${scaleFactor}` };

    if (existingTranslate)
      transform.translate = existingTranslate;

    setTransform(element, transform);
  }

  export function translate
  (
    element: Element,
    xPixels: number,
    yPixels: number
  )
  : void
  {
    const existingScale = getExistingScale(element);

    const transform: Transform = { translate: `${xPixels}, ${yPixels}` };

    if (existingScale)
      transform.scale = existingScale;

    setTransform(element, transform);
  }

  export function isLeftButtonDown(event: MouseEvent): boolean
  {
    return event.buttons === 1;
  }

  export function isRightButtonDown(event: MouseEvent): boolean
  {
    return event.buttons === 2;
  }

  export function remToPixels(rem: number): number
  {
    const fontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize);

    return rem * fontSize;
  }

  export function createSpan(): HTMLSpanElement
  {
    return document.createElement("span");
  }

  export function createDiv(): HTMLDivElement
  {
    return document.createElement("div");
  }

  export function createCircle(): SVGCircleElement
  {
    return document.createElementNS(SVG_NAMESPACE, "circle");
  }

  export function createG(): SVGGElement
  {
    return document.createElementNS(SVG_NAMESPACE, "g");
  }

  export function createLine(): SVGLineElement
  {
    return document.createElementNS(SVG_NAMESPACE, "line");
  }

  export function createPath(): SVGPathElement
  {
    return document.createElementNS(SVG_NAMESPACE, "path");
  }

  export function createSvg(): SVGSVGElement
  {
    return document.createElementNS(SVG_NAMESPACE, "svg");
  }

  export function createImage(): SVGImageElement
  {
    return document.createElementNS(SVG_NAMESPACE, "image");
  }

  export function createDefs(): SVGDefsElement
  {
    return document.createElementNS(SVG_NAMESPACE, "defs");
  }

  export function createMarker(): SVGMarkerElement
  {
    return document.createElementNS(SVG_NAMESPACE, "marker");
  }
}

// ----------------- Auxiliary Functions ---------------------

type Transform =
{
  scale?: string,
  translate?: string,
  rotate?: string,
  skewX?: string,
  skewY?: string
};

function addTransform
(
  param: { transformString: string, spaceIsNeeded: boolean },
  transform: string,
  value?: string
)
: void
{
  if (value === undefined)
    return;

  param.transformString += `${transform}(${value})`;
  param.spaceIsNeeded = true;
}

function addSpaceIfNeeded
(
  param: { transformString: string, spaceIsNeeded: boolean }
)
: void
{
  if (param.spaceIsNeeded)
  {
    param.transformString += " ";
    param.spaceIsNeeded = false;
  }
}

function setTransform
(
  element: Dom.Element,
  transform: Transform
)
: void
{
  const param =
  {
    transformString: "",
    spaceIsNeeded: false
  };

  // Note: Order of transformations matters.

  addTransform(param, "scale", transform.scale);
  addSpaceIfNeeded(param);
  addTransform(param, "translate", transform.translate);
  addSpaceIfNeeded(param);
  addTransform(param, "rotate", transform.rotate);
  addSpaceIfNeeded(param);
  addTransform(param, "skewX", transform.skewX);
  addSpaceIfNeeded(param);
  addTransform(param, "skewY", transform.skewY);

  if (param.transformString === "")
    element.removeAttribute("transform");
  else
    element.setAttribute("transform", param.transformString);
}

function getAttribute(element: Dom.Element, name: string): string
{
  const attribute = element.getAttribute(name);

  if (attribute === null)
    return "";

  return attribute;
}

function getExistingTranslate(element: Dom.Element): string
{
  const attribute = getAttribute(element, "translate");

  if (!attribute.includes("translate"))
    return "";

  const transform = { translate: "" };

  // ! Throws exception on error.
  StringUtils.scan
  (
    attribute,
    "&{*}translate(&{translate})&{*}",
    transform
  );

  return transform.translate;
}

function getExistingScale(element: Dom.Element): string
{
  const attribute = getAttribute(element, "scale");

  if (!attribute.includes("scale"))
    return "";

  const transform = { scale: "" };

  // ! Throws exception on error.
  StringUtils.scan
  (
    attribute,
    "&{*}scale(&{scale})&{*}",
    transform
  );

  return transform.scale;
}