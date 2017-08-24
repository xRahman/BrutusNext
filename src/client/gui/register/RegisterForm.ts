/*
  Part of BrutusNEXT

  Register form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {MudColors} from '../../../client/gui/MudColors';
import {Connection} from '../../../client/lib/connection/Connection';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Windows} from '../../../client/gui/window/Windows';
import {Component} from '../../../client/gui/Component';
import {RegisterWindow} from '../../../client/gui/register/RegisterWindow';
import {Form} from '../../../client/gui/form/Form';
import {EmailInput} from '../../../client/gui/form/EmailInput';
import {PasswordInput} from '../../../client/gui/form/PasswordInput';
import {CredentialsForm} from '../../../client/gui/form/CredentialsForm';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

export class RegisterForm extends CredentialsForm
{
  constructor
  (
    protected parent: RegisterWindow,
    param: Component.FormParam = {}
  )
  {
    super
    (
      parent,
      Utils.applyDefaults(param, { name: 'register_form' })  
    );

    this.createEmailInput();
    this.createEmptyLine();
    this.createPasswordInput();
    this.createEmptyLine();
    this.createInfoLabel();
    this.createEmptyLine();
    this.createRememberMeCheckbox();
    this.createButtons();
  }

  // -------------- Static class data -------------------

  private static get RECOMMENDATION()
  {
    return MudColors.RECOMMENDATION_TEXT_COLOR
      + 'We strongly recommend that you use different'
      + ' password than on your e-mail account.';
  }

  // ----------------- Private data ---------------------

  private $infoLabel: JQuery = null;

  // ---------------- Public methods --------------------

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
        this.displayEmailProblem(response.getProblem());
        break;

      case RegisterResponse.Result.PASSWORD_PROBLEM:
        this.displayPasswordProblem(response.getProblem());
        break;

      case RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT:
        this.displayError(response.getProblem());
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
    // (password still has to be entered again).
    this.emailInput.setValue(email);

    if (!email)
      this.focusEmailInput();
    else
      this.focusPasswordInput();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides CredentialsForm.createEmailInput().
  protected createEmailInput()
  {
    if (this.emailInput)
    {
      ERROR("Component is not created because it already exists");
      return;
    }

    this.emailInput = new EmailInput
    (
      this,
      {
        labelParam: { text: 'Your E-mail Address' }
      }
    );
  }

  // ~ Overrides CredentialsForm.createPasswordInput().
  protected createPasswordInput()
  {
    if (this.passwordInput)
    {
      ERROR("Component is not created because it already exists");
      return;
    }

    this.passwordInput = new PasswordInput
    (
      this,
      {
        labelParam: { text: 'Your New Password' }
      }
    );
  }

  // ~ Overrides Form.createSubmitButton().
  protected $createSubmitButton(param: Component.SubmitButtonParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        text: 'Register',
        sCssClass: Form.LEFT_BUTTON_S_CSS_CLASS
      }
    );

    return super.$createSubmitButton(param);
  }

  // ~ Overrides Form.createRequest().
  protected createRequest()
  {
    let request = new RegisterRequest();

    request.email = this.emailInput.getValue();
    request.password = this.passwordInput.getValue();

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
    this.$infoLabel = super.$createLabel
    (
      { text: RegisterForm.RECOMMENDATION }
    );
  }

  private createButtons()
  {
    let $parent = super.createButtonContainer();

    this.$createSubmitButton({ $parent });
    this.createCancelButton({ $parent });
  }

  private createCancelButton(param: Component.ButtonParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Form.RIGHT_BUTTON_S_CSS_CLASS,
        text: 'Cancel',
        click: (event) => { this.onCancel(event); }
      }
    );

    return this.$createButton(param);
  }

  // ---------------- Event handlers --------------------

  protected onCancel(event: JQueryEventObject)
  {
    this.parent.backToLogin();
  }
}