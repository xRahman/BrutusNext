/*
  Part of BrutusNEXT

  Ancestor of windows with form data.
*/

'use strict';

import {Component} from '../../client/gui/Component';

import $ = require('jquery');

export abstract class Form extends Component
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $form = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  protected create($container: JQuery, cssClass: string, name: string)
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

  protected createLabel(text: string, cssClass: string)
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
    cssClass: string
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
    cssClass: string
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
    cssClass: string
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
    containerCssClass: string,
    labelCssClass: string,
    checkboxCssClass: string
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

  protected createSubmitButton
  (
    $container: JQuery,
    text: string,
    cssClass: string
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