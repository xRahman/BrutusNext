/*
  Part of BrutusNEXT

  Login form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {LocalStorage} from '../../../client/lib/storage/LocalStorage';
import {Connection} from '../../../client/lib/net/Connection';
import {Component} from '../../../client/gui/Component';
import {CredentialsForm} from '../../../client/gui/CredentialsForm';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';

import $ = require('jquery');

export class LoginForm extends CredentialsForm
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private $errorEmptyLine = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create({ $container = null }: { $container: JQuery; })
  {
    super.create({ $container: $container, name: 'login_form' });

    super.createLabel({ text: 'E-mail Address' });
    this.createEmailInput();
    this.createEmailProblemLabel();

    super.createLabel({ text: 'Password' });
    this.createPasswordInput();
    this.createPasswordProblemLabel();

    this.createErrorLabel();

    this.createRememberMeCheckbox();
    this.createButtons();
  }

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
        this.displayEmailProblem(response.problem);
        break;

      case LoginResponse.Result.INCORRECT_PASSWORD:
        this.displayPasswordProblem(response.problem);
        break;

      case LoginResponse.Result.FAILED_TO_LOAD_ACCOUNT:
        this.displayError(response.problem);
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
  }

  public getEmailInputValue()
  {
    return this.$emailInput.val();
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

  // ~ Overrides CredentialsForm.hideProblems().
  protected hideProblems()
  {
    super.hideProblems();
    this.$errorEmptyLine.hide();
  }

  // ~ Overrides CredentialsForm.createErrorLabel().
  protected createErrorLabel()
  {
    super.createErrorLabel();
    
    // Add an empty line after error problem label
    // to separate it from next component.
    this.$errorEmptyLine = this.createEmptyLine();
    this.$errorEmptyLine.hide();
  }

  // ~ Overrides CredentialsForm.displayError().
  protected displayError(problem: string)
  {
    super.displayError(problem);

    // Also show additional empty line.
    this.$errorEmptyLine.show();
  }

  // ---------------- Private methods -------------------

  private createButtons()
  {
    this.createSubmitButton({ $container: super.createButtonContainer() });
  }

  private setStoredEmailAddress()
  {
    let savedEmail = LocalStorage.read(LocalStorage.EMAIL_ENTRY);

    if (savedEmail)
      this.$emailInput.val(savedEmail);  
  }

  private setStoredPassword()
  {
    let savedPassword = LocalStorage.read(LocalStorage.PASSWORD_ENTRY);

    if (savedPassword)
      this.$passwordInput.val(savedPassword);
  }

  // ---------------- Event handlers --------------------

  // ~ Overrides Form.onSubmit().
  protected onSubmit(event: Event)
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
}