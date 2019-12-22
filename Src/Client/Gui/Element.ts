/*
  Part of Kosmud

  Functions related to html elements.
*/

import { Syslog } from "../../Shared/Log/Syslog";

export namespace Element
{
  // ------------ Protected static methods --------------

  export function setCss
  (
    element: HTMLElement,
    css: Partial<CSSStyleDeclaration>
  )
  : void
  {
    // Iterate over all own properties of 'css' object and set
    // their values to respective properties in 'css'.
    // (It works because 'css' has the same properties as
    //  this.element.style, only they are all optional).
    for (const property in css)
    {
      // Skip inherited properties.
      if (!css.hasOwnProperty(property))
        continue;

      const value = css[property];

      if (value !== undefined)
        element.style[property] = value;
    }
  }

  export function createDiv
  (
    parent: HTMLElement,
    css: Partial<CSSStyleDeclaration>,
    insertMode: InsertMode = InsertMode.APPEND
  )
  : HTMLDivElement
  {
    const div = document.createElement("div");

    setCss(div, css);

    insertToParent(div, parent, insertMode);

    return div;
  }
}

// ----------------- Auxiliary Functions ---------------------

function clearHtmlContent(element: HTMLElement): void
{
  while (element.lastChild !== null)
  {
    element.removeChild(element.lastChild);
  }
}

function insertToParent
(
  element: HTMLElement,
  parent: HTMLElement,
  mode: Element.InsertMode
)
: void
{
  switch (mode)
  {
    case Element.InsertMode.APPEND:
      parent.appendChild(element);
      break;

    case Element.InsertMode.PREPEND:
      parent.insertBefore(element, parent.firstChild);
      break;

    case Element.InsertMode.REPLACE:
      clearHtmlContent(parent);
      parent.appendChild(element);
      break;

    default:
      Syslog.logError("Unknown insert mode."
        + " Element is not inserted to parent");
      break;
  }
}

// ------------------ Type Declarations ----------------------

export namespace Element
{
  export enum InsertMode
  {
    // Insert as the last child (default).
    APPEND,
    // Insert as the first child.
    PREPEND,
    // Html contents of parent element is cleared first.
    REPLACE
  }
}