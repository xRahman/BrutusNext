/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';
import {FormWindow} from '../../../client/gui/FormWindow';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';

import $ = require('jquery');

export class RegisterWindow extends FormWindow
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.REGISTER);
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected form = new RegisterForm();

  //------------------ Private data ---------------------

  private $termsLink = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Window.create()
  public create()
  {
    super.create();

    this.setTitle("Register new account");

    // Create register form.
    this.form.create(this.$content);

    this.createTermsInfo();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createTermsLink($container: JQuery, text: string)
  {
    this.$termsLink = this.createLinkText($container, text);

    this.$termsLink.click
    (
      (event: Event) => { this.onTermsClick(event); }
    );
  }

  private createTermsInfo()
  {
    let $container = this.createLinkContainer();

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