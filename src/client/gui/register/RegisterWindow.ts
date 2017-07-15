/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {Form} from '../../../client/gui/Form';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

import $ = require('jquery');

export class RegisterWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
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

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create();

    this.setTitle("Create New Account");

    // Create register form.
    this.form.create({ $container: this.$content });

    this.createEmptyLine();

    this.createTermsInfo();

    return this.$window;
  }

  public displayProblem(response: RegisterResponse)
  {
    this.form.displayProblem(response);
  }

  public onReceivedResponse()
  {
    this.form.onReceivedResponse();
  }

  public registrationSucceeded()
  {
    this.form.rememberCredentials();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Window.onShow().
  protected onShow()
  {
    this.form.onShow();
  }

  // ~ Overrides Window.onHide().
  protected onHide()
  {
    this.form.onHide();
  }

  // ---------------- Private methods -------------------

  private appendTermsLink($container: JQuery, text: string)
  {
    //this.$termsLink = Component.appendTextLink($container, text);
    this.$termsLink = this.createTextLink
    (
      {
        $container,
        text,
        insertMode: Component.InsertMode.APPEND
      }
    );

    this.$termsLink.click
    (
      (event: Event) => { this.onTermsClick(event); }
    );
  }

  private createTermsInfo()
  {
    let $container = super.createLinkContainer();

    this.createText
    (
      { $container, text: "By creating an account you agree to our " }
    );
    this.appendTermsLink($container, "Terms of Use");
    this.createText
    (
      { $container, text: "." }
    );
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: Event)
  {
    console.log("Clicked on terms link");
    ClientApp.setState(ClientApp.State.TERMS);
  }
}