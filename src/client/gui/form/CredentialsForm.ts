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
  line in the form).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {MudColors} from '../../../client/gui/MudColors';
import {Component} from '../../../client/gui/Component';
import {LocalStorage} from '../../../client/lib/storage/LocalStorage';
import {RegisterRequest} from '../../../client/lib/protocol/RegisterRequest';
import {Form} from '../../../client/gui/form/Form';
import {EmailInput} from '../../../client/gui/form/EmailInput';
import {PasswordInput} from '../../../client/gui/form/PasswordInput';
import {CheckboxInput} from '../../../client/gui/form/CheckboxInput';

export abstract class CredentialsForm extends Form
{
  constructor 
  (
    parent: Component,
    param: Component.FormParam = {}
  )
  {
    super(parent, param);
  }

  // ---------------- Protected data --------------------

  protected emailInput: (EmailInput | null) = null;
  protected passwordInput: (PasswordInput | null) = null;
  protected rememberMeCheckbox: (CheckboxInput | null) = null;

  // ---------------- Public methods --------------------

  // ~ Overrides Component.onShow().
  public onShow()
  {
    super.onShow();

    this.enableSubmitButton();
    this.hideProblems();

    if (LocalStorage.isAvailable())
      this.setStoredRememberMeValue();
  }

  public rememberCredentials()
  {
    // Check if Html 5 local storage is available.
    if (!LocalStorage.isAvailable())
      return;

    if (!this.rememberMeCheckbox)
    {
      ERROR("Missing 'Remember Me' checkbox component");
      return;
    }

    if (!this.emailInput)
    {
      ERROR("Missing email input component");
      return;
    }

    if (!this.passwordInput)
    {
      ERROR("Missing password input component");
      return;
    }

    if (this.rememberMeCheckbox.isChecked())
    {
      LocalStorage.write
      (
        LocalStorage.EMAIL_ENTRY,
        this.emailInput.getValue()
      );

      /// TODO:
      /// Heslo by se asi pamatovat nemělo (rozhodně ne nezakryptované),
      /// ale pro účely ladění se mi to bude hodit.
      LocalStorage.write
      (
        LocalStorage.PASSWORD_ENTRY,
        this.passwordInput.getValue()
      );
    }
  }

  // --------------- Protected methods ------------------

  protected createEmailInput()
  {
    if (this.emailInput)
    {
      ERROR("Email input already exists. Not creating it again");
      return;
    }

    this.emailInput = new EmailInput(this);
  }

  protected displayEmailProblem(problem: string)
  {
    if (!this.emailInput)
    {
      ERROR("Missing email input component");
      return;
    }

    this.emailInput.displayProblem(problem);
  }

  protected createPasswordInput()
  {
    if (this.passwordInput)
    {
      ERROR("Password input already exists. Not creating it again");
      return;
    }

    this.passwordInput = new PasswordInput(this);
  }

  protected displayPasswordProblem(problem: string)
  {
    if (!this.passwordInput)
    {
      ERROR("Missing password input component");
      return;
    }

    this.passwordInput.displayProblem(problem);
  }

  protected createRememberMeCheckbox()
  {
    // Don't crete the checkbox if Html 5 local storage isn't available.
    if (!LocalStorage.isAvailable())
      return;

    if (this.rememberMeCheckbox !== null)
      ERROR("RememberMe checkbox already exists");

    this.rememberMeCheckbox = new CheckboxInput
    (
      this,
      {
        labelParam:
        {
          text: 'Remember me'
        },
        inputParam:
        {
          name: 'remember_me_checkbox',
          checked: false,
          change: (event: JQueryEventObject) =>
            { this.onRememberMeChange(event); }
        }
      }
    );
  }

  // ~ Overrides Form.hideProblems();
  protected hideProblems()
  {
    super.hideProblems();

    if (!this.emailInput)
    {
      ERROR("Missing email input component");
      return;
    }

    this.emailInput.hideProblem();

    if (!this.passwordInput)
    {
      ERROR("Missing password input component");
      return;
    }

    this.passwordInput.hideProblem();
  }

  protected focusEmailInput()
  {
    if (!this.emailInput)
    {
      ERROR("Missing email input component");
      return;
    }

    this.emailInput.focus();
  }

  protected focusPasswordInput()
  {
    if (!this.passwordInput)
    {
      ERROR("Missing password input component");
      return;
    }

    this.passwordInput.focus();
  }

  // ---------------- Private methods -------------------

  private setStoredRememberMeValue()
  {
    if (!this.rememberMeCheckbox)
    {
      ERROR("Missing 'Remember Me' checkbox component");
      return;
    }

    let storedValue = LocalStorage.read(LocalStorage.REMEMBER_ME_ENTRY);

    this.rememberMeCheckbox.setChecked
    (
      storedValue === LocalStorage.REMEMBER_ME_VALUE
    );
  }

  // ---------------- Event handlers --------------------

  protected onRememberMeChange(event: JQueryEventObject)
  {
    if (!LocalStorage.isAvailable())
      return;

    if (!this.rememberMeCheckbox)
    {
      ERROR("Missing 'Remember Me' checkbox component");
      return;
    }

    if (this.rememberMeCheckbox.isChecked())
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