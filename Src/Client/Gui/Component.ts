/*
  Part of Kosmud

  Abstract ancestor of classes wrapping DOM elements.
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";

export abstract class Component
{
  public static css = Css.createClass
  (
    "Component",
    {
      base:
      {
        // ---- Border, margin, padding and outline ----
        // Count padding and border to the width and height.
        boxSizing: "border-box",
        border: "none",
        margin: "0",
        padding: "0",
        outline: "0 none",

        // ------------------- Text --------------------
        // Fonts are saved on server so we don't need alternatives.
        fontFamily: "CourierNew",
        fontSize: "1rem"
      }
    }
  );

  // protected static createCssClass(css: Css.Class): Css.Class
  // {
  //   return Css.createClass(this.name, css);
  // }

  private displayMode = "block";

  constructor(protected element: HTMLElement)
  {
    this.setCssClass("Component");
  }

  // ---------------- Public methods --------------------

  public getElement(): HTMLElement { return this.element; }

  public hide(): void
  {
    this.rememberDisplayMode();
    this.element.style.display = "none";
  }

  public show(): void
  {
    this.restoreDisplayMode();
  }

  public isHidden(): boolean { return this.element.style.display === "none"; }

  // --------------- Protected methods ------------------

  protected setCss(css: Partial<CSSStyleDeclaration>): void
  {
    Element.setCss(this.element, css);

    // Setting css properties can change the display mode
    // so we have to remember it to be able to return it.
    // when show() is called.
    this.rememberDisplayMode();
  }

  protected setCssClass(className: string): void
  {
    this.element.classList.add(className);

    // Setting css class can change the display mode so
    // we have to remember it to be able to return it.
    // when show() is called.
    this.rememberDisplayMode();
  }

  // ---------------- Private methods -------------------

  private rememberDisplayMode(): void
  {
    if (this.element.style.display !== null)
    {
      this.displayMode = this.element.style.display;
    }
  }

  private restoreDisplayMode(): void
  {
    this.element.style.display = this.displayMode;
  }
}