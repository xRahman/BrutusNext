/*
  Part of BrutusNEXT

  Form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Connection} from '../../../client/lib/connection/Connection';
import {MudColors} from '../../../client/gui/MudColors';
import {Component} from '../../../client/gui/Component';
import {Request} from '../../../shared/lib/protocol/Request';

export abstract class Form extends Component
{
  constructor
  (
    parent: Component,
    param: Component.FormParam = {}
  )
  {
    super(parent);

    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        submit: (event: JQueryEventObject) => { this.onSubmit(event); }
      }
    );

    this.$element = this.$createForm(param);

    this.createErrorLabel();
  }

  // -------------- Static class data -------------------

  public static get TEXT_S_CSS_CLASS()
    { return 'S_Form_Text'; }
  public static get ERROR_TEXT_CONTAINER_S_CSS_CLASS()
    { return 'S_Form_ErorTextContainer'; }
  protected static  get LEFT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_LeftButton'; }
  protected static  get RIGHT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_RightButton'; }

  // ---------------- Protected data --------------------

  protected $submitButton: (JQuery | null) = null;
  protected $errorLabel: (JQuery | null) = null;
  protected $errorLabelContainer: (JQuery | null) = null;

  // ----------------- Private data ---------------------

  public reset()
  {
    if (!this.$element)
    {
      ERROR("Unable to reset form because it does't have"
        + " a corresponding element in DOM");
      return;
    }

    let form = <HTMLFormElement>this.$element[0];

    form.reset();
  }

  public submit()
  {
    if (!this.$element)
    {
      ERROR("Unable to submit form because it does't have"
        + " a corresponding element in DOM");
      return;
    }

    this.$element.submit();
  }

  // --------------- Protected methods ------------------

  protected $createButtonContainer
  (
    param: Component.DivParam = {}
  )
  : JQuery | null
  {
    if (!this.$element)
    {
      ERROR("Invalid $element");
      return null;
    }

    Utils.applyDefaults
    (
      param,
      {
        name: 'button_container',
        $parent: this.$element,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS
      }
    );

    return this.$createDiv(param);
  }

  protected $createSubmitButton
  (
    param: Component.SubmitButtonParam = {}
  )
  : JQuery | null
  {
    Utils.applyDefaults
    (
      param,
      { sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS }
    );

    this.$submitButton = super.$createSubmitButton(param);

    return this.$submitButton;
  }

  // ~ Overrides Component.$createEmptyLine().
  protected $createEmptyLine
  (
    param: Component.DivParam = {}
  )
  : JQuery | null
  {
    if (!this.$element)
    {
      ERROR("Unable to create empty line in form because the"
        + " form does't have a corresponding element in DOM");
      return null;
    }

    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$element,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    return super.$createEmptyLine(param);
  }

  protected disableSubmitButton()
  {
    if (!this.$submitButton)
    {
      ERROR("Unable to disable submit button because"
        + " it doesn't exist in DOM");
      return;
    }

    this.disable(this.$submitButton);
  }

  protected enableSubmitButton()
  {
    if (!this.$submitButton)
    {
      ERROR("Unable to enable submit button because"
        + " it doesn't exist in DOM");
      return;
    }

    this.enable(this.$submitButton);
  }

  protected createErrorLabel()
  {
    if (!this.$element)
    {
      ERROR("Unable to create error label in form because the"
        + " form does't have a corresponding element in DOM");
      return null;
    }

    this.$errorLabelContainer = this.$createDiv
    (
      { $parent: this.$element }
    );

    if (!this.$errorLabelContainer)
    {
      ERROR("Failed to create $errorLabelContainer element in form");
      return null;
    }

    let $textContainer = this.$createDiv
    (
      {
        $parent: this.$errorLabelContainer,
        sCssClass: Form.ERROR_TEXT_CONTAINER_S_CSS_CLASS,
        gCssClass: Component.WINDOW_G_CSS_CLASS
      }
    );

    if (!$textContainer)
    {
      ERROR("Failed to create $textContainer element in form");
      return null;
    }

    this.$errorLabel = this.$createLabel
    (
      {
        $parent: $textContainer,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    // Add an empty line after error problem label
    // to separate it from next component.
    this.$createEmptyLine
    (
      { $parent: this.$errorLabelContainer }
    );

    this.$errorLabelContainer.hide();
  }

  protected displayError(problem: string | null)
  {
    /// TODO: Proč? Zrušit, pokud to půjde.
    if (!problem)
      return;

    if (!this.$errorLabel)
    {
      ERROR("Failed to display error because"
        + " there is no $errorLabel element");
      return null;
    }

    this.$createText
    (
      {
        $parent: this.$errorLabel,
        text: MudColors.PROBLEM_TEXT_COLOR + problem,
        insertMode: Component.InsertMode.REPLACE
      }
    );

    if (!this.$errorLabelContainer)
    {
      ERROR("Failed to display error because there"
        + " is no $errorLabelContainer element");
      return null;
    }

    this.$errorLabelContainer.show();
  }

  protected hideProblems(): void
  {
    if (!this.$errorLabelContainer)
    {
      ERROR("Failed to hide problems because there"
        + " is no $errorLabelContainer element");
      return;
    }

    this.$errorLabelContainer.hide();
  }

  // -> Returns 'null' if request couldn't be created
  //    or there is nothing to request yet.
  protected abstract createRequest(): Request | null;

  /// To be deleted.
  ///protected abstract isRequestValid(request: Request): boolean;

  // ---------------- Event handlers --------------------

  public onResponse()
  {
    this.hideProblems();
    this.enableSubmitButton();
  }

  protected onSubmit(event: JQueryEventObject)
  {
    console.log('onSubmit()');

    // We will handle the form submit ourselves.
    event.preventDefault();

    let request = this.createRequest();

    // 'null' request is not necessarily an error,
    // it can mean that there is nothing to request
    // yet (character name is not filled in, no
    // character is created yet, etc.).
    if (!request)
      return;

    /*
    // Array of strings 
    let problems = request.checkForProblems();
    
    if (problems)
    {
      this.displayRequestProblems(problems);
      return;
    }

/// TODO: Předělat.
    // Thanks to the shared code we don't have to
    // wait for server response to check for most
    // problems (the check will be done again on
    // the server of course to prevent exploits).
    if (!request || !this.isRequestValid(request))
      return;
    */

    // Disable submit button to prevent click-spamming
    // requests.
    this.disableSubmitButton();

    Connection.send(request);
  }
}

// ------------------ Type Declarations ----------------------

export module Form
{
  export interface CheckboxParam
  {
    labelParam?: Component.LabelParam,
    checkboxParam?: Component.CheckboxInputParam
  }
}