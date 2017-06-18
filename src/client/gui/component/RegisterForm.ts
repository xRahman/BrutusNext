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
  public create($container: JQuery)
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    // Maximum length of acocunt name (in characters).
    let maxChars = 20;

    super.create($container, 'register_form');

    this.appendLabel('Account Name');
    this.$accountNameInput = this.appendTextInput
    (
      'account_name_input',   // 'name' attribute.
      {
        required: true,
        placeholder: 'Enter Account Name',
        maxlength: maxChars,
        autocapitalize: 'words',
        autocomplete: 'off',
        autocorrect: 'off',
        spellcheck: false
      }
    );

    this.appendLabel('E-mail');
    this.$emailInput = this.appendEmailInput
    (
      'email_input',          // 'name' attribute.
      'Enter E-mail'          // Placeholder text.
    );

    this.appendLabel('Password');
    this.$passwordInput = this.appendPasswordInput
    (
      'password_input',       // 'name' attribute.
      'Enter Password'        // Placeholder text.
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

  // ~Overrides Form.appendSubmitButton().
  protected appendSubmitButton($container: JQuery, name: string, text: string)
  {
    let $button = super.appendSubmitButton($container, name, text);

    $button.addClass(RegisterForm.SUBMIT_BUTTON_CSS_CLASS);

    return $button;
  }

  // ---------------- Private methods -------------------

  private appendButtons()
  {
    let $container = this.createDiv
    (
      this.$form,
      RegisterForm.BUTTONS_CONTAINER_CSS_CLASS
    );

    this.appendSubmitButton
    (
      $container,
      'register_button',      // 'name' attribute.
      'Register'              // Button text.
    );

    this.appendCancelButton
    (
      $container,
      'Cancel'              // Button text.
    );
  }

  private appendCancelButton($container: JQuery, text: string)
  {
    let $button = this.createButton
    (
      $container,
      Form.BUTTON_CSS_CLASS,
      text,
      null    // No additional attributes.
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