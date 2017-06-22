/*
  Part of BrutusNEXT

  Register form.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';

import $ = require('jquery');

export class RegisterForm extends Form
{
  protected static get SUBMIT_BUTTON_S_CSS_CLASS()
    { return 'S_RegisterForm_SubmitButton'; }
  protected static get CANCEL_BUTTON_S_CSS_CLASS()
    { return 'S_RegisterForm_CancelButton'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------


  //------------------ Private data ---------------------

  private $accountNameInput = null;
  private $emailInput = null;
  private $passwordInput = null;
  private $rememberMeCheckbox = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create({ $container }: { $container: JQuery; })
  {
    super.create({ $container: $container, name: 'register_form' });

    super.createLabel({ text: 'Account Name' });
    this.createAccountNameInput();

    super.createLabel({ text: 'E-mail' });
    this.createEmailInput();

    super.createLabel({ text: 'Password' });
    this.createPasswordInput();

    this.createRememberMeCheckbox();
    this.createButtons();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createEmailInput().
  protected createEmailInput()
  {
    this.$emailInput = super.createEmailInput
    (
      {
        name: 'email_input',
        placeholder: 'Enter E-mail'
      }
    );

    return this.$emailInput;
  }

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
        $container:  $container,
        text: 'Register',
        sCssClass: RegisterForm.SUBMIT_BUTTON_S_CSS_CLASS
      }
    );
  }

  // ---------------- Private methods -------------------

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
        placeholder: 'Enter Account Name',   // Placeholder text.
        minLength: minLength,
        maxLength: maxLength
      }
    );
  }

  private createButtons()
  {
    let $container = super.createButtonContainer();

    this.createSubmitButton({ $container: $container });
    this.createCancelButton({ $container: $container });
  }

  private createCancelButton({ $container }: { $container: JQuery; })
  {
    let $button = Component.createButton
    (
      {
        $container: $container,
        sCssClass: RegisterForm.CANCEL_BUTTON_S_CSS_CLASS,
        text: 'Cancel'
      }
    );

    $button.click
    (
      (event: Event) => { this.onCancel(event); }
    );

    return $button;
  }

  // ---------------- Event handlers --------------------

  protected onSubmit(event: Event)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    console.log("Submit (acc_name: " + this.$accountNameInput.val() + ","
      +" passwd: " + this.$passwordInput.val() + " )");
  }

  protected onCancel(event: Event)
  {
    // We will handle the form submit ourselves.
    //event.preventDefault();

    ClientApp.setState(ClientApp.State.LOGIN);
  }
}