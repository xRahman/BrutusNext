/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {StandaloneFormWindow} from
  '../../../client/gui/window/StandaloneFormWindow';
import {RegisterForm} from '../../../client/gui/register/RegisterForm';

export class RegisterWindow extends StandaloneFormWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.REGISTER);
  }

  // ----------------- Public data ----------------------

  public form = new RegisterForm();

  // ----------------- Private data ---------------------

  private $termsLink: JQuery = null;

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ windowParam: { name: 'register_window' }});

    this.setTitle("Create New Account");

    this.createRegisterForm();

    this.createEmptyLine();
    this.createTermsLink();
  }

  // ---------------- Private methods -------------------

  private createRegisterForm()
  {
    this.form.create({ $parent: this.$content });
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