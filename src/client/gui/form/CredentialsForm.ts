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
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
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

  protected emailInput: EmailInput = null;
  protected passwordInput: PasswordInput = null;
  protected rememberMeCheckbox: CheckboxInput = null;
  // protected $emailInput: JQuery = null;
  // protected $emailProblem: JQuery = null;
  // protected $passwordInput: JQuery = null;
  // protected $passwordProblem: JQuery = null;
  // protected $rememberMeCheckbox = null;

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
      ERROR("Component is not created because it already exists");
      return;
    }

    this.emailInput = new EmailInput(this);

    // this.emailInput = new EmailInput
    // (
    //   this,
    //   {
    //     inputParam:
    //     {
    //       placeholder: 'Enter E-mail Address'
    //     }
    //   }
    // );

    // this.$emailInput = super.createEmailInput
    // (
    //   {
    //     name: 'email_input',
    //     placeholder: 'Enter E-mail Address'
    //   }
    // );

    // return this.$emailInput;
  }

  // protected createEmailProblemNotice()
  // {
  //   this.$emailProblem = this.$createEmptyLine
  //   (
  //     { name: 'email_problem_notice'}
  //   );

  //   this.$emailProblem.hide();
  // }

  protected displayEmailProblem(problem: string)
  {
    // if (!this.emailInput)
    // {
    //   ERROR("Missing emailInput component. Problem is not displayed");
    //   return;
    // }

    this.emailInput.displayProblem(problem);

    // if (!this.$emailProblem)
    // {
    //   ERROR("Invalid $emailProblem element");
    //   return;
    // }

    // this.$createText
    // (
    //   {
    //     $parent: this.$emailProblem,
    //     text: MudColors.PROBLEM_TEXT_COLOR + problem,
    //     insertMode: Component.InsertMode.REPLACE
    //   }
    // );

    // this.$emailProblem.show();
    // this.focusEmailInput();
  }

  protected createPasswordInput()
  {
    if (this.passwordInput)
    {
      ERROR("Component is not created because it already exists");
      return;
    }

    this.passwordInput = new PasswordInput(this);

    // this.passwordInput = new PasswordInput
    // (
    //   this,
    //   {
    //     inputParam:
    //     {
    //       placeholder: 'Enter Password',
    //       /// We are not using automatic 'minLength' validation
    //       /// because it doesn't work if value is set to the
    //       /// input element by script.
    //       ///minLength: RegisterRequest.MIN_PASSWORD_LENGTH,
    //       maxLength: RegisterRequest.MAX_PASSWORD_LENGTH
    //     }
    //   }
    // );
  }

  // // ~ Overrides Form.createPasswordInput().
  // protected $createPasswordInput()
  // {
  //   this.$passwordInput = super.$createPasswordInput
  //   (
  //     {
  //       name: 'password_input',
  //       placeholder: 'Enter Password',
  //       /// We are not using automatic 'minLength' validation
  //       /// because it doesn't work if value is set to the
  //       /// input element by script.
  //       ///minLength: RegisterRequest.MIN_PASSWORD_LENGTH,
  //       maxLength: RegisterRequest.MAX_PASSWORD_LENGTH
  //     }
  //   );

  //   return this.$passwordInput;
  // }

  // protected createPasswordProblemNotice()
  // {
  //   this.$passwordProblem = this.$createEmptyLine
  //   (
  //     { name: 'password_problem_notice'}
  //   );

  //   this.$passwordProblem.hide();
  // }

  protected displayPasswordProblem(problem: string)
  {
    // if (!this.passwordInput)
    // {
    //   ERROR("Missing passwordInput component. Problem is not displayed");
    //   return;
    // }

    this.passwordInput.displayProblem(problem);

    // if (!this.$passwordProblem)
    // {
    //   ERROR("Invalid $passwordProblem element");
    //   return;
    // }

    // this.$createText
    // (
    //   {
    //     $parent: this.$passwordProblem,
    //     text: MudColors.PROBLEM_TEXT_COLOR + problem,
    //     insertMode: Component.InsertMode.REPLACE
    //   }
    // );

    // this.$passwordProblem.show();
    // this.focusPasswordInput();
  }

  protected createRememberMeCheckbox()
  {
    // Don't crete the checkbox if Html 5 local storage isn't available.
    if (!LocalStorage.isAvailable())
      return;

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
          change: (event) => { this.onRememberMeChange(event); }
        }
      }
    );

    // this.$rememberMeCheckbox = super.createCheckbox
    // (
    //   {
    //     checkboxParam:
    //     {
    //       name: 'remember_me_checkbox',
    //       checked: false,
    //       change: (event) => { this.onRememberMeChange(event); }
    //     },
    //     labelParam:
    //     {
    //       text: 'Remember me'
    //     }
    //   }
    // );
  }

  // ~ Overrides Form.hideProblems();
  protected hideProblems()
  {
    super.hideProblems();

    this.emailInput.hideProblem();
    this.emailInput.hideProblem();

    // if (this.$passwordInput)
    // {
    //   // this.createText
    //   // (
    //   //   {
    //   //     $parent: this.$emailProblem,
    //   //     text: Component.EMPTY_LINE_TEXT,
    //   //     insertMode: Component.InsertMode.REPLACE
    //   //   }
    //   // );

    //   this.$emailProblem.hide();
    // }

    // if (this.$passwordProblem)
    // {
    //   // this.createText
    //   // (
    //   //   {
    //   //     $parent: this.$passwordProblem,
    //   //     text: Component.EMPTY_LINE_TEXT,
    //   //     insertMode: Component.InsertMode.REPLACE
    //   //   }
    //   // );

    //   this.$passwordProblem.hide();
    // }
  }

  protected focusEmailInput()
  {
    // if (!this.emailInput)
    // {
    //   ERROR("Component emailInput doesn't exist so it won't be focused");
    //   return;
    // }

    this.emailInput.focus();

    // if (!this.$emailInput)
    // {
    //   ERROR("$emailInput doesn't exist so it won't be focused");
    //   return;
    // }

    // this.$emailInput.focus();
  }

  protected focusPasswordInput()
  {
    // if (!this.passwordInput)
    // {
    //   ERROR("Component passwordInput doesn't exist so it won't be focused");
    //   return;
    // }

    this.passwordInput.focus();

    // if (!this.$passwordInput)
    // {
    //   ERROR("$passwordInput doesn't exist so it won't be focused");
    //   return;
    // }

    // this.$passwordInput.focus();
  }

  // ---------------- Private methods -------------------

  private setStoredRememberMeValue()
  {
    let storedValue = LocalStorage.read(LocalStorage.REMEMBER_ME_ENTRY);

    this.rememberMeCheckbox.setChecked
    (
      storedValue === LocalStorage.REMEMBER_ME_VALUE
    );

    // this.$rememberMeCheckbox.prop
    // (
    //   'checked',
    //   rememberMe === LocalStorage.REMEMBER_ME_VALUE
    // );
  }

  // ---------------- Event handlers --------------------

  protected onRememberMeChange(event: JQueryEventObject)
  {
    if (!LocalStorage.isAvailable())
      return;

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