/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';

export class RegisterWindow extends StandaloneWindow
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

  private $termsLink: JQuery = null;

  // ----------------- Public data ---------------------- 

  public form: RegisterForm = null;

  // ---------------- Public methods --------------------

  // // ~ Overrides StandaloneWindow.create().
  // public create()
  // {
  //   super.create({ windowParam: { name: 'register_window' }});

  //   this.setTitle("Create New Account");

  //   this.createRegisterForm();

  //   this.createEmptyLine();
  //   this.createTermsLink();
  // }

  // ---------------- Private methods -------------------

  private createRegisterForm()
  {
    this.form = new RegisterForm
    (
      this,
      { $parent: this.$content }
    );
  }

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
        click: (event) => { this.onTermsClick(event); }
      }
    );

    this.createText({ $parent, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onTermsClick(event: JQueryEventObject)
  {
    ClientApp.setState(ClientApp.State.TERMS);
  }
}