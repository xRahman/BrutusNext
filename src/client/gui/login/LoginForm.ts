/*
  Part of BrutusNEXT

  Login form.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Form} from '../../../client/gui/Form';

import $ = require('jquery');

export class LoginForm extends Form
{
  private static get CSS_CLASS()
    { return 'LoginForm'; }
  private static get LABEL_CSS_CLASS()
    { return 'LoginForm_Label'; }
  private static get INPUT_CSS_CLASS()
    { return 'LoginForm_Input'; }
  private static get CHECKBOX_CSS_CLASS()
    { return 'LoginForm_Checkbox'; }
  private static get CHECKBOX_CONTAINER_CSS_CLASS()
    { return 'LoginForm_CheckboxContainer'; }
  private static get SUBMIT_BUTTON_CSS_CLASS()
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

    super.create
    (
      $container,
      LoginForm.CSS_CLASS,
      'login_form'  // 'name' attribute.
    );

    this.createLabel('Account Name');
    this.createAccountNameInput();

    this.createLabel('Password');
    this.createPasswordInput();
    
    this.createRememberMeCheckbox();
    this.createSubmitButton();
  }

  // --------------- Protected methods ------------------

  // ~Overrides Form.createLabel().
  protected createLabel
  (
    text: string,
    cssClass = LoginForm.LABEL_CSS_CLASS
  )
  {
    return super.createLabel(text, cssClass);
  }

  // ~Overrides Form.createPasswordInput().
  protected createPasswordInput
  (
    name = 'password_input',
    placeholder = 'Enter Password',
    minLength = 0,
    maxLength = 0,
    cssClass = LoginForm.INPUT_CSS_CLASS
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
    $container = this.$form,
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
      maxLength,
      LoginForm.INPUT_CSS_CLASS
    );
  }

  private createRememberMeCheckbox()
  {
    this.$rememberMeCheckbox = this.createCheckboxInput
    (
      'remember_me_checkbox',   // 'name' attribute.
      'Remember me',            // Placeholder text.
      true,                     // Checked.
      LoginForm.CHECKBOX_CONTAINER_CSS_CLASS,
      LoginForm.LABEL_CSS_CLASS,
      LoginForm.CHECKBOX_CSS_CLASS
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