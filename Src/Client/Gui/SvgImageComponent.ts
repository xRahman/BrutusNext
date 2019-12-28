/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../Client/Gui/Component";

export class SvgImageComponent extends Component
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super
    (
      parent,
      document.createElementNS("http://www.w3.org/2000/svg", "image"),
      name,
      insertMode
    );
  }

  public setImage(path: string): void
  {
    this.element.setAttributeNS("http://www.w3.org/1999/xlink", "href", path);
  }

  public setPosition(x: number, y: number): void
  {
    this.element.setAttribute("x", String(x));
    this.element.setAttribute("y", String(y));
  }

  public setRelativePosition(x: number, y: number): void
  {
    this.element.setAttribute("x", `${String(x)}%`);
    this.element.setAttribute("y", `${String(y)}%`);
  }

  public setSize(width: number, height: number): void
  {
    this.element.setAttribute("width", String(width));
    this.element.setAttribute("height", String(height));
  }

  public setTransform(transform: string): void
  {
    this.element.setAttribute("transform", transform);
  }
}