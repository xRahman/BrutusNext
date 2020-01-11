/*
  Part of BrutusNEXT

  Abstract ancestor of classes wrapping DOM elements.
*/

import { Syslog } from "../../Shared/Log/Syslog";

export abstract class Component
{
  // This function traverses the static prototype tree
  // and sets class names of all ancestors as a css class
  // to the element.
  private static setCssClasses(element: HTMLElement | SVGElement): void
  {
    const ancestor = Object.getPrototypeOf(this);

    if (ancestor.setCssClasses)
        ancestor.setCssClasses(element);

    element.classList.add(this.name);
  }

  private displayMode = "block";

  constructor
  (
    protected readonly parent: Component | "No parent",
    protected readonly element: HTMLElement | SVGElement,
    protected readonly name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    element.setAttribute("name", name);

    if (parent !== "No parent")
      parent.insertElement(element, insertMode);

    // Typescript doesn't seem to know that 'this.constructor'
    // refers to the class so it can be used to call static
    // method so we have to typecast to 'any' to do it.
    (this.constructor as any).setCssClasses(element);

    // Setting css class can change the display mode so
    // we have to remember it to be able to return it.
    // when show() is called.
    this.rememberDisplayMode();
  }

  // ------------ Event Handler Setters -----------------

  public set onclick(handler: (event: MouseEvent) => void)
  {
    this.element.onclick = (event: MouseEvent) =>
    {
      this.eventHandlerWrapper(event, handler, "click");
    };
  }

  public set onrightclick(handler: (event: MouseEvent) => void)
  {
    this.element.oncontextmenu = (event: MouseEvent) =>
    {
      this.eventHandlerWrapper(event, handler, "rightclick");
    };
  }

  public set onmouseover(handler: (event: MouseEvent) => void)
  {
    this.element.onmouseover = (event: MouseEvent) =>
    {
      this.eventHandlerWrapper(event, handler, "mouseover");
    };
  }

  public set onmouseout(handler: (event: MouseEvent) => void)
  {
    this.element.onmouseout = (event: MouseEvent) =>
    {
      this.eventHandlerWrapper(event, handler, "mouseout");
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

  public removeFromParent(): void
  {
    this.element.parentNode?.removeChild(this.element);
  }

  public setId(id: string): void
  {
    this.element.id = id;
  }

  public setCss(css: Partial<CSSStyleDeclaration>): void
  {
    for (const property in css)
    {
      if (!css.hasOwnProperty(property))
        continue;

      const value = css[property];

      if (value !== undefined)
        this.element.style[property] = value;
    }

    // Setting css properties can change the display mode
    // so we have to remember it to be able to return it.
    // when show() is called.
    this.rememberDisplayMode();
  }

  protected insertHtml
  (
    html: string,
    insertMode = Component.InsertMode.APPEND
  )
  : void
  {
    switch (insertMode)
    {
      case Component.InsertMode.APPEND:
        this.element.insertAdjacentHTML("beforeend", html);
        break;

      case Component.InsertMode.PREPEND:
        this.element.insertAdjacentHTML("afterbegin", html);
        break;

      case Component.InsertMode.REPLACE:
        this.removeAllChildren();
        this.element.insertAdjacentHTML("afterbegin", html);
        break;

      case Component.InsertMode.DO_NOT_INSERT:
        break;

      default:
        Syslog.reportMissingCase(insertMode);
        break;
    }
  }

  public insertElement
  (
    element: HTMLElement | SVGElement,
    insertMode: Component.InsertMode
  )
  : void
  {
    switch (insertMode)
    {
      case Component.InsertMode.APPEND:
        this.element.appendChild(element);
        break;

      case Component.InsertMode.PREPEND:
        this.element.insertBefore(element, this.element.firstChild);
        break;

      case Component.InsertMode.REPLACE:
        this.removeAllChildren();
        this.element.appendChild(element);
        break;

      case Component.InsertMode.DO_NOT_INSERT:
        break;

      default:
        Syslog.reportMissingCase(insertMode);
        break;
    }
  }

  public replaceChild(element: HTMLElement | SVGElement): void
  {
    this.element.replaceChild(element, element);
  }

  public enableMouseEvents(): void
  {
    this.setCss({ pointerEvents: "auto" });
  }

  public disableMouseEvents(): void
  {
    this.setCss({ pointerEvents: "none" });
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

  private removeAllChildren(): void
  {
    while (this.element.lastChild !== null)
    {
      this.element.removeChild(this.element.lastChild);
    }
  }

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

  private eventHandlerWrapper
  (
    event: MouseEvent,
    handler: (event: MouseEvent) => void,
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

  // ---------------- Event handlers --------------------

  /// This idea is deprecated in favour of assigning event handler directly
  /// to this.element. It might be less elegant but it's pure javascript
  /// so it can be easily googled how to do it. And it is probably more
  /// easily readable anyways.
  // // We are generating our own 'onLeftClick and onRightClick' event handler
  // // calls because there is no 'rightClick' event in plain javascript.
  // // (There is an 'oncontextmenu' event which technically fires on right
  // // click  but using it that way is more like a hack.)
  // protected onMouseUp(event: MouseEvent): void
  // {
  //   switch (event.button)
  //   {
  //     case 0:
  //       this.onLeftClick(event);
  //       break;

  //     case 2:
  //       this.onRightClick(event);
  //       break;

  //     default:
  //       break;
  //   }
  // }
}

// ------------------ Type Declarations ----------------------

export namespace Component
{
  export enum InsertMode
  {
    // Insert as the last child (default).
    APPEND,
    // Insert as the first child.
    PREPEND,
    // Html contents of parent element is cleared first.
    REPLACE,
    // As you would guess.
    DO_NOT_INSERT
  }
}