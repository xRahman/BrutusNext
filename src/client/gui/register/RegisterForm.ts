/*
  Part of BrutusNEXT

  Register form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {MudColors} from '../../../client/gui/MudColors';
import {Connection} from '../../../client/lib/connection/Connection';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Windows} from '../../../client/gui/window/Windows';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/form/Form';
import {CredentialsForm} from '../../../client/gui/form/CredentialsForm';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

export class RegisterForm extends CredentialsForm
{
  private static get RECOMMENDATION()
  {
    return MudColors.RECOMMENDATION_TEXT_COLOR
      + 'We strongly recommend that you use different'
      + ' password than on your e-mail account.';
  }

  // ----------------- Private data ---------------------

  private $infoLabel: JQuery = null;

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create(param: Component.FormParam = {})
  {
    this.applyDefaults(param, { name: 'register_form' });

    super.create(param);

    super.createLabel({ text: 'Your E-mail Address' });
    this.createEmailInput();
    this.createEmailProblemNotice();

    super.createLabel({ text: 'Your New Password' });
    this.createPasswordInput();
    this.createPasswordProblemNotice();

    this.createInfoLabel();
    this.createEmptyLine();

    this.createRememberMeCheckbox();
    this.createButtons();
  }

  public displayProblem(response: RegisterResponse)
  {
    switch (response.result)
    {
      case RegisterResponse.Result.UNDEFINED:
        ERROR("Received register response with unspecified result."
          + " Someone problably forgot to set 'packet.result'"
          + " when sending register response from the server");
        break;

      case RegisterResponse.Result.EMAIL_PROBLEM:
        this.displayEmailProblem(response.problem);
        break;

      case RegisterResponse.Result.PASSWORD_PROBLEM:
        this.displayPasswordProblem(response.problem);
        break;

      case RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT:
        this.displayError(response.problem);
        break;

      case RegisterResponse.Result.OK:
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

    let email = Windows.loginWindow.form.getEmailInputValue();

    // Set value from login window e-mail input to our
    // email input so the user doesn't have to retype it
    // (password still has to be enterer again).
    this.$emailInput.val(email);

    if (!email)
      this.focusEmailInput();
    else
      this.focusPasswordInput();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createSubmitButton().
  protected createSubmitButton(param: Component.SubmitButtonParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        text: 'Register',
        sCssClass: Form.LEFT_BUTTON_S_CSS_CLASS
      }
    );

    return super.createSubmitButton(param);
  }

  // ~ Overrides Form.createRequest().
  protected createRequest()
  {
    let request = new RegisterRequest();

    request.email = this.$emailInput.val();
    request.password = this.$passwordInput.val();

    return request;
  }

  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: RegisterRequest)
  {
    let problem = null;

    if (problem = request.getEmailProblem())
    {
      this.displayEmailProblem(problem);
      return false;
    }

    if (problem = request.getPasswordProblem())
    {
      this.displayPasswordProblem(problem);
      return false;
    }

    return true;
  }

  // ---------------- Private methods -------------------

  private createInfoLabel()
  {
    this.$infoLabel = super.createLabel
    (
      { text: RegisterForm.RECOMMENDATION }
    );
  }

  private createButtons()
  {
    let $parent = super.createButtonContainer();

    this.createSubmitButton({ $parent });
    this.createCancelButton({ $parent });
  }

  private createCancelButton(param: Component.ButtonParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        sCssClass: Form.RIGHT_BUTTON_S_CSS_CLASS,
        text: 'Cancel',
        click: (event) => { this.onCancel(event); }
      }
    );

    return this.createButton(param);
  }

  // ---------------- Event handlers --------------------

  /// To be deleted.
  /*
  // ~ Overrides Form.onSubmit().
  protected onSubmit(event: JQueryEventObject)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    let request = this.createRequest();

    // Thanks to the shared code we don't have to
    // wait for server response to check for most
    // problems (the check will be done again on
    // the server of course to prevent exploits).
    if (!this.isRequestValid(request))
      return;

    // Disable submit button to prevent click-spamming
    // requests.
    this.disableSubmitButton();

    Connection.send(request);
  }
  */

  protected onCancel(event: JQueryEventObject)
  {
    ClientApp.setState(ClientApp.State.LOGIN);
  }
}