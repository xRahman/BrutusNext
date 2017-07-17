/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

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

  private $termsLink: JQuery = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ windowParam: { name: 'register_window' }});

    this.setTitle("Create New Account");

    // Create register form.
    this.form.create({ $parent: this.$content });

    this.createEmptyLine();

    this.createTermsLink();

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

  private createTermsLink()
  {
    let $parent = this.createTextContainer();

    this.createText
    (
      { $parent, text: "By creating an account you agree to our " }
    );

    this.$termsLink = this.createTextLink
    (
      {
        $parent,
        text: "Terms of Use",
        click: (event: MouseEvent) => { this.onTermsClick(event); }
      }
    );

    this.createText({ $parent, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: MouseEvent)
  {
    ClientApp.setState(ClientApp.State.TERMS);
  }
}