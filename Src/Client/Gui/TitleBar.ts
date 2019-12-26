/*
  Part of BrutusNEXT

  Window titlebar
*/

import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";
import { Text } from "../../Client/Gui/Text";

export class TitleBar extends Component
{
  // ---------------- Protected data --------------------

  protected title: Text;

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "title_bar",
    title = ""
  )
  {
    super(Element.createDiv(parent, name));

    this.title = new Text(this.element, title, "title");
  }

  // -------------- Static class data -------------------

  // ---------------- Public methods --------------------

  // // Sets text to 'title' element
  // // (accepts plain text or mud colored string).
  // public setTitle(title: string)
  // {
  //   if (this.$title === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   this.$createText
  //   (
  //     {
  //       $parent: this.$title,
  //       text: title,
  //       insertMode: Component.InsertMode.REPLACE
  //     }
  //   );
  // }

  // --------------- Protected methods ------------------

  // protected createWindowTitle(param: Component.TitleParam = {})
  // {
  //   if (this.$titleBar === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   Utils.applyDefaults
  //   (
  //     param,
  //     {
  //       name: 'title',
  //       $parent: this.$titleBar,
  //       sCssClass: TitledWindow.TITLE_S_CSS_CLASS,
  //       text: 'New window'
  //     }
  //   );

  //   this.$title = this.$createTitle(param);
  // }

  // ---------------- Private methods -------------------
}