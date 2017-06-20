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

  protected static get CSS_CLASS()
    { return 'TermsWindow'; }
  protected static get CONTENT_CSS_CLASS()
    { return 'TermsWindow_Content'; }
  protected static get TERMS_CSS_CLASS()
    { return 'TermsWindow_Terms'; }
  protected static get ACCEPT_BUTTON_CSS_CLASS()
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
      TermsWindow.CSS_CLASS,
      TermsWindow.CONTENT_CSS_CLASS
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
      this.$content,
      TermsWindow.TERMS_CSS_CLASS
    );

    let $span = Component.createSpan($container, null);

    ///$span.attr('word-wrap', 'break-word');

    $span.text(termsText);
  }

  private createAcceptButton()
  {
    let $button = Component.createButton
    (
      this.$content,
      TermsWindow.ACCEPT_BUTTON_CSS_CLASS,
      'Accept'   // Button text.
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