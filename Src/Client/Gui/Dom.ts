/*
  Part of BrutusNEXT

  Functions manipulating DOM elements
*/

import { Syslog } from "../../Shared/Log/Syslog";

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
        Syslog.reportMissingCase(insertMode);
        break;
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
        Syslog.reportMissingCase(insertMode);
        break;
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
    element.setAttribute("x", `${String(xPercent)}%`);
  }

  export function setRelativeY(element: Element, yPercent: number): void
  {
    element.setAttribute("y", `${String(yPercent)}%`);
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

  export function scale(element: Element, scaleFactor: number): void
  {
    setTransform(element, `scale(${scaleFactor})`);
  }

  export function translate
  (
    element: Element,
    xPixels: number,
    yPixels: number
  )
  : void
  {
    setTransform(element, `translate(${xPixels}, ${yPixels})`);
  }

  export function isLeftButtonDown(event: MouseEvent): boolean
  {
    return event.buttons === 1;
  }

  export function isRightButtonDown(event: MouseEvent): boolean
  {
    return event.buttons === 2;
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

  export function createSvg(): SVGSVGElement
  {
    return document.createElementNS(SVG_NAMESPACE, "svg");
  }

  export function createImage(): SVGImageElement
  {
    return document.createElementNS(SVG_NAMESPACE, "image");
  }
}

// ----------------- Auxiliary Functions ---------------------

function setTransform(element: Element, transform: string): void
{
  element.setAttribute("transform", transform);
}