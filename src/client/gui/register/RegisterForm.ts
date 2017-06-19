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
  private static get CSS_CLASS()
    { return 'RegisterForm'; }
  private static get LABEL_CSS_CLASS()
    { return 'RegisterForm_Label'; }
  private static get INPUT_CSS_CLASS()
    { return 'RegisterForm_Input'; }
  private static get CHECKBOX_CSS_CLASS()
    { return 'RegisterForm_Checkbox'; }
  private static get CHECKBOX_CONTAINER_CSS_CLASS()
    { return 'RegisterForm_CheckboxContainer'; }
  private static get SUBMIT_BUTTON_CSS_CLASS()
    { return 'RegisterForm_SubmitButton'; }
  private static get CANCEL_BUTTON_CSS_CLASS()
    { return 'RegisterForm_CancelButton'; }
  private static  get BUTTONS_CONTAINER_CSS_CLASS()
    { return 'RegisterForm_ButtonsContainer'; }

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
  // -> Returns created jquery element.
  public create($container: JQuery)
  {
    super.create
    (
      $container,
      RegisterForm.CSS_CLASS,
      'register_form'   // 'name' attribute.
    );

    this.createLabel('Account Name');
    this.createAccountNameInput();

    this.createLabel('E-mail');
    this.createEmailInput();

    this.createLabel('Password');
    this.createPasswordInput();

    this.createRememberMeCheckbox();
    this.createButtons();
  }

  // --------------- Protected methods ------------------

  // ~Overrides Form.createLabel().
  protected createLabel
  (
    text: string,
    cssClass = RegisterForm.LABEL_CSS_CLASS
  )
  {
    return super.createLabel(text, cssClass);
  }

  // ~Overrides Form.createEmailInput().
  protected createEmailInput
  (
    name = 'email_input',
    placeholder = 'Enter E-mail',
    cssClass = RegisterForm.INPUT_CSS_CLASS
  )
  {
    this.$emailInput = super.createEmailInput(name, placeholder, cssClass);

    return this.$emailInput;
  }

  // ~Overrides Form.createPasswordInput().
  protected createPasswordInput
  (
    name = 'password_input',
    placeholder = 'Enter Password',
    minLength = 0,
    maxLength = 0,
    cssClass = RegisterForm.INPUT_CSS_CLASS
  )
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    minLength = 4;
    maxLength = 50;

    this.$passwordInput = this.createPasswordInput
    (
      name,
      placeholder,
      minLength,
      maxLength,
      cssClass
    );

    return this.$passwordInput;
  }

  // ~Overrides Form.createSubmitButton().
  protected createSubmitButton
  (
    $container,
    text = 'Register',
    cssClass = RegisterForm.SUBMIT_BUTTON_CSS_CLASS
  )
  {
    return super.createSubmitButton($container, text, cssClass);
  }

  // ---------------- Private methods -------------------

  private createRememberMeCheckbox()
  {
    this.$rememberMeCheckbox = this.createCheckboxInput
    (
      'remember_me_checkbox',   // 'name' attribute.
      'Remember me',            // Placeholder text.
      true,                     // Checked.
      RegisterForm.CHECKBOX_CONTAINER_CSS_CLASS,
      RegisterForm.LABEL_CSS_CLASS,
      RegisterForm.CHECKBOX_CSS_CLASS
    );
  }

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
      maxLength,
      RegisterForm.INPUT_CSS_CLASS
    );
  }

  private createButtons()
  {
    let $container = Component.createDiv
    (
      this.$form,
      RegisterForm.BUTTONS_CONTAINER_CSS_CLASS
    );

    this.createSubmitButton($container);
    this.createCancelButton($container);
  }

  private createCancelButton($container: JQuery)
  {
    let $button = Component.createButton
    (
      $container,
      RegisterForm.CANCEL_BUTTON_CSS_CLASS,
      'Cancel'   // Button text.
    );

    $button.click
    (
      (event: Event) => { this.onCancel(event); }
    );

    $button.addClass(RegisterForm.CANCEL_BUTTON_CSS_CLASS);

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