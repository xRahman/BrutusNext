/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Form} from '../../../client/gui/component/Form';
import {Window} from '../../../client/gui/component/Window';
import {RegisterForm} from '../../../client/gui/component/RegisterForm';

import $ = require('jquery');

export class RegisterWindow extends Window
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.REGISTER);
  }

  protected static get CSS_CLASS() { return 'RegisterWindow'; }
  protected static get TITLE_CSS_CLASS() { return 'RegisterWindowTitle'; }
  protected static get CONTENT_CSS_CLASS() { return 'RegisterWindowContent'; }
  protected static get TERMS_LINK_CSS_CLASS()
  {
    return 'RegisterWindowTermsLink';
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'registerwindow';

  //------------------ Private data ---------------------

  private form = new RegisterForm();

  private $termsLink = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create();

    this.$window.addClass(RegisterWindow.CSS_CLASS);

    this.$title.addClass(RegisterWindow.TITLE_CSS_CLASS);

    this.setTitle("Register new account");

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Window.createContent().
  // -> Returns created html element.
  protected createContent()
  {
    this.$content = super.createContent();
    this.$content.addClass(RegisterWindow.CONTENT_CSS_CLASS);

    // Create register form.
    this.form.create(this.$content);

    this.appendTermsLink();

    return this.$content;
  }

  protected appendText($container: JQuery, text: string)
  {
    let $text = super.appendText($container, text);

    $text.addClass(Form.LABEL_CSS_CLASS);

    return $text;
  }

  // ---------------- Private methods -------------------

  private appendTermsLink()
  {
    let $container = this.createDiv
    (
      this.$content,
      RegisterWindow.TERMS_LINK_CSS_CLASS
    );

    // Add text link below the form.
    this.appendText($container, "By creating an account you agree to our ");

    this.$termsLink = this.appendLink
    (
      $container,
      "Terms of Use"
    );
    this.$termsLink.addClass(Form.LABEL_CSS_CLASS);
    this.$termsLink.click
    (
      (event: Event) => { this.onTermsClick(event); }
    );

    this.appendText($container, ".");
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: Event)
  {
    console.log("Clicked on on terms link");
  }
}