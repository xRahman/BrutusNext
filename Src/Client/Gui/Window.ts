/*
  Part of BrutusNEXT

  Window GUI component
*/

// import { Utils } from "../../../Shared/lib/utils/Utils";
import { Flags } from "../../Shared/class/Flags";
// import { ClientApp } from "../../../client/lib/app/ClientApp";
import { Component } from "../../Client/Gui/Component";
import { Element } from "../../Client/Gui/Element";
import { Windows } from "../../Client/Gui/Windows";

export class Window extends Component
{
  // ---------------- Protected data --------------------

  // In what states is this window shown.
  protected readonly visibility = new Flags<Windows.State>();

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "window"
  )
  {
    super(Element.createDiv(parent, name));

    // Windows are created hidden.
    this.hide();
  }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // public isClosed(): boolean { return this.closed; }

  // public close(): void
  // {
  //   this.closed = true;
  //   this.hide();
  // }

  // // ! Throws an exception on error.
  // public open(): void
  // {
  //   // TODO: Throw an error if this window doesn't have a 'visibility'
  //   // flag set for current current Windows state.

  //   this.closed = false;
  //   this.show();
  // }

  public showByState(state: Windows.State): void
  {
    if (this.visibility.isSet(state))
    {
      this.show();
    }
    else
    {
      this.hide();
    }
  }

  // ---------------- Private methods -------------------
}