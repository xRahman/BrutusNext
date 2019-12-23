/*
  Part of BrutusNext

  Wraps <html> element
*/

/*
  Note that font size of <html> element is used to calculate
  the value of '1rem', which is used as unit in all the rest
  of the gui. This means that by setting font size here we
  can scale the size of all fonts, paddings, grid gaps etc.
*/

import { Css } from "../../Client/Gui/Css";
import { Component } from "../../Client/Gui/Component";

export class Html extends Component
{
  protected static readonly css = new Css
  (
    {
      // ------------------- Font --------------------
      fontSize: "16px"
    }
  ).extends(Component.css);

  private static readonly html = new Html();

  public static scaleAllFonts(size: number): void
  {
    // Since all fonts should use 'rem' units to specify
    // their size, changing size of font in <html> elements
    // changes their size as well.
    this.html.setCss({ fontSize: `${size}px` });
  }

  constructor()
  {
    super(document.documentElement);

    this.setCss(Html.css);
  }
}