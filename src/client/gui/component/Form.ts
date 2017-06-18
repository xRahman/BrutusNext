/*
  Part of BrutusNEXT

  Ancestor of windows with form data.
*/

'use strict';

import {InputParam} from '../../../client/gui/component/Component'; 
import {Component} from '../../../client/gui/component/Component';

import $ = require('jquery');

export abstract class Form extends Component
{
  protected static get CSS_CLASS() { return 'Form'; }
  public static get LABEL_CSS_CLASS() { return 'FormLabel'; }
  protected static get INPUT_CSS_CLASS() { return 'FormInput'; }
  protected static get BUTTON_CSS_CLASS() { return 'FormButton'; }
  protected static get CHECKBOX_CSS_CLASS() { return 'FormCheckbox'; }
  protected static get CHECKBOX_CONTAINER_CSS_CLASS()
  {
    return 'FormCheckboxContainer';
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $form = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  protected create($container: JQuery, name: string)
  {
    this.$form = this.createForm
    (
      $container,
      Form.CSS_CLASS,
      name
    );

    // Register 'submit' event handler.
    this.$form.submit
    (
      (event: Event) => { this.onSubmit(event); }
    );
  }

  protected appendLabel(text: string)
  {
    return this.createLabel
    (
      this.$form,
      Form.LABEL_CSS_CLASS,
      text
    );
  }

  protected appendTextInput
  (
    name: string,
    placeholder: string,
    minLength: number,
    maxlength: number
  )
  {
    return this.createTextInput
    (
      this.$form,
      Form.INPUT_CSS_CLASS,
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

  protected appendPasswordInput
  (
    name: string,
    placeholder: string,
    minLength: number,
    maxLength: number
  )
  {
    return this.createPasswordInput
    (
      this.$form,
      Form.INPUT_CSS_CLASS,
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

  protected appendEmailInput(name: string, placeholder: string)
  {
    return this.createEmailInput
    (
      this.$form,
      Form.INPUT_CSS_CLASS,
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

  protected appendCheckboxInput(name: string, text: string, checked: boolean)
  {
    let $container = this.createDiv
    (
      this.$form,
      Form.CHECKBOX_CONTAINER_CSS_CLASS
    );

    let $checkbox = this.createCheckboxInput
    (
      $container,
      Form.CHECKBOX_CSS_CLASS,
      name,
      {
        checked: checked
      }
    );

    this.createLabel
    (
      $container,
      Form.LABEL_CSS_CLASS,
      text
    );

    return $checkbox;
  }

  protected appendSubmitButton($container: JQuery, name: string, text: string)
  {
    return this.createSubmitButton
    (
      $container,
      Form.BUTTON_CSS_CLASS,
      name,
      text,
      null    // No attributes.
    );
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  protected abstract onSubmit(event: Event);
}