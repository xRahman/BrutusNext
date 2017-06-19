/*
  Part of BrutusNEXT

  Login window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Window} from '../../../client/gui/Window';
import {Form} from '../../../client/gui/Form';
import {LoginForm} from '../../../client/gui/login/LoginForm';

import $ = require('jquery');

export class LoginWindow extends Window
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.LOGIN);
  }

  private static get CSS_CLASS()
    { return 'LoginWindow'; }
  private static get TITLE_BAR_CSS_CLASS()
    { return 'LoginWindow_TitleBar'; }
  private static get TITLE_CSS_CLASS()
    { return 'LoginWindow_Title'; }
  private static get CONTENT_CSS_CLASS()
    { return 'LoginWindow_Content'; }
  private static get TEXT_CSS_CLASS()
    { return 'LoginWindow_Text'; }
  private static get TEXT_LINK_CSS_CLASS()
    { return 'LoginWindow_TextLink'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private form = new LoginForm();

  private $registerLink = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create
    (
      LoginWindow.CSS_CLASS,
      LoginWindow.CONTENT_CSS_CLASS,
      LoginWindow.TITLE_BAR_CSS_CLASS,
      LoginWindow.TITLE_CSS_CLASS
    );

    this.initTitleText();

    // Create login form.
    this.form.create(this.$content);

    this.createRegisterInfo();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private initTitleText()
  {
    let titleHtml = this.htmlizeMudColors("&gWelcome to &RBrutus&YNext");

    this.setTitle(titleHtml);
  }

  private createText($container: JQuery, text: string)
  {
    Component.createText
    (
      $container,
      LoginWindow.TEXT_CSS_CLASS,
      text
    );
  }

  private createRegisterLink($container: JQuery, text: string)
  {
    this.$registerLink = Component.createTextLink
    (
      $container,
      LoginWindow.TEXT_LINK_CSS_CLASS,
      text
    );

    this.$registerLink.click
    (
      (event: Event) => { this.onRegisterClick(event); }
    );
  }

  private createRegisterInfo()
  {
    let $container = Component.createDiv
    (
      this.$content,
      LoginWindow.TEXT_LINK_CSS_CLASS
    );

    this.createText($container, "Don't have an account yet? ");
    this.createRegisterLink($container, "Register");
    this.createText($container, ".");
  }

  // ---------------- Event handlers --------------------

  private onRegisterClick(event: Event)
  {
    console.log("Clicked on register link");
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}