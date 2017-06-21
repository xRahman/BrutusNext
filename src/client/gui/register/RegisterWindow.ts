/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';

import $ = require('jquery');

export class RegisterWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in state 'LOGIN'.
    this.flags.set(ClientApp.State.REGISTER);
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private form = new RegisterForm();

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
    this.form.create({ $container: this.$content });

    this.createTermsInfo();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createTermsLink($container: JQuery, text: string)
  {
    this.$termsLink = super._createLinkText({ $container, text });

    this.$termsLink.click
    (
      (event: Event) => { this.onTermsClick(event); }
    );
  }

  private createTermsInfo()
  {
    let $container = super._createLinkContainer();

    super._createText
    (
      {
        $container,
        text: "By creating an account you agree to our "
      }
    );
    this.createTermsLink($container, "Terms of Use");
    super._createText({ $container, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: Event)
  {
    console.log("Clicked on on terms link");
    ClientApp.setState(ClientApp.State.TERMS);
  }
}