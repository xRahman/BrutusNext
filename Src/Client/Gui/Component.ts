/*
  Part of Kosmud

  Abstract ancestor of classes wrapping DOM elements.
*/

import { Syslog } from "../../Shared/Log/Syslog";

export abstract class Component
{
  private displayMode = "block";

  constructor(protected element: HTMLElement)
  {
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

  // --------------- Protected methods ------------------

  protected setCss(css: Partial<CSSStyleDeclaration>): void
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
        this.element.style[property] = value;
    }

    // Setting css properties can change the display mode
    // so we have to re-remember it.
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