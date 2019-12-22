/*
  Part of Kosmud

  Abstract ancestor of classes wrapping DOM elements.
*/

// import { Syslog } from "../../Shared/Log/Syslog";
import { Element } from "../../Client/Gui/Element";

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