/*
  Part of BrutusNEXT

  Login form.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';

import $ = require('jquery');

export class LoginForm extends Form
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private $accountNameInput = null;
  private $passwordInput = null;
  private $rememberMeCheckbox = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create({ $container = null }: { $container: JQuery; })
  {
    super.create({ $container: $container, name: 'login_form' });

    super.createLabel({ text: 'Account Name' });
    this.createAccountNameInput();

    super.createLabel({ text: 'Password' });
    this.createPasswordInput();
    
    this.createRememberMeCheckbox();
    this.createButtons();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createPasswordInput().
  protected createPasswordInput()
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    let minLength = 4;
    let maxLength = 50;

    this.$passwordInput = super.createPasswordInput
    (
      {
        name: 'password_input',
        placeholder: 'Enter Password',
        minLength: minLength,
        maxLength: maxLength
      }
    );

    return this.$passwordInput;
  }

  // ~ Overrides Form.createSubmitButton().
  protected createSubmitButton({ $container }: { $container: JQuery; })
  {
    return super.createSubmitButton
    (
      {
        $container: $container,
        text: 'Login',
        sCssClass: Component.FULL_WIDTH_BUTTON_S_CSS_CLASS
      }
    );
  }

  // ---------------- Private methods -------------------

  private createAccountNameInput()
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    // Maximum length of acocunt name (in characters).
    let minLength = 3;
    let maxLength = 20;

    this.$accountNameInput = super.createTextInput
    (
      {
        name: 'account_name_input',
        placeholder: 'Enter Account Name',
        minLength: minLength,
        maxLength: maxLength
      }
    );
  }

  private createRememberMeCheckbox()
  {
    this.$rememberMeCheckbox = super.createCheckboxInput
    (
      {
        name: 'remember_me_checkbox',
        text: 'Remember me',
        checked: true
      }
    );
  }

  private createButtons()
  {
    this.createSubmitButton
    (
      {
        $container: super.createButtonContainer()
      }
    );
  }

  // ---------------- Event handlers --------------------

  protected onSubmit(event: Event)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    console.log("Submit (acc_name: " + this.$accountNameInput.val() + ","
      +" passwd: " + this.$passwordInput.val() + " )");

    ClientApp.setState(ClientApp.State.IN_GAME);
  }
}