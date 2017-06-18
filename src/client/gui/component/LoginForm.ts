/*
  Part of BrutusNEXT

  Login form.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Form} from '../../../client/gui/component/Form';

import $ = require('jquery');

export class LoginForm extends Form
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'login_form';

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
    let maxChars = 20;

    super.create($container, 'login_form');

    this.appendLabel('Account Name');
    this.$accountNameInput = this.appendTextInput
    (
      'account_name_input',   // 'name' attribute.
      {
        required: true,
        placeholder: 'Enter Account Name',
        maxlength: maxChars,
        autocapitalize: 'words',
        // 'autocomplete' value could be 'username' but we have 'remember me'
        // option so there is no need for it.
        autocomplete: 'off',
        autocorrect: 'off',
        spellcheck: false
      }
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
    this.appendSubmitButton
    (
      this.$form,
      'login_button',         // 'name' attribute.
      'Login'                 // Button text.
    );

    return this.$form;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

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