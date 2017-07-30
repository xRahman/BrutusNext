/*
  Part of BrutusNEXT

  Form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Connection} from '../../../client/lib/connection/Connection';
import {MudColors} from '../../../client/gui/MudColors';
import {Component} from '../../../client/gui/Component';
import {Packet} from '../../../shared/lib/protocol/Packet';

export abstract class Form extends Component
{
  protected static get TEXT_S_CSS_CLASS()
    { return 'S_Form_Text'; }
  protected static get INPUT_S_CSS_CLASS()
    { return 'S_Form_Input'; }
  protected static get CHECKBOX_S_CSS_CLASS()
    { return 'S_Form_Checkbox'; }
  protected static  get LEFT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_LeftButton'; }
  protected static  get RIGHT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_RightButton'; }

  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  protected $form: JQuery = null;
  protected $submitButton: JQuery = null;
  protected $errorLabel: JQuery = null;
  protected $errorEmptyLine: JQuery = null;

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public onShow() {}
  public onHide() {}

  public resetForm()
  {
    let formElement = <HTMLFormElement>this.$form[0];

    formElement.reset();
  }

  // --------------- Protected methods ------------------

  protected create(param: Component.FormParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        submit: (event) => { this.onSubmit(event); }
      }
    );

    this.$form = this.createForm(param);

    this.createErrorLabel();
  }

  protected createLabel(param: Component.LabelParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    return super.createLabel(param);
  }

  protected createTextInput(param: Component.TextInputParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.INPUT_S_CSS_CLASS,
        autocorrect: Component.Autocorrect.OFF,
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    return super.createTextInput(param);
  }

  protected createPasswordInput(param: Component.PasswordInputParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.INPUT_S_CSS_CLASS,
        required: true,
        autocorrect: Component.Autocorrect.OFF,
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    return super.createPasswordInput(param);
  }

  protected createEmailInput(param: Component.EmailInputParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.INPUT_S_CSS_CLASS,
        required: true,
        autocorrect: Component.Autocorrect.OFF,
        // 'autocomplete' value could be 'email' but we have
        // 'remember me' option so there is no need for it.
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    return super.createEmailInput(param);
  }

  // Checkbox is actualy a <label> containing a checkbox input element.
  protected createCheckbox
  (
    {
      labelParam,
      checkboxParam
    }
    : Form.CheckboxParam = {}
  )
  : JQuery
  {
    this.applyDefaults
    (
      labelParam,
      {
        name: 'checkbox_label',
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    let $label = this.createLabel(labelParam);

    this.applyDefaults
    (
      checkboxParam,
      {
        // Put checkbox inside a label so mouse clicks
        // on label text will toggle the checkbox.
        $parent: $label,
        sCssClass: Form.CHECKBOX_S_CSS_CLASS,
        // Place checkbox before the text.
        insertMode: Component.InsertMode.PREPEND
      }
    );

    return this.createCheckboxInput(checkboxParam);
  }

  protected createButtonContainer(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        name: 'button_container',
        $parent: this.$form,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS
      }
    );

    return this.createDiv(param);
  }

  protected createSubmitButton(param: Component.SubmitButtonParam = {}): JQuery
  {
    this.applyDefaults
    (
      param,
      { sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS }
    );

    this.$submitButton = super.createSubmitButton(param);

    return this.$submitButton;
  }

  protected createEmptyLine(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    return super.createEmptyLine(param);
  }

  protected disableSubmitButton()
  {
     this.disable(this.$submitButton);
  }

  protected enableSubmitButton()
  {
    this.enable(this.$submitButton);
  }

  protected createErrorLabel()
  {
    this.$errorLabel = this.createLabel({});
    this.$errorLabel.hide();

    // Add an empty line after error problem label
    // to separate it from next component.
    this.$errorEmptyLine = this.createEmptyLine();
    this.$errorEmptyLine.hide();
  }

  protected displayError(problem: string)
  {
    this.createText
    (
      {
        $parent: this.$errorLabel,
        text: MudColors.PROBLEM_TEXT_COLOR + problem,
        insertMode: Component.InsertMode.REPLACE
      }
    );

    if (!this.$errorLabel)
    {
      ERROR("Missing $errorLabel");
      return;
    }

    this.$errorLabel.show();

    if (!this.$errorEmptyLine)
    {
      ERROR("Missing $errorEmptyLine");
      return;
    }

    // Also show additional empty line.
    this.$errorEmptyLine.show();
  }

  protected hideProblems()
  {
    if (this.$errorLabel)
      this.$errorLabel.hide();
  }

  protected abstract createRequest();

  protected abstract isRequestValid(request: Packet);

  // ---------------- Event handlers --------------------

  public onResponse()
  {
    this.hideProblems();
    this.enableSubmitButton();
  }

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