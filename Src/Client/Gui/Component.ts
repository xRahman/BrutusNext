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
    // Don't do anything if we are already hidden.
    if (this.isHidden())
      return;

    // 'onHide()' must be called after setting display mode
    // because hidden components can't be manipulated with
    // (for example they can't be given focus).
    this.onShow();

    this.rememberDisplayMode();
    this.element.style.display = "none";
  }

  public show(): void
  {
    // Don't do anything if we are already shown.
    if (!this.isHidden())
      return;

    this.restoreDisplayMode();

    // 'onShow()' must be called after this.restoreDisplayMode()
    // because hidden components can't be manipulated with
    // (for example they can't be given focus).
    this.onShow();
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

  protected onShow(): void
  {
    // This handler can be redefined by descendants.
  }

  protected onHide(): void
  {
    // This handler can be redefined by descendants.
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