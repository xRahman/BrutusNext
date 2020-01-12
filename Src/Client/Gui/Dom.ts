/*
  Part of BrutusNEXT

  Functions manipulating with DOM elements.
*/

import { Syslog } from "../../Shared/Log/Syslog";

export namespace Dom
{
  export type Element = HTMLElement | SVGElement;

  export enum InsertMode
  {
    // Insert as the last child.
    APPEND,
    // Insert as the first child.
    PREPEND,
    // Html contents of parent element is cleared first.
    REPLACE,
    DO_NOT_INSERT
  }

  export function addCssClass(element: Element, cssClassName: string): void
  {
    element.classList.add(cssClassName);
  }

  export function setName(element: Element, name: string): void
  {
    element.setAttribute("name", name);
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
  ): void
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
    insertMode = InsertMode.APPEND
  )
  : void
  {
    switch (insertMode)
    {
      case InsertMode.APPEND:
        element.insertAdjacentHTML("beforeend", html);
        break;

      case InsertMode.PREPEND:
        element.insertAdjacentHTML("afterbegin", html);
        break;

      case InsertMode.REPLACE:
        removeAllChildren(element);
        element.insertAdjacentHTML("afterbegin", html);
        break;

      case InsertMode.DO_NOT_INSERT:
        break;

      default:
        Syslog.reportMissingCase(insertMode);
        break;
    }
  }

  export function insertElement
  (
    element: Element,
    insertMode: InsertMode
  )
  : void
  {
    switch (insertMode)
    {
      case InsertMode.APPEND:
        element.appendChild(element);
        break;

      case InsertMode.PREPEND:
        element.insertBefore(element, element.firstChild);
        break;

      case InsertMode.REPLACE:
        removeAllChildren(element);
        element.appendChild(element);
        break;

      case InsertMode.DO_NOT_INSERT:
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
}