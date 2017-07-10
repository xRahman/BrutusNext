/*
  Part of BrutusNEXT

  Abstract ancestor of forms that collect user credentials.
*/

/*
  Implementation note: We use empty lines (<span><br/></span>)
  instead of margins because the actual height of a line of text
  is neither font size nor line height. That means that it would
  be difficult to set margin value to be the same as height of
  a line of text (which is sometimes shown in place of an empty
  line.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {Component} from '../../client/gui/Component';
import {LocalStorage} from '../../client/lib/storage/LocalStorage';
import {RegisterRequest} from '../../shared/lib/protocol/RegisterRequest';
import {Form} from '../../client/gui/Form';

import $ = require('jquery');

export abstract class CredentialsForm extends Form
{
  // -------------- Static class data -------------------

  protected static get PROBLEM_TEXT_COLOR() { return '&R'; }

  //----------------- Protected data --------------------

  protected $emailInput: JQuery = null;
  protected $emailProblem: JQuery = null;
  protected $passwordInput: JQuery = null;
  protected $passwordProblem: JQuery = null;
  protected $errorLabel: JQuery = null;
  protected $rememberMeCheckbox = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Form.onShow().
  public onShow()
  {
    super.onShow();

    this.enableSubmitButton();
    this.hideProblems();

    if (LocalStorage.isAvailable())
      this.setStoredRememberMeValue();
  }

  // ~ Overrides Form.onHide().
  public onHide() {}

  public rememberCredentials()
  {
    // Check if Html 5 local storage is available.
    if (!LocalStorage.isAvailable())
      return;

    if (this.$rememberMeCheckbox.prop('checked'))
    {
      LocalStorage.write
      (
        LocalStorage.EMAIL_ENTRY,
        this.$emailInput.val()
      );

      /// TODO:
      /// Heslo by se asi pamatovat nemělo (rozhodně ne nezakryptované),
      /// ale pro účely ladění se mi to bude hodit.
      LocalStorage.write
      (
        LocalStorage.PASSWORD_ENTRY,
        this.$passwordInput.val()
      );
    }
  }

  public onReceivedResponse()
  {
    this.hideProblems();
    this.enableSubmitButton();
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

    return this.$emailInput;
  }

  protected createEmailProblemLabel()
  {
    this.$emailProblem = super.createLabel
    (
      { text: Component.EMPTY_LINE_TEXT }
    );
  }

  protected displayEmailProblem(problem: string)
  {
    if (!this.$emailProblem)
    {
      ERROR("Invalid $emailProblem element");
      return;
    }

    Component.setText
    (
      this.$emailProblem,
      CredentialsForm.PROBLEM_TEXT_COLOR + problem
    );

    this.$emailProblem.show();
  }

  // ~ Overrides Form.createPasswordInput().
  protected createPasswordInput()
  {
    this.$passwordInput = super.createPasswordInput
    (
      {
        name: 'password_input',
        placeholder: 'Enter Password',
        minLength: RegisterRequest.MIN_PASSWORD_LENGTH,
        maxLength: RegisterRequest.MAX_PASSWORD_LENGTH
      }
    );

    return this.$passwordInput;
  }

  protected createPasswordProblemLabel()
  {
    this.$passwordProblem = super.createLabel
    (
      { text: Component.EMPTY_LINE_TEXT }
    );
  }

  protected displayPasswordProblem(problem: string)
  {
    if (!this.$passwordProblem)
    {
      ERROR("Invalid $passwordProblem element");
      return;
    }

    Component.setText
    (
      this.$passwordProblem,
      CredentialsForm.PROBLEM_TEXT_COLOR + problem
    );

    this.$passwordProblem.show();
  }

  protected createErrorLabel()
  {
    this.$errorLabel = this.createLabel({});
    this.$errorLabel.hide();
  }

  protected createRememberMeCheckbox()
  {
    // Don't crete the checkbox if Html 5 local storage isn't available.
    if (!LocalStorage.isAvailable())
      return;

    this.$rememberMeCheckbox = super.createCheckboxInput
    (
      {
        name: 'remember_me_checkbox',
        text: 'Remember me',
        checked: false
      }
    );

    this.$rememberMeCheckbox.change
    (
      (event: Event) => { this.onRememberMeChange(event); }
    );
  }

  protected displayError(problem: string)
  {
    Component.setText
    (
      this.$errorLabel,
      CredentialsForm.PROBLEM_TEXT_COLOR + problem
    );

    this.$errorLabel.show();
  }

  protected hideProblems()
  {
    if (this.$emailProblem)
    {
      Component.setText
      (
        this.$emailProblem,
        Component.EMPTY_LINE_TEXT
      );
    }

    if (this.$passwordProblem)
    {
      Component.setText
      (
        this.$passwordProblem,
        Component.EMPTY_LINE_TEXT
      );
    }

    if (this.$errorLabel)
      this.$errorLabel.hide();
  }

  protected disableSubmitButton()
  {
     if (this.$submitButton)
       this.$submitButton.prop('disabled', true);
  }

  protected enableSubmitButton()
  {
    if (this.$submitButton)
      this.$submitButton.prop('disabled', false);
  }

  // ---------------- Private methods -------------------

  private setStoredRememberMeValue()
  {
    let rememberMe = LocalStorage.read(LocalStorage.REMEMBER_ME_ENTRY);

    this.$rememberMeCheckbox.prop
    (
      'checked',
      rememberMe === LocalStorage.REMEMBER_ME_VALUE
    );
  }

  // ---------------- Event handlers --------------------

  protected onRememberMeChange(event: Event)
  {
    if (!LocalStorage.isAvailable())
      return;

    if (this.$rememberMeCheckbox.prop('checked') === true)
    {
      // When user checks 'remember me' checkbox,
      // save information that the checkbox should
      // be checked next time the app is run.
      LocalStorage.write
      (
        LocalStorage.REMEMBER_ME_ENTRY,
        LocalStorage.REMEMBER_ME_VALUE
      );
    }
    else
    {
      // When user unchecks 'remember me' checkbox,
      // delete all relevant saved data.
      LocalStorage.delete(LocalStorage.REMEMBER_ME_ENTRY);
      LocalStorage.delete(LocalStorage.EMAIL_ENTRY);
      LocalStorage.delete(LocalStorage.PASSWORD_ENTRY);
    }
  }
}