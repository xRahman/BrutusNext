/*
  Part of Kosmud

  Functions related to html elements.
*/

import { Syslog } from "../../Shared/Log/Syslog";
// import { Css } from "../../Client/Gui/Css";

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
    // We do want to include inherited properties here
    // because we use prototype chain for css inheritance.
    // eslint-disable-next-line guard-for-in
    for (const property in css)
    {
      const value = css[property];

      if (value !== undefined)
        element.style[property] = value;
    }
  }

  export function setCssClass(element: HTMLElement, cssClassName: string): void
  {
    element.classList.add(cssClassName);
  }

// export function createCssClass
// (
//   element: HTMLElement,
//   css: Css
// )
// : void
// {
//   const cssClass = "TestCssClass";
//   const selector = `.${cssClass}:hover`;
//   // const selector = `.${cssClass}`;
//   const command = "text-decoration: underline;";
//   // const command = `color:#3333BB;`;

//   Css.addCommandToStylesheet(RUNTIME_STYLE_ID, selector, command);

//   // TODO: Tohle by asi nemělo bejt v createCssClass() ale v setCssClass().
//   element.classList.add(cssClass);

//   /*
//   var style = document.createElement('style');
//   style.type = 'text/css';
//   style.innerHTML = '.cssClass { color: #F00; }';
//   document.getElementsByTagName('head')[0].appendChild(style);

//   document.getElementById('someElementId').className = 'cssClass';
//   */
// }

  export function createDiv
  (
    parent: HTMLElement,
    name: string,
    insertMode = InsertMode.APPEND
  )
  : HTMLDivElement
  {
    const div = document.createElement("div");

    div.setAttribute("name", name);

    insertToParent(div, parent, insertMode);

    return div;
  }

  export function createSpan
  (
    parent: HTMLElement,
    name: string,
    html?: string,
    insertMode = InsertMode.APPEND
  )
  : HTMLSpanElement
  {
    const span = document.createElement("span");

    span.setAttribute("name", name);

    if (html)
      insertHtml(span, html);

    insertToParent(span, parent, insertMode);

    return span;
  }
}

// ----------------- Auxiliary Functions ---------------------

function insertHtml
(
  element: HTMLElement,
  html: string,
  insertMode = Element.InsertMode.APPEND
)
: HTMLElement
{
  switch (insertMode)
  {
    case Element.InsertMode.APPEND:
      element.insertAdjacentHTML("beforeend", html);
      break;

    case Element.InsertMode.PREPEND:
      element.insertAdjacentHTML("afterbegin", html);
      break;

    case Element.InsertMode.REPLACE:
      clearHtmlContent(element);
      element.insertAdjacentHTML("afterbegin", html);
      break;

    default:
      Syslog.reportMissingCase(insertMode);
      break;
  }

  return element;
}

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
  insertMode: Element.InsertMode
)
: void
{
  switch (insertMode)
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
      Syslog.reportMissingCase(insertMode);
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