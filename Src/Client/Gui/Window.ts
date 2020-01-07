/*
  Part of BrutusNEXT

  Window GUI component
*/

import { Gui } from "../../Client/Gui/Gui";
import { Flags } from "../../Shared/class/Flags";
import { Component } from "../../Client/Gui/Component";
import { Div } from "../../Client/Gui/Div";

export class Window extends Div
{
  // ---------------- Protected data --------------------

  // In what states is this window shown.
  protected readonly visibility = new Flags<Gui.State>();

  // ! Throws an exception on error.
  constructor
  (
    parent: Component,
    name = "window"
  )
  {
    super(parent, name);

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
  //   // TODO: Throw an error if this window doesn't have 'visibility'
  //   // flag set for current current Windows state.

  //   this.closed = false;
  //   this.show();
  // }

  public showByState(state: Gui.State): void
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