/*
  Part of BrutusNEXT

  Abstract ancestor of classes wrapping DOM elements.
*/

import { Syslog } from "../../Shared/Log/Syslog";
import { Dom } from "../../Client/Gui/Dom";

export abstract class Component
{
  // This function traverses the static prototype tree
  // and sets class names of all ancestors as a css class
  // to the element.
  private static setCssClasses(element: Dom.Element): void
  {
    const ancestor = Object.getPrototypeOf(this);

    if (ancestor.setCssClasses)
        ancestor.setCssClasses(element);

    Dom.addCssClass(element, this.name);
  }

  private displayMode: string;

  constructor
  (
    protected readonly parent: Component | "No parent",
    protected readonly element: Dom.Element,
    protected readonly name: string,
    insertMode = Dom.InsertMode.APPEND
  )
  {
    Dom.setName(element, name);

    // Typescript doesn't seem to know that 'this.constructor'
    // refers to the class so it can be used to call static
    // method so we have to typecast to 'any' to do it.
    (this.constructor as any).setCssClasses(element);

    this.displayMode = Dom.getDisplayMode(this.element);

    // Insert 'element' to parent last so the browser only has to
    // recompute graphics once.
    if (parent !== "No parent")
      parent.insertElement(element, insertMode);
  }

  // ------------ Event Handler Setters -----------------

  public set onclick(handler: (event: MouseEvent) => void)
  {
    this.element.onclick = (event: MouseEvent) =>
    {
      wrapEventHandler(event, handler, "click");
    };
  }

  public set onrightclick(handler: (event: MouseEvent) => void)
  {
    this.element.oncontextmenu = (event: MouseEvent) =>
    {
      wrapEventHandler(event, handler, "rightclick");
    };
  }

  public set onmouseover(handler: (event: MouseEvent) => void)
  {
    this.element.onmouseover = (event: MouseEvent) =>
    {
      wrapEventHandler(event, handler, "mouseover");
    };
  }

  public set onmouseout(handler: (event: MouseEvent) => void)
  {
    this.element.onmouseout = (event: MouseEvent) =>
    {
      wrapEventHandler(event, handler, "mouseout");
    };
  }

  public set onwheel(handler: (event: WheelEvent) => void)
  {
    this.element.onwheel = (event: WheelEvent) =>
    {
      wrapEventHandler(event, handler, "wheel");
    };
  }

  // ---------------- Public methods --------------------

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
    Dom.hide(this.element);
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

  public isHidden(): boolean { return Dom.isHidden(this.element); }

  public removeFromParent(): void
  {
    Dom.removeFromParent(this.element);
  }

  public setId(id: string): void
  {
    Dom.setId(this.element, id);
  }

  public setCss(css: Partial<CSSStyleDeclaration>): void
  {
    Dom.setCss(this.element, css);

    // Setting css properties can change the display mode
    // so we have to remember it to be able to return it.
    // when show() is called.
    this.rememberDisplayMode();
  }

  protected insertHtml
  (
    html: string,
    insertMode = Dom.InsertMode.APPEND
  )
  : void
  {
    Dom.insertHtml(this.element, html, insertMode);
  }

  public insertElement
  (
    element: HTMLElement | SVGElement,
    insertMode: Dom.InsertMode
  )
  : void
  {
    Dom.insertElement(this.element, element, insertMode);
  }

  public replaceChild(element: Dom.Element): void
  {
    this.element.replaceChild(element, element);
  }

  public enableMouseEvents(): void
  {
    Dom.enableMouseEvents(this.element);
  }

  public disableMouseEvents(): void
  {
    Dom.disableMouseEvents(this.element);
  }

  // --------------- Protected methods ------------------

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
    this.displayMode = Dom.getDisplayMode(this.element);
  }

  private restoreDisplayMode(): void
  {
    Dom.setDisplayMode(this.element, this.displayMode);
  }
}

// ----------------- Auxiliary Functions ---------------------

function wrapEventHandler<T>
(
  event: T,
  handler: (event: T) => void,
  eventName: string
)
: void
{
  try
  {
    handler(event);
  }
  catch (error)
  {
    Syslog.logError(error, `Failed to process '${eventName}' event`);
  }
}