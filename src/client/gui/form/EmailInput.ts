/*
  Part of BrutusNEXT

  Email input form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {FormInput} from '../../../client/gui/form/FormInput';

export abstract class EmailInput extends FormInput
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
        { name: 'text_input_label' }
      )
    );

    this.createInput(inputParam);
    this.createProblemNotice(problemParam);
  }

  // ---------------- Private methods -------------------

  private createInput(param: Component.EmailInputParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'email_input',
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

    this.$input = this.createEmailInput(param);
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