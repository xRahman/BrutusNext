/*
  Part of Kosmud

  Abstract ancestor of classes wrapping DOM elements.
*/

import { Element } from "../../Client/Gui/Element";

export abstract class Component
{
  // This function traverses the static prototype tree
  // and sets class names of all ancestors as a css class
  // to the element.
  private static setCssClasses(element: HTMLElement): void
  {
    const ancestor = Object.getPrototypeOf(this);

    if (ancestor.setCssClasses)
        ancestor.setCssClasses(element);

    Element.setCssClass(element, this.name);
  }

  private displayMode = "block";

  constructor(protected element: HTMLElement)
  {
    // Typescript doesn't seem to know that 'this.constructor'
    // refers to the class so it can be used to call static
    // method so we have to typecast to 'any' to do it.
    (this.constructor as any).setCssClasses(element);

    // Setting css class can change the display mode so
    // we have to remember it to be able to return it.
    // when show() is called.
    this.rememberDisplayMode();
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