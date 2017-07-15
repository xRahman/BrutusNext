/*
  Part of BrutusNEXT

  Register form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Connection} from '../../../client/lib/net/Connection';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {LocalStorage} from '../../../client/lib/storage/LocalStorage';
import {Windows} from '../../../client/gui/Windows';
import {Component} from '../../../client/gui/Component';
import {CredentialsForm} from '../../../client/gui/CredentialsForm';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

import $ = require('jquery');

export class RegisterForm extends CredentialsForm
{
  private static get RECOMMENDATION()
  {
    return '&YWe strongly recommend that you use different'
         + ' password than on your e-mail account.';
  }

  protected static get SUBMIT_BUTTON_S_CSS_CLASS()
    { return 'S_RegisterForm_SubmitButton'; }
  protected static get CANCEL_BUTTON_S_CSS_CLASS()
    { return 'S_RegisterForm_CancelButton'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private $infoLabel: JQuery = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create({ $container }: { $container: JQuery; })
  {
    super.create({ $container: $container, name: 'register_form' });

    super.createLabel({ text: 'Your E-mail Address' });
    this.createEmailInput();
    this.createEmailProblemLabel();

    super.createLabel({ text: 'Your New Password' });
    this.createPasswordInput();
    this.createPasswordProblemLabel();

    this.createErrorLabel();
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

    // Set value from login window e-mail input to our
    // email input so the user doesn't have to retype it
    // (password still has to be enterer again).
    this.$emailInput.val(Windows.loginWindow.getEmailInputValue());
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createSubmitButton().
  protected createSubmitButton({ $container }: { $container: JQuery; })
  {
    return super.createSubmitButton
    (
      {
        $container:  $container,
        text: 'Register',
        sCssClass: RegisterForm.SUBMIT_BUTTON_S_CSS_CLASS
      }
    );
  }

  // ~ Overrides CredentialsForm.hideProblemMessages().
  protected hideProblems()
  {
    super.hideProblems();
    this.showRecomendation();
  }

  // ~ Overrides CredentialsForm.displayError().
  protected displayError(problem: string)
  {
    super.displayError(problem);
    this.$infoLabel.hide();
  }

  // ---------------- Private methods -------------------

  private createInfoLabel()
  {
    this.$infoLabel = super.createLabel
    (
      { text: RegisterForm.RECOMMENDATION }
    );
  }

  private showRecomendation()
  {
    this.$infoLabel.show();
  }

  private createButtons()
  {
    let $container = super.createButtonContainer();

    this.createSubmitButton({ $container: $container });
    this.createCancelButton({ $container: $container });
  }

  private createCancelButton({ $container }: { $container: JQuery; })
  {
    let $button = this.createButton
    (
      {
        $container: $container,
        sCssClass: RegisterForm.CANCEL_BUTTON_S_CSS_CLASS,
        text: 'Cancel'
      }
    );

    $button.click
    (
      (event: Event) => { this.onCancel(event); }
    );

    return $button;
  }

  private isRequestValid(request: RegisterRequest)
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

  // ---------------- Event handlers --------------------

  // ~ Overrides Form.onSubmit().
  protected onSubmit(event: Event)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    let request = new RegisterRequest();

    request.email = this.$emailInput.val();
    request.password = this.$passwordInput.val();

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

  protected onCancel(event: Event)
  {
    ClientApp.setState(ClientApp.State.LOGIN);
  }
}