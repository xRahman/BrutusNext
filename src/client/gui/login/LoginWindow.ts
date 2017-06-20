/*
  Part of BrutusNEXT

  Login window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {Form} from '../../../client/gui/Form';
import {LoginForm} from '../../../client/gui/login/LoginForm';

import $ = require('jquery');

export class LoginWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.LOGIN);
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private form = new LoginForm();

  private $registerLink = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Window.create()
  public create()
  {
    super.create();

    this.setTitle("&gWelcome to &RBrutus&YNext");

    // Create login form.
    this.form.create(this.$content);

    this.createRegisterInfo();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createRegisterLink($container: JQuery, text: string)
  {
    this.$registerLink = this.createLinkText($container, text);

    this.$registerLink.click
    (
      (event: Event) => { this.onRegisterClick(event); }
    );
  }

  private createRegisterInfo()
  {
    let $container = this.createLinkContainer();

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