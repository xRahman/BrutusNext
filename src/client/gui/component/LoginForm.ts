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
    this.appendSubmitButton(this.$form, 'login', 'Login');

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