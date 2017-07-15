/*
  Part of BrutusNEXT

  Login window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {Form} from '../../../client/gui/Form';
import {LoginForm} from '../../../client/gui/login/LoginForm';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';

import $ = require('jquery');

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

  private $registerLink = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create();

    this.setTitle("&gWelcome to &RBrutus&YNext");

    // Create login form.
    this.form.create({ $parent: this.$content });

    this.createEmptyLine();

    this.createRegisterLink();

    return this.$window;
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

  // private appendRegisterLink($container: JQuery, text: string)
  // {
  //   //this.$registerLink = Component.appendTextLink($container, text);
  //   this.$registerLink = this.createTextLink
  //   (
  //     {
  //       $parent,
  //       text,
  //       insertMode: Component.InsertMode.APPEND
  //     }
  //   );

  //   this.$registerLink.click
  //   (
  //     (event: Event) => { this.onRegisterClick(event); }
  //   );
  // }

  private createRegisterLink()
  {
    let $parent = super.createLinkContainer();

    this.createText({ $parent, text: "Don't have an account yet? " });

    this.$registerLink = this.createTextLink
    (
      {
        $parent,
        text: "Register",
        click: (event: Event) => { this.onRegisterClick(event); }
      }
    );

    // this.$registerLink.click
    // (
    //   (event: Event) => { this.onRegisterClick(event); }
    // );

    this.createText({ $parent, text: "." });
  }

  // ---------------- Event handlers --------------------

  private onRegisterClick(event: Event)
  {
    console.log("Clicked on register link");
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}