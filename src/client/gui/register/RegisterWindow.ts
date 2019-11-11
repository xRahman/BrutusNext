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

  // --------------- Public accessors -------------------

  // ! Throws an exception on error.
  public getForm(): RegisterForm
  {
    if (!this.form)
      throw new Error("Register form doesn't exist");

    return this.form;
  }

  // ----------------- Private data ---------------------

  private $termsLink: (JQuery | null) = null;

  // ---------------- Protected data --------------------

  // ~ Overrides FormWindow.form.
  protected form: (RegisterForm | null) = null;

  // ---------------- Public methods --------------------

  public backToLogin()
  {
    ClientApp.switchToState(ClientApp.State.LOGIN);
  }

  // ---------------- Private methods -------------------

  private createRegisterForm()
  {
    if (this.form !== null)
      ERROR("Register form already exists");

    if (this.$content === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    this.form = new RegisterForm
    (
      this,
      { $parent: this.$content }
    );
  }

  private createTermsLink()
  {
    let $parent = this.createTextContainer();

    if ($parent === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    this.$createText
    (
      { $parent, text: "By creating an account you agree to our " }
    );

    this.$termsLink = this.$createTextLink
    (
      {
        $parent,
        text: "Terms of Use",
        click: (event: JQueryEventObject) => { this.onTermsClick(event); }
      }
    );

    this.$createText({ $parent, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: JQueryEventObject)
  {
    ClientApp.switchToState(ClientApp.State.TERMS);
  }

  // ~ Overrides FormWindow.onEscapePressed().
  protected onEscapePressed()
  {
    this.backToLogin();
  }
}