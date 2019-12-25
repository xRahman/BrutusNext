/*
  Part of BrutusNext

  Wraps <body> element
*/

import { Component } from "../../Client/Gui/Component";

export class Body extends Component
{
  private static readonly body = new Body();

  constructor()
  {
    super(document.body);
  }
}