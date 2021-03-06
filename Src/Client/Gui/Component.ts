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

  private handlers =
  {
    onShow: "Not set" as (() => void) | "Not set",
    onHide: "Not set" as (() => void) | "Not set"
  };

  constructor
  (
    protected parent: Component | "No parent",
    protected readonly element: Dom.Element,
    protected readonly name: string,
    insertMode: Dom.InsertMode = "APPEND"
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

  // ------------ Event handler setters -----------------

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

  public set onmouseup(handler: (event: MouseEvent) => void)
  {
    this.element.onmouseup = (event: MouseEvent) =>
    {
      wrapEventHandler(event, handler, "mouseup");
    };
  }

  public set onmousedown(handler: (event: MouseEvent) => void)
  {
    this.element.onmousedown = (event: MouseEvent) =>
    {
      wrapEventHandler(event, handler, "mousedown");
    };
  }

  public set onwheel(handler: (event: WheelEvent) => void)
  {
    this.element.onwheel = (event: WheelEvent) =>
    {
      wrapEventHandler(event, handler, "wheel");
    };
  }

  public set onkeydown(handler: (event: KeyboardEvent) => void)
  {
    this.element.onkeydown = (event: KeyboardEvent) =>
    {
      wrapEventHandler(event, handler, "keydown");
    };
  }

  public set onkeypress(handler: (event: KeyboardEvent) => void)
  {
    this.element.onkeypress = (event: KeyboardEvent) =>
    {
      wrapEventHandler(event, handler, "keypress");
    };
  }

  public set onkeyup(handler: (event: KeyboardEvent) => void)
  {
    this.element.onkeyup = (event: KeyboardEvent) =>
    {
      wrapEventHandler(event, handler, "keyup");
    };
  }

  public set onshow(handler: () => void)
  {
    this.handlers.onShow = () =>
    {
      wrapHandler(handler, "show");
    };
  }

  public set onhide(handler: () => void)
  {
    this.handlers.onHide = () =>
    {
      wrapHandler(handler, "hide");
    };
  }

  // ---------------- Public methods --------------------

  public hide(): void
  {
    // Don't do anything if we are already hidden.
    if (this.isHidden())
      return;

    // 'onHide()' must be called fefore setting display mode
    // to "none" because hidden components can't be manipulated
    // with (for example they can't be given focus).
    if (this.handlers.onHide !== "Not set")
      this.handlers.onHide();

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
    if (this.handlers.onShow !== "Not set")
      this.handlers.onShow();
  }

  public isHidden(): boolean { return Dom.isHidden(this.element); }

  public setParent
  (
    parent: Component | "No parent",
    insertMode: Dom.InsertMode = "APPEND"
  )
  : void
  {
    this.parent = parent;

    if (parent !== "No parent")
      parent.insertElement(this.element, insertMode);
  }

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

    this.rememberDisplayMode();
  }

  protected insertHtml
  (
    html: string,
    insertMode: Dom.InsertMode = "APPEND"
  )
  : void
  {
    Dom.insertHtml(this.element, html, insertMode);
  }

  public insertElement
  (
    element: HTMLElement | SVGElement,
    insertMode: Dom.InsertMode = "APPEND"
  )
  : void
  {
    Dom.insertElement(this.element, element, insertMode);
  }

  public updateChildGraphics(element: Dom.Element): void
  {
    // Removing 'element' from DOM and inserting it back again
    // forces the browser to recalculate it's graphics.
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

function wrapHandler
(
  handler: () => void,
  eventName: string
)
: void
{
  try
  {
    handler();
  }
  catch (error)
  {
    Syslog.logError(error, `Failed to process '${eventName}' event`);
  }
}

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