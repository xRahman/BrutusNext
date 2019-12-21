/*
  Part of BrutusNext

  Keeps references to root html components
*/

import { Html } from "../../Client/Gui/Html";
import { Body } from "../../Client/Gui/Body";

let html: Html | "Not initialized" = "Not initialized";
let body: Body | "Not initialized" = "Not initialized";

export namespace Gui
{
  // ! Throws exception on error.
  export function getBody(): Body
  {
    if (body === "Not initialized")
      throw Error("Body component doesn't exist");

    return body;
  }

  // ! Throws exception on error.
  export function getHtml(): Html
  {
    if (html === "Not initialized")
      throw Error("Html component doesn't exist");

    return html;
  }

  // ------------- Public static methods ----------------

  // ! Throws exception on error.
  export function init(): void
  {
    // ! Throws exception on error.
    initHtmlComponent();

    // ! Throws exception on error.
    initBodyComponent();
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function initHtmlComponent(): void
{
  if (html !== "Not initialized")
  {
    throw Error("Failed to init <html> component"
      + " because it is already initialized");
  }

  // 'document.documentElement' is a direct reference to <html> element.
  if (document.documentElement === null)
  {
    throw Error("Failed to init <html> component"
      + " because it doesn't exist in the DOM");
  }

  html = new Html(document.documentElement);
}

// ! Throws exception on error.
function initBodyComponent(): void
{
  if (body !== "Not initialized")
  {
    throw Error("Failed to init <body> component"
      + " because  is already initialized");
  }

  body = new Body(document.body);
}