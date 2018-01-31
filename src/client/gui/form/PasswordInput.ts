/*
  Part of BrutusNEXT

  Password input form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {FormInput} from '../../../client/gui/form/FormInput';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';

export class PasswordInput extends FormInput
{
  constructor
  (
    parent: Component,
    {
      labelParam = {},
      inputParam = {},
      problemParam = {}
    }
    : PasswordInput.Param = {}
  )
  {
    super
    (
      parent,
      Utils.applyDefaults
      (
        labelParam,
        {
          name: 'password_input_label',
          text: 'Password'
        }
      )
    );

    this.createInput(inputParam);
    this.createProblemNotice(problemParam);
  }

  // ---------------- Private methods -------------------

  private createInput(param: Component.PasswordInputParam = {})
  {
    if (!this.$element)
    {
      ERROR("Unable to create $input element in password"
        + " input component because password input component"
        + " doesn't have a valid $element");
      return;
    }

    Utils.applyDefaults
    (
      param,
      {
        name: 'password_input',
        placeholder: 'Enter Password',
        $parent: this.$element,
        sCssClass: FormInput.S_CSS_CLASS,
        // required: true,
        autocorrect: Component.Autocorrect.OFF,
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false,
        maxLength: RegisterRequest.MAX_PASSWORD_LENGTH
      }
    );

    this.$input = this.$createPasswordInput(param);
  }
}

// ------------------ Type Declarations ----------------------

export module PasswordInput
{
  export interface Param
  {
    labelParam?: Component.LabelParam,
    inputParam?: Component.PasswordInputParam,
    problemParam?: Component.DivParam
  }
}