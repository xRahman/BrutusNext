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
  protected static get SUBMIT_BUTTON_CSS_CLASS()
    { return 'LoginForm_SubmitButton'; }

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
  // -> Returns created jquery element.
  public create($container: JQuery)
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    // Maximum length of acocunt name (in characters).
    let minAccountNameLength = 3;
    let maxAccountNameLength = 20;
    let minPasswordLength = 4;
    let maxPasswordLength = 50;

    super.create($container, 'login_form');

    this.createLabel('Account Name');
    this.createAccountNameInput();

    this.createLabel('Password');
    this.createPasswordInput();
    
    this.createRememberMeCheckbox();
    this.createButtons();
  }

  // --------------- Protected methods ------------------

  // ~Overrides Form.createPasswordInput().
  protected createPasswordInput
  (
    name = 'password_input',
    placeholder = 'Enter Password',
    minLength = null,
    maxLength = null
  )
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    if (minLength === null)
      minLength = 4;

    if (maxLength === null)
      maxLength = 50;

    this.$passwordInput = super.createPasswordInput
    (
      name,
      placeholder,
      minLength,
      maxLength
    );

    return this.$passwordInput;
  }

  // ~Overrides Form.createSubmitButton().
  protected createSubmitButton
  (
    $container,
    text = 'Login',
    cssClass = LoginForm.SUBMIT_BUTTON_CSS_CLASS
  )
  {
    return super.createSubmitButton($container, text, cssClass);
  }

  // ---------------- Private methods -------------------

  private createAccountNameInput()
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    // Maximum length of acocunt name (in characters).
    let minLength = 3;
    let maxLength = 20;

    this.$accountNameInput = this.createTextInput
    (
      'account_name_input',   // 'name' attribute.
      'Enter Account Name',   // Placeholder text.
      minLength,
      maxLength
    );
  }

  private createRememberMeCheckbox()
  {
    this.$rememberMeCheckbox = this.createCheckboxInput
    (
      'remember_me_checkbox',   // 'name' attribute.
      'Remember me',            // Placeholder text.
      true                     // Checked.
    );
  }

  private createButtons()
  {
    let $container = this.createButtonContainer();

    this.createSubmitButton($container);
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