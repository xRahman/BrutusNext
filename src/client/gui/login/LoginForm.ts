/*
  Part of BrutusNEXT

  Login form.
*/

'use strict';

import {LocalStorage} from '../../../client/lib/storage/LocalStorage';
import {Connection} from '../../../client/lib/net/Connection';
import {Component} from '../../../client/gui/Component';
import {CredentialsForm} from '../../../client/gui/CredentialsForm';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';

import $ = require('jquery');

export class LoginForm extends CredentialsForm
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  ///private $accountNameInput = null;

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

  private createButtons()
  {
    this.createSubmitButton({ $container: super.createButtonContainer() });
  }

  // ---------------- Event handlers --------------------

  // ~ Overrides Form.onSubmit().
  protected onSubmit(event: Event)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    let packet = new LoginRequest();

    packet.email = this.$emailInput.val();
    packet.password = this.$passwordInput.val();

    Connection.send(packet);
  }

  // // ~ Overrides CrendentialsForm.onRememberMeChange().
  // protected onRememberMeChange(event: Event)
  // {
  //   this.$rememberMeCheckbox.prop('checked');
  // }
}