/*
  Part of BrutusNEXT

  Terms window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Window} from '../../../client/gui/Window';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';

import $ = require('jquery');

export class TermsWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.TERMS);
  }

  protected static get S_CSS_CLASS()
    { return 'S_TermsWindow'; }
  protected static get TERMS_S_CSS_CLASS()
    { return 'S_TermsWindow_Terms'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Window.create()
  public create()
  {
    super.create
    (
      {
        windowCss: { sClass: TermsWindow.S_CSS_CLASS },
        contentCss: { sClass: Window.CONTENT_S_CSS_CLASS }
      }
    );

    this.setTitle("Terms of Use");

    this.createTermsText();
    this.createAcceptButton();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createTermsText()
  {
    /// TEST:
    let termsText = "Don't be a jerk, please.";
    
    this.createDiv
    (
      {
        text: termsText,
        $parent: this.$content,
        sCssClass: TermsWindow.TERMS_S_CSS_CLASS
      }
    );
  }

  private createAcceptButton()
  {
    return this.createButton
    (
      {
        $parent: this.$content,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        text: 'Accept',
        click: (event: Event) => { this.onAcceptClick(event); }
      }
    );

    // $button.click
    // (
    //   (event: Event) => { this.onAcceptClick(event); }
    // );

    // return $button;
  }

  // ---------------- Event handlers --------------------

  private onAcceptClick(event: Event)
  {
    console.log("Clicked on Accept button");
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}