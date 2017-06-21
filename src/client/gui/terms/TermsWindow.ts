/*
  Part of BrutusNEXT

  Terms window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';

import $ = require('jquery');

export class TermsWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.TERMS);
  }

  protected static get S_CSS_CLASS()
    { return 'TermsWindow'; }
  protected static get CONTENT_S_CSS_CLASS()
    { return 'TermsWindow_Content'; }
  protected static get TERMS_S_CSS_CLASS()
    { return 'TermsWindow_Terms'; }
  protected static get ACCEPT_BUTTON_S_CSS_CLASS()
    { return 'TermsWindow_AcceptButton'; }

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
        window_sCssClass: TermsWindow.S_CSS_CLASS,
        content_sCssClass: TermsWindow.CONTENT_S_CSS_CLASS
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
    ///let termsText = "Don't be a jerk, please."
    let termsText = "Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please."
      + " Don't be a jerk, please.";
    
    let $container = Component.createDiv
    (
      {
        $container: this.$content,
        sCssClass: TermsWindow.TERMS_S_CSS_CLASS
      }
    );

    let $span = Component.createSpan
    (
      {
        $container: $container,
        sCssClass: null
      }
    );

    ///$span.attr('word-wrap', 'break-word');

    $span.text(termsText);
  }

  private createAcceptButton()
  {
    let $button = Component.createButton
    (
      {
        $container: this.$content,
        sCssClass: TermsWindow.ACCEPT_BUTTON_S_CSS_CLASS,
        text: 'Accept'   // Button text.
      }
    );

    $button.click
    (
      (event: Event) => { this.onAcceptClick(event); }
    );

    return $button;
  }

  // ---------------- Event handlers --------------------

  private onAcceptClick(event: Event)
  {
    console.log("Clicked on Accept button");
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}