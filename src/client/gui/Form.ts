/*
  Part of BrutusNEXT

  Form element.
*/

'use strict';

import {Utils} from '../../shared/lib/utils/Utils';
import {Component} from '../../client/gui/Component';

///import $ = require('jquery');

export abstract class Form extends Component
{
  protected static get S_CSS_CLASS()
    { return 'S_Form'; }
  protected static get TEXT_S_CSS_CLASS()
    { return 'S_Form_Text'; }
  protected static get INPUT_S_CSS_CLASS()
    { return 'S_Form_Input'; }
  protected static get CHECKBOX_S_CSS_CLASS()
    { return 'S_Form_Checkbox'; }
  protected static  get BUTTON_CONTAINER_S_CSS_CLASS()
    { return 'S_Form_ButtonContainer'; }
  protected static  get LEFT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_LeftButton'; }
  protected static  get RIGHT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_RightButton'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $form: JQuery = null;
  protected $submitButton: JQuery = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public onShow() {}
  public onHide() {}

  // --------------- Protected methods ------------------

  protected create(param: Component.FormParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Form.S_CSS_CLASS,
        submit: (event: Event) => { this.onSubmit(event); }
      }
    );

    this.$form = this.createForm(param);
  }

  protected createLabel(param: Component.LabelParam = {})
  {
    Utils.applyDefaults
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
    Utils.applyDefaults
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
    Utils.applyDefaults
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
    Utils.applyDefaults
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
    Utils.applyDefaults
    (
      labelParam,
      {
        name: 'checkbox_label',
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    let $label = this.createLabel(labelParam);

    Utils.applyDefaults
    (
      checkboxParam,
      {
        // Put checkbox inside a label so mouse clicks
        // on label text will toggle the checkbox.
        $parent: $label,
        sCssClass: Form.CHECKBOX_S_CSS_CLASS,
        // Pace checkbox before the text.
        insertMode: Component.InsertMode.PREPEND
      }
    );

    return this.createCheckboxInput(checkboxParam);
  }

  protected createButtonContainer(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'button_container',
        $parent: this.$form,
        sCssClass: Form.BUTTON_CONTAINER_S_CSS_CLASS
      }
    );

    return this.createDiv(param);
  }

  protected createSubmitButton(param: Component.SubmitButtonParam = {}): JQuery
  {
    Utils.applyDefaults
    (
      param,
      { sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS }
    );

    this.$submitButton = super.createSubmitButton(param);

    return this.$submitButton;
  }

  protected createEmptyLine(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    return super.createEmptyLine(param);
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  protected abstract onSubmit(event: Event);
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