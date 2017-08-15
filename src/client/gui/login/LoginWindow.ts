/*
  Part of BrutusNEXT

  Login window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {StandaloneFormWindow} from
  '../../../client/gui/window/StandaloneFormWindow';
import {LoginForm} from '../../../client/gui/login/LoginForm';

export class LoginWindow extends StandaloneFormWindow
{
  constructor()
  {
    super({ windowParam: { name: 'login_window' }});

    this.setTitle("&gWelcome to &RBrutus&YNext");

    this.createLoginForm();
    this.createEmptyLine();
    this.createRegisterLink();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.LOGIN);
  }

  // ----------------- Private data ---------------------

  private $registerLink: JQuery = null;

  // ---------------- Public methods --------------------

  // // ~ Overrides StandaloneWindow.create().
  // public create()
  // {
  //   super.create({ windowParam: { name: 'login_window' }});

  //   this.setTitle("&gWelcome to &RBrutus&YNext");

  //   this.createLoginForm();

  //   this.createEmptyLine();

  //   this.createRegisterLink();
  // }

  // ---------------- Private methods -------------------

  private createLoginForm()
  {
    this.form = new LoginForm(this, { $parent: this.$content });
  }

  private createRegisterLink()
  {
    let $parent = super.createTextContainer();

    this.createText({ $parent, text: "Don't have an account yet? " });

    this.$registerLink = this.createTextLink
    (
      {
        $parent,
        text: "Register",
        click: (event) => { this.onRegisterClick(event); }
      }
    );

    this.createText({ $parent, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onRegisterClick(event: JQueryEventObject)
  {
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}