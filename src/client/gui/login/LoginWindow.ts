/*
  Part of BrutusNEXT

  Login window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {LoginForm} from '../../../client/gui/login/LoginForm';

export class LoginWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.LOGIN);
  }

  // ----------------- Public data ----------------------

  public form = new LoginForm();

  // ----------------- Private data ---------------------

  private $registerLink: JQuery = null;

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ windowParam: { name: 'login_window' }});

    this.setTitle("&gWelcome to &RBrutus&YNext");

    this.createLoginForm();

    this.createEmptyLine();

    this.createRegisterLink();
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

  private createLoginForm()
  {
    this.form.create({ $parent: this.$content });
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