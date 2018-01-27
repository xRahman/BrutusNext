/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {FormWindow} from '../../../client/gui/window/FormWindow';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';

export class RegisterWindow extends FormWindow
{
  constructor()
  {
    super({ windowParam: { name: 'register_window' }});

    this.setTitle("Create New Account");

    this.createRegisterForm();
    this.createEmptyLine();
    this.createTermsLink();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.REGISTER);
  }

  // ----------------- Private data ---------------------

  private $termsLink: JQuery | null = null;

  // ----------------- Public data ---------------------- 

  // ~ Overrides FormWindow.form.
  public form: RegisterForm = null;

  // ---------------- Public methods --------------------

  public backToLogin()
  {
    ClientApp.setState(ClientApp.State.LOGIN);
  }

  // ---------------- Private methods -------------------

  private createRegisterForm()
  {
    if (this.form !== null)
      ERROR("Register form already exists");

    this.form = new RegisterForm
    (
      this,
      { $parent: this.$content }
    );
  }

  private createTermsLink()
  {
    let $parent = this.createTextContainer();

    this.$createText
    (
      { $parent, text: "By creating an account you agree to our " }
    );

    this.$termsLink = this.$createTextLink
    (
      {
        $parent,
        text: "Terms of Use",
        click: (event) => { this.onTermsClick(event); }
      }
    );

    this.$createText({ $parent, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: JQueryEventObject)
  {
    ClientApp.setState(ClientApp.State.TERMS);
  }

  // ~ Overrides FormWindow.onEscapePressed().
  protected onEscapePressed()
  {
    this.backToLogin();
  }
}