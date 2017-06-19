/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';
import {Window} from '../../../client/gui/Window';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';

import $ = require('jquery');

export class RegisterWindow extends Window
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.REGISTER);
  }

  private static get CSS_CLASS()
    { return 'RegisterWindow'; }
  private static get TITLE_BAR_CSS_CLASS()
    { return 'RegisterWindow_TitleBar'; }
  private static get TITLE_CSS_CLASS()
    { return 'RegisterWindow_Title'; }
  private static get CONTENT_CSS_CLASS()
    { return 'RegisterWindow_Content'; }
  private static get TEXT_CSS_CLASS()
    { return 'RegisterWindow_Text'; }
  private static get TEXT_LINK_CSS_CLASS()
    { return 'RegisterWindow_TextLink'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

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
    super.create
    (
      RegisterWindow.CSS_CLASS,
      RegisterWindow.CONTENT_CSS_CLASS,
      RegisterWindow.TITLE_BAR_CSS_CLASS,
      RegisterWindow.TITLE_CSS_CLASS
    );

    this.setTitle("Register new account");

    // Create register form.
    this.form.create(this.$content);

    this.createTermsInfo();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createText($container: JQuery, text: string)
  {
    Component.createText
    (
      $container,
      RegisterWindow.TEXT_CSS_CLASS,
      text
    );
  }

  private createTermsLink($container: JQuery, text: string)
  {
    this.$termsLink = Component.createTextLink
    (
      $container,
      RegisterWindow.TEXT_LINK_CSS_CLASS,
      text
    );

    this.$termsLink.click
    (
      (event: Event) => { this.onTermsClick(event); }
    );
  }

  private createTermsInfo()
  {
    let $container = Component.createDiv
    (
      this.$content,
      RegisterWindow.TEXT_LINK_CSS_CLASS
    );

    this.createText($container, "By creating an account you agree to our ");
    this.createTermsLink($container, "Terms of Use");
    this.createText($container, ".");
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: Event)
  {
    console.log("Clicked on on terms link");
  }
}