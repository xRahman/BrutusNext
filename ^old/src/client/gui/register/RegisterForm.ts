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
import {RegisterRequest} from
  '../../../shared/lib/protocol/SharedRegisterRequest';
import {RegisterRequest} from '../../../client/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../client/lib/protocol/RegisterResponse';

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
    this.$createEmptyLine();
    this.createPasswordInput();
    this.$createEmptyLine();
    this.createInfoLabel();
    this.$createEmptyLine();
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

  private $infoLabel: (JQuery | null) = null;

  // ---------------- Public methods --------------------

  // ! Throws an exception on error.
  public displayProblems(problems: Array<RegisterRequest.Problem>)
  {
    for (let problem of problems)
      this.displayProblem(problem);
  }

  // ~ Overrides CredentialsForm.onShow().
  public onShow()
  {
    super.onShow();

    if (Windows.loginWindow === null || Windows.loginWindow.form === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    let email = Windows.loginWindow.getForm().getEmailInputValue();

    if (email === null || this.emailInput === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

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
      ERROR("Email input already exists");

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
      ERROR("Password input already exists");

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
  // -> Returns 'null' if valid request couldn't be created.
  protected createRequest(): RegisterRequest | null
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
    
    let request = new RegisterRequest
    (
      this.emailInput.getValue(),
      this.passwordInput.getValue()
    );

    return request;
  }

  /// TODO: Tohle by nemělo mít side effect, safra
  /// (nebo by se to mělo jmenovat jinak).
  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: RegisterRequest)
  {
    let problem: RegisterRequest.Problem | "NO PROBLEM";

    if ((problem = request.checkEmail()) !== "NO PROBLEM")
    {
      this.displayEmailProblem(problem.message);
      return false;
    }

    if ((problem = request.checkPassword()) !== "NO PROBLEM")
    {
      this.displayPasswordProblem(problem.message);
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
    let $parent = super.$createButtonContainer();

    if ($parent === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

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
        click: (event: JQueryEventObject) => { this.onCancel(event); }
      }
    );

    return this.$createButton(param);
  }

    // ! Throws an exception on error.
  private displayProblem(problem: RegisterRequest.Problem)
  {
    switch (problem.type)
    {
      case RegisterRequest.ProblemType.EMAIL_PROBLEM:
        this.displayEmailProblem(problem.message);
        break;

      case RegisterRequest.ProblemType.PASSWORD_PROBLEM:
        this.displayPasswordProblem(problem.message);
        break;

      case RegisterRequest.ProblemType.ERROR:
        this.displayError(problem.message);
        break;

      default:
        throw new Error("Unhandled enum value");
    }
  }

  // ---------------- Event handlers --------------------

  protected onCancel(event: JQueryEventObject)
  {
    this.parent.backToLogin();
  }
}