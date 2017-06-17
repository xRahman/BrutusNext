/*
  Part of BrutusNEXT

  Login window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Window} from '../../../client/gui/component/Window';
import {LoginForm} from '../../../client/gui/component/LoginForm';

import $ = require('jquery');

export class LoginWindow extends Window
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.LOGIN);
  }

  protected static get CSS_CLASS() { return 'LoginWindow'; }
  protected static get TITLE_BAR_CSS_CLASS() { return 'LoginWindowTitleBar'; }
  ///protected static get TITLE_CSS_CLASS() { return 'LoginWindowTitle'; }
  protected static get CONTENT_CSS_CLASS() { return 'LoginWindowContent'; }
  protected static get REGISTER_LINK_CSS_CLASS()
  {
    return 'LoginWindowRegisterLink';
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'loginwindow';

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
    super.create();

    // LoginWindow uses css class .LoginWindow along with .Window.
    this.$window.addClass(LoginWindow.CSS_CLASS);

    this.$titleBar.addClass(LoginWindow.TITLE_BAR_CSS_CLASS);

    let titleHtml = this.htmlizeMudColors("&wWelcome to &RBrutus&YNext");

    this.$titleBar.html(titleHtml);

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Window.createContent().
  // -> Returns created html element.
  protected createContent()
  {
    this.$content = super.createContent();
    this.$content.addClass(LoginWindow.CONTENT_CSS_CLASS);

    // Create login form.
    this.$content.append(this.form.create());

    this.appendRegisterLink();

    return this.$content;
  }

  // ---------------- Private methods -------------------

  private appendRegisterLink()
  {
    let $container = this.createDiv
    (
      null,   // No id.
      LoginWindow.REGISTER_LINK_CSS_CLASS
    );

    // Add text link below the form.
    this.appendText($container, "Don't have an account yet? ");
    this.$registerLink = this.appendLink
    (
      $container,
      'register_link',
      "Register"
    );
    this.appendText($container, ".");

    this.$registerLink.click
    (
      (event: Event) => { this.onRegisterClick(event); }
    );

    this.$content.append($container);

    return $container;
  }

  // ---------------- Event handlers --------------------

  private onRegisterClick(event: Event)
  {
    console.log("Clicked on on register link");
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}