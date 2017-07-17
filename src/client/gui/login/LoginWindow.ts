/*
  Part of BrutusNEXT

  Login window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {LoginForm} from '../../../client/gui/login/LoginForm';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';

export class LoginWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.LOGIN);
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private form = new LoginForm();

  private $registerLink: JQuery = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ windowParam: { name: 'login_window' }});

    this.setTitle("&gWelcome to &RBrutus&YNext");

    // Create login form.
    this.form.create({ $parent: this.$content });

    this.createEmptyLine();

    this.createRegisterLink();
  }

  public displayProblem(response: LoginResponse)
  {
    this.form.displayProblem(response);
  }

  public onReceivedResponse()
  {
    this.form.onReceivedResponse();
  }

  public loginSucceeded()
  {
    this.form.rememberCredentials();
  }

  public getEmailInputValue()
  {
    return this.form.getEmailInputValue();
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

  private createRegisterLink()
  {
    let $parent = super.createTextContainer();

    this.createText({ $parent, text: "Don't have an account yet? " });

    this.$registerLink = this.createTextLink
    (
      {
        $parent,
        text: "Register",
        click: (event: MouseEvent) => { this.onRegisterClick(event); }
      }
    );

    this.createText({ $parent, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onRegisterClick(event: MouseEvent)
  {
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}