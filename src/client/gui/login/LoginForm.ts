/*
  Part of BrutusNEXT

  Login form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {LocalStorage} from '../../../client/lib/storage/LocalStorage';
import {Connection} from '../../../client/lib/connection/Connection';
import {Component} from '../../../client/gui/Component';
import {CredentialsForm} from '../../../client/gui/form/CredentialsForm';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';

export class LoginForm extends CredentialsForm
{
  constructor(parent: Component, param: Component.FormParam = {})
  {
    super
    (
      parent,
      Utils.applyDefaults(param, { name: 'login_form' })  
    );

    this.createEmailInput();

    // this.$createLabel({ text: 'E-mail Address' });
    // this.$createEmailInput();
    // this.createEmailProblemNotice();

    this.$createEmptyLine();

    this.createPasswordInput();

    // this.$createLabel({ text: 'Password' });
    // this.$createPasswordInput();
    // this.createPasswordProblemNotice();

    this.$createEmptyLine();

    this.createRememberMeCheckbox();
    this.createButtons();
  }

  // ---------------- Public methods --------------------

  // // ~ Overrides Form.create().
  // public create(param: Component.FormParam = {})
  // {
  //   this.applyDefaults(param, { name: 'login_form' });

  //   super.create(param);

  //   super.createLabel({ text: 'E-mail Address' });
  //   this.createEmailInput();
  //   this.createEmailProblemNotice();

  //   this.createEmptyLine();

  //   super.createLabel({ text: 'Password' });
  //   this.createPasswordInput();
  //   this.createPasswordProblemNotice();

  //   this.createEmptyLine();

  //   this.createRememberMeCheckbox();
  //   this.createButtons();
  // }

  public displayProblem(response: LoginResponse)
  {
    switch (response.result)
    {
      case LoginResponse.Result.UNDEFINED:
        ERROR("Received login response with unspecified result."
          + " Someone problably forgot to set 'packet.result'"
          + " when sending login response from the server");
        break;

      case LoginResponse.Result.UNKNOWN_EMAIL:
        this.displayEmailProblem(response.getProblem());
        break;

      case LoginResponse.Result.INCORRECT_PASSWORD:
        this.displayPasswordProblem(response.getProblem());
        break;

      case LoginResponse.Result.FAILED_TO_LOAD_ACCOUNT:
        this.displayError(response.getProblem());
        break;

      case LoginResponse.Result.OK:
        ERROR("displayProblem() called with 'Result: OK'");
        break;

      default:
        ERROR("Unknown register response result");
        break;
    }
  }

  // ~ Overrides CredentialsForm.onShow().
  public onShow()
  {
    super.onShow();

    if (LocalStorage.isAvailable())
    {
      this.setStoredEmailAddress();
      this.setStoredPassword();
    }

    this.focusEmailInput();
  }

  public getEmailInputValue()
  {
    return this.emailInput.getValue();
  }

  // --------------- Protected methods ------------------

  // // ~ Overrides Form.createSubmitButton().
  // protected $createSubmitButton(param: Component.SubmitButtonParam = {})
  // {
  //   Utils.applyDefaults(param, { text: 'Login' });

  //   return super.$createSubmitButton(param);
  // }

  // ~ Overrides Form.createRequest().
  protected createRequest()
  {
    let request = new LoginRequest();

    request.email = this.emailInput.getValue();
    request.password = this.passwordInput.getValue();

    return request;
  }

  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: LoginRequest)
  {
    // We don't validate login request on the client
    // because rules of email and password creation
    // might change in time and if we enforced new
    // ones here, players who created accounts under
    // old rules might be unable to log in.
    return true;
  }

  // ---------------- Private methods -------------------

  private createButtons()
  {
    this.$createSubmitButton
    (
      {
        text: 'Login',
        $parent: this.createButtonContainer()
      }
    );
  }

  private setStoredEmailAddress()
  {
    let savedEmail = LocalStorage.read(LocalStorage.EMAIL_ENTRY);

    if (savedEmail)
      this.emailInput.setValue(savedEmail);
  }

  private setStoredPassword()
  {
    let savedPassword = LocalStorage.read(LocalStorage.PASSWORD_ENTRY);

    if (savedPassword)
      this.passwordInput.setValue(savedPassword);
  }

  // ---------------- Event handlers --------------------

  /// To be deleted.
  /*
  // ~ Overrides Form.onSubmit().
  protected onSubmit(event: JQueryEventObject)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    let request = new LoginRequest();

    request.email = this.$emailInput.val();
    request.password = this.$passwordInput.val();

    // Disable submit button to prevent click-spamming
    // requests.
    this.disableSubmitButton();

    Connection.send(request);
  }
  */
}