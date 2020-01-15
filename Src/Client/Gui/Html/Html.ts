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

import { Component } from "../../../Client/Gui/Component";

export class Html extends Component
{
  private static readonly instance = new Html();

  public static scaleAllFonts(size: number): void
  {
    // Since all fonts should use 'rem' units to specify
    // their size, changing size of font in <html> elements
    // changes their size as well.
    this.instance.setCss({ fontSize: `${size}px` });
  }

  constructor()
  {
    super("No parent", document.documentElement, "html");
  }
}