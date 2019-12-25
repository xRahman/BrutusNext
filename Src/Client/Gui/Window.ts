/*
  Part of BrutusNEXT

  Window GUI component
*/

// import { Utils } from "../../../Shared/lib/utils/Utils";
// import { Flags } from "../../../shared/lib/utils/Flags";
// import { ClientApp } from "../../../client/lib/app/ClientApp";
import { Css } from "../../Client/Gui/Css";
import { Component } from "../../Client/Gui/Component";
import { Element } from "../../Client/Gui/Element";

export class Window extends Component
{
  public static css = Css.createClass
  (
    "Window",
    {
      base:
      {
        // ------------- Size and position -------------
        gridColumnStart: "4",
        gridColumnEnd: "7",
        gridRowStart: "4",
        gridRowEnd: "7",

        // ------- Children size and positioning -------
        // display: "grid",
        // gridTemplateColumns: "auto auto auto auto auto auto auto auto auto",
        // gridColumnGap: "0.2rem",
        // gridTemplateRows: "auto auto auto auto auto auto auto auto auto",
        // gridRowGap: "0.2rem",

        // ---------------- Background -----------------
        backgroundColor: "rgba(0, 0, 0, 0.6)",

        // ---- Border, margin, padding and outline ----
        margin: "0",
        padding: "0",
        outline: "none",

        // ------------------- Text --------------------
        // fontWeight: "bold",
        // textOverflow: "ellipsis",   // Add '...' if text overflows.
        textShadow: "0 1px 0 rgba(0, 0, 0, 0.5)",
        color: "rgb(210, 230, 250)", // Text color.
        border: "1px ridge rgba(110,130,150,0.8)"
      }
    }
  );

  // ---------------- Protected data --------------------

  protected closed = false;

  // // Determines app states at which this window is shown.
  // protected flags = new Flags<ClientApp.State>();

  // ----------------- Private data ---------------------

  /// TODO: Na tohle použiju metodu isHidden().
  // Internal flag to prevent calling onHide() if window
  // is already hidden.
  // private hidden = true;

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "window"
  )
  {
    super(Element.createDiv(parent, name));

    this.setCssClass("Window");
  }

  // constructor(windowParam: Component.DivParam = {})
  // {
  //   // Windows are root components, they don't have parent.
  //   super(null);

  //   Utils.applyDefaults
  //   (
  //     windowParam,
  //     {
  //       name: 'window',
  //       $parent: Document.$body,
  //       gCssClass: Component.WINDOW_G_CSS_CLASS,
  //       sCssClass: Window.S_CSS_CLASS
  //     }
  //   );

  //   this.$element = this.$createDiv(windowParam);

  //   if (this.$element === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   // Windows are created hidden.
  //   this.$element.hide();
  // }

  // protected static get S_CSS_CLASS()
  //   { return 'S_Window'; }

  // --------------- Public accessors -------------------

  // public getFlags() { return this.flags; }

  // ---------------- Public methods --------------------

  public close(): void
  {
    this.closed = true;
    this.hide();
  }

  // ! Throws an exception on error.
  public open(): void
  {
    // TODO: Hodit error, pokud okno v aktuálním state má bejt hidnutý
    //   (v tom případě nejde otevřít).

    this.closed = false;
    this.show();
  }

  // // -> Returns 'true' if window actually changes state
  // //    from 'hidden' to 'shown'.
  // public showByState(state: ClientApp.State)
  // {
  //   if (this.flags.isSet(state))
  //     return this.show();

  //   this.hide();

  //   return false;
  // }

  // // Executes when html document is fully loaded.
  // public onDocumentReady() {}

  // // Executes when html document is resized.
  // public onDocumentResize() {}

  // ---------------- Private methods -------------------

  // private hide()
  // {
  //   if (this.hidden)
  //     return;

  //   if (this.$element === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   this.$element.hide();
  //   this.hidden = true;
  //   this.onHide();
  // }

  // // -> Returns 'true' if window actually changes state
  // //    from 'hidden' to 'shown'.
  // private show()
  // {
  //   if (this.closed)
  //     return false;

  //   if (!this.hidden)
  //     return false;

  //   if (this.$element === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   this.$element.show();
  //   this.hidden = false;

  //   // Note: onShow() must be called after this.$window.show()
  //   //   because hidden components can't be manipulated with
  //   //   (for example they can't be given focus).
  //   this.onShow();

  //   return true;
  // }
}