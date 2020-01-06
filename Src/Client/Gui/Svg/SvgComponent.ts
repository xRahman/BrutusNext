/*
  Part of BrutusNEXT

   Ancestor of all SVG components.
*/

import { Component } from "../../../Client/Gui/Component";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export class SvgComponent extends Component
{
  constructor
  (
    parent: Component,
    componentType: SvgComponent.Type,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super
    (
      parent,
      document.createElementNS(SVG_NAMESPACE, componentType),
      name,
      insertMode
    );
  }

  // ---------------- Public methods --------------------

  public scale(scale: number): void
  {
    this.transform(`scale(${scale})`);
  }

  public translate(xPixels: number, yPixels: number): void
  {
    this.transform(`translate(${xPixels}, ${yPixels})`);
  }

  // ---------------- Private methods -------------------

  private transform(transform: string): void
  {
    this.element.setAttribute("transform", transform);
  }
}

// ------------------ Type Declarations ----------------------

export namespace SvgComponent
{
  export type Type =
    | "svg"
    | "g"
    | "image"
    | "circle"
    | "line";

  export function setWidthAndHeight
  (
    element: HTMLElement | SVGElement,
    widthPixels: number,
    heightPixels: number
  )
  : void
  {
    element.setAttribute("width", String(widthPixels));
    element.setAttribute("height", String(heightPixels));
  }
}