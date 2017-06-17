/*
  Part of BrutusNEXT

  Register form.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Form} from '../../../client/gui/component/Form';

import $ = require('jquery');

export class RegisterForm extends Form
{
  protected static get SUBMIT_BUTTON_CSS_CLASS()
  {
    return 'RegisterFormSubmitButton';
  }

  protected static get CANCEL_BUTTON_CSS_CLASS()
  {
    return 'RegisterFormCancelButton';
  }

  protected static  get BUTTONS_CONTAINER_CSS_CLASS()
  {
    return 'RegisterFormButtonsContainer';
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'register_form';

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
  public create()
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    // Maximum length of acocunt name (in characters).
    let maxChars = 20;

    super.create(this.id);

    this.appendLabel('account_name_label', 'Account Name');
    this.$accountNameInput = this.appendTextInput
    (
      'account_name_input',
      'Enter Account Name',
      maxChars
    );

    this.appendLabel('email_label', 'E-mail');
    this.$emailInput = this.appendEmailInput
    (
      'email_input',
      'Enter E-mail'
    );

    this.appendLabel('password_label', 'Password');
    this.$passwordInput = this.appendPasswordInput
    (
      'password_input',
      'Enter Password'
    );

    this.$rememberMeCheckbox = this.appendCheckboxInput
    (
      'remember_me_checkbox',
      'Remember me',
      true  // Checked.
    );

    this.appendButtons();

    return this.$form;
  }

  // --------------- Protected methods ------------------

  protected appendSubmitButton($container: JQuery)
  {
    let $button = super.appendSubmitButton
    (
      $container,
      'register',
      'Register'
    );

    $button.addClass(RegisterForm.SUBMIT_BUTTON_CSS_CLASS);

    return $button;
  }

  // ---------------- Private methods -------------------

  private appendButtons()
  {
    let $container = this.createDiv
    (
      null, // No id.
      RegisterForm.BUTTONS_CONTAINER_CSS_CLASS
    );

    this.appendSubmitButton($container);

    let $cancelButton = this.appendCancelButton($container);
    $cancelButton.addClass(RegisterForm.CANCEL_BUTTON_CSS_CLASS);

    this.$form.append($container);
  }

  private appendCancelButton($container: JQuery)
  {
    let $button = this.createButton
    (
      null, // No id.
      Form.BUTTON_CSS_CLASS
    );

    $button.text("Cancel");

    $button.click
    (
      (event: Event) => { this.onCancel(event); }
    );

    $button.addClass(RegisterForm.CANCEL_BUTTON_CSS_CLASS);

    $container.append($button);

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