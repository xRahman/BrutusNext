/*
  Part of BrutusNEXT

  Email input form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {FormInput} from '../../../client/gui/form/FormInput';

export class EmailInput extends FormInput
{
  constructor
  (
    parent: Component,
    {
      labelParam = {},
      inputParam = {},
      problemParam = {}
    }
    : EmailInput.Param = {}
  )
  {
    super
    (
      parent,
      Utils.applyDefaults
      (
        labelParam,
        {
          name: 'email_input_label',
          text: 'E-mail Address'
        }
      )
    );

    this.createInput(inputParam);
    this.createProblemNotice(problemParam);
  }

  // ---------------- Private methods -------------------

  private createInput(param: Component.EmailInputParam = {})
  {
    if (!this.$element)
    {
      ERROR("Attempt to create input element on email input which"
        + " doesn't have a corresponding element in DOM");
      return;
    }

    Utils.applyDefaults
    (
      param,
      {
        name: 'email_input',
        placeholder: 'Enter E-mail Address',
        $parent: this.$element,
        sCssClass: FormInput.S_CSS_CLASS,
        // required: true,
        autocorrect: Component.Autocorrect.OFF,
        // 'autocomplete' value could be 'email' but we have
        // 'remember me' option so there is no need for it.
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    this.$input = this.$createEmailInput(param);
  }
}

// ------------------ Type Declarations ----------------------

export module EmailInput
{
  export interface Param
  {
    labelParam?: Component.LabelParam,
    inputParam?: Component.EmailInputParam,
    problemParam?: Component.DivParam
  }
}