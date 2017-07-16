/*
  Part of BrutusNEXT

  Terms window.
*/

'use strict';

import {Utils} from '../../../shared/lib/utils/Utils';
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
        name: 'terms_window',
        sCssClass: TermsWindow.S_CSS_CLASS
      }
    );

    this.setTitle("Terms of Use");

    this.createTermsText();
    this.createAcceptButton();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ~ Overrides TermsWindow.createContent().
  protected createContent(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      { sCssClass: TermsWindow.CONTENT_S_CSS_CLASS }
    );

    return super.createContent(param);
  }

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
        click: (event: MouseEvent) => { this.onAcceptClick(event); }
      }
    );
  }

  // ---------------- Event handlers --------------------

  private onAcceptClick(event: MouseEvent)
  {
    console.log("Clicked on Accept button");
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}