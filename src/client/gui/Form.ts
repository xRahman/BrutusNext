/*
  Part of BrutusNEXT

  Abstract ancestor of component containing a form.
*/

'use strict';

import {Component} from '../../client/gui/Component';

import $ = require('jquery');

export abstract class Form extends Component
{
  protected static get CSS_CLASS()
    { return 'Form'; }
  protected static get LABEL_CSS_CLASS()
    { return 'Form_Label'; }
  protected static get INPUT_CSS_CLASS()
    { return 'Form_Input'; }
  protected static get CHECKBOX_CSS_CLASS()
    { return 'Form_Checkbox'; }
  protected static get CHECKBOX_CONTAINER_CSS_CLASS()
    { return 'Form_CheckboxContainer'; }
  protected static get SUBMIT_BUTTON_CSS_CLASS()
    { return 'Form_SubmitButton'; }
  protected static  get BUTTON_CONTAINER_CSS_CLASS()
    { return 'Form_ButtonContainer'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $form = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  protected create
  (
    $container: JQuery,
    name: string,
    cssClass = Form.CSS_CLASS
  )
  {
    this.$form = Component.createForm
    (
      $container,
      cssClass,
      name
    );

    // Register 'submit' event handler.
    this.$form.submit
    (
      (event: Event) => { this.onSubmit(event); }
    );
  }

  protected createLabel(text: string, cssClass = Form.LABEL_CSS_CLASS)
  {
    return Component.createLabel
    (
      this.$form,
      cssClass,
      text
    );
  }

  protected createTextInput
  (
    name: string,
    placeholder: string,
    minLength: number,
    maxlength: number,
    cssClass = Form.INPUT_CSS_CLASS
  )
  {
    return Component.createTextInput
    (
      this.$form,
      cssClass,
      name,
      {
        required: true,
        placeholder: placeholder,
        minLength: minLength,
        maxLength: maxlength,
        /// Doesn't work in browsers yet
        /// (account names should be case insensitive anyways).
        /// autocapitalize: 'words',
        autocorrect: 'off',
        // 'autocomplete' value could be 'username' for LoginForm but
        //  we have 'remember me' option so there is no need for it.
        autocomplete: 'off',
        spellcheck: false
      }
    );
  }

  protected createPasswordInput
  (
    name: string,
    placeholder: string,
    minLength: number,
    maxLength: number,
    cssClass = Form.INPUT_CSS_CLASS
  )
  {
    return Component.createPasswordInput
    (
      this.$form,
      cssClass,
      name,
      {
        required: true,
        placeholder: placeholder,
        minLength: minLength,
        maxLength: maxLength,
        autocorrect: 'off',
        autocomplete: 'off',
        spellcheck: false
      }
    );
  }

  protected createEmailInput
  (
    name: string,
    placeholder: string,
    cssClass = Form.INPUT_CSS_CLASS
  )
  {
    return Component.createEmailInput
    (
      this.$form,
      cssClass,
      name,
      {
        required: true,
        placeholder: placeholder,
        autocorrect: 'off',
        // 'autocomplete' value could be 'email' but user only needs
        // to type email once when creating an account so I'll leave
        // it off.
        autocomplete: 'off',
        spellcheck: false
      }
    );
  }

  protected createCheckboxInput
  (
    name: string,
    text: string,
    checked: boolean,
    containerCssClass = Form.CHECKBOX_CONTAINER_CSS_CLASS,
    labelCssClass = Form.LABEL_CSS_CLASS,
    checkboxCssClass = Form.CHECKBOX_CSS_CLASS
  )
  {
    let $container = Component.createDiv
    (
      this.$form,
      containerCssClass
    );

    let $checkbox = Component.createCheckboxInput
    (
      $container,
      checkboxCssClass,
      name,
      {
        checked: checked
      }
    );

    Component.createLabel
    (
      $container,
      labelCssClass,
      text
    );

    return $checkbox;
  }

  protected createButtonContainer(cssClass = Form.BUTTON_CONTAINER_CSS_CLASS)
  {
    return Component.createDiv
    (
      this.$form,
      cssClass
    );
  }

  protected createSubmitButton
  (
    $container: JQuery,
    text: string,
    cssClass = Form.SUBMIT_BUTTON_CSS_CLASS
  )
  {
    return Component.createSubmitButton
    (
      $container,
      cssClass,
      'submit_button',
      text
    );
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  protected abstract onSubmit(event: Event);
}