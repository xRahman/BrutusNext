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
import {LoginResponse} from '../../../client/lib/protocol/LoginResponse';

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
    this.$createEmptyLine();
    this.createPasswordInput();
    this.$createEmptyLine();
    this.createRememberMeCheckbox();
    this.createButtons();
  }

  // ---------------- Public methods --------------------

  public displayProblem(response: LoginResponse)
  {
    let problem = response.getProblem();

    if (problem === null)
      return;

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

  // -> Returns 'null' if email input value cannot be read.
  public getEmailInputValue()
  {
    if (!this.emailInput)
      return null;

    return this.emailInput.getValue();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createRequest().
  // -> Returns 'null' if request couldn't be created
  //    or there is nothing to request yet.
  protected createRequest(): LoginRequest | null
  {
    if (!this.emailInput)
    {
      ERROR("Failed to create request because 'emailInput'"
        + " component is missing");
      return null;
    }

    if (!this.passwordInput)
    {
      ERROR("Failed to create request because 'passwordInput'"
        + " component is missing");
      return null;
    }

    let email = this.emailInput.getValue();
    let password = this.passwordInput.getValue();
    let request = new LoginRequest(email, password);

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
    let $buttonContainer = this.$createButtonContainer();

    if (!$buttonContainer)
    {
      ERROR("Failed to create buttons in login form");
      return;
    }

    this.$createSubmitButton
    (
      {
        text: 'Login',
        $parent: $buttonContainer
      }
    );
  }

  private setStoredEmailAddress()
  {
    if (!this.emailInput)
    {
      ERROR("Failed to set stored email address because"
        + " email input component doesn't exist");
      return;
    }

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
}