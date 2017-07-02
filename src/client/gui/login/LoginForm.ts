/*
  Part of BrutusNEXT

  Login form.
*/

'use strict';

import {LocalStorage} from '../../../client/lib/storage/LocalStorage';
import {Connection} from '../../../client/lib/net/Connection';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';

import $ = require('jquery');

export class LoginForm extends Form
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  ///private $accountNameInput = null;
  private $emailInput: JQuery = null;
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

    // super.createLabel({ text: 'Account Name' });
    // this.createAccountNameInput();

    super.createLabel({ text: 'E-mail Address' });
    this.createEmailInput();

    this.createEmptyLine();

    super.createLabel({ text: 'Password' });
    this.createPasswordInput();

    this.createEmptyLine();
    
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
        placeholder: 'Enter E-mail Address'
      }
    );

    if (LocalStorage.isAvailable)
    {
      let savedEmail = LocalStorage.read(LocalStorage.EMAIL_ENTRY);

      if (savedEmail)
        this.$emailInput.val(savedEmail);
    }

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

    if (LocalStorage.isAvailable)
    {
      let savedPassword = LocalStorage.read(LocalStorage.PASSWORD_ENTRY);

      if (savedPassword)
        this.$passwordInput.val(savedPassword);
    }

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

  /// Deprecated.
  // private createAccountNameInput()
  // {
  //   /// TODO: Číst to ze stejné proměnné jako server a jako register form.
  //   // Maximum length of acocunt name (in characters).
  //   let minLength = 3;
  //   let maxLength = 20;

  //   this.$accountNameInput = super.createTextInput
  //   (
  //     {
  //       name: 'account_name_input',
  //       placeholder: 'Enter Account Name',
  //       minLength: minLength,
  //       maxLength: maxLength
  //     }
  //   );
  // }

  private createRememberMeCheckbox()
  {
    // Don't create 'Remember me' checkbox
    // if Html 5 local storage isn't available.
    if (Storage === undefined)
      return;

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

    let packet = new LoginRequest();

    packet.email = this.$emailInput.val();
    packet.password = this.$passwordInput.val();

    Connection.send(packet);
  }
}