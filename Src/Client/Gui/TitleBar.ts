/*
  Part of BrutusNEXT

  Window title bar
*/

import { Text } from "../../Client/Gui/Text/Text";
import { Window } from "../../Client/Gui/Window";
import { Div } from "../../Client/Gui/Div";

export class TitleBar extends Div
{
  // ---------------- Protected data --------------------

  protected title: Text;

  // ! Throws an exception on error.
  constructor
  (
    parent: Window,
    name = "title_bar",
    title = ""
  )
  {
    super(parent, name);

    this.title = new Text(this, title, "title");
  }

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