/*
  Part of BrutusNEXT

  Password input form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {FormInput} from '../../../client/gui/form/FormInput';

export abstract class PasswordInput extends FormInput
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
        { name: 'password_input_label' }
      )
    );

    this.createInput(inputParam);
    this.createProblemNotice(problemParam);
  }

  // ---------------- Private methods -------------------

  private createInput(param: Component.PasswordInputParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'password_input',
        $parent: this.$element,
        sCssClass: FormInput.S_CSS_CLASS,
        // required: true,
        autocorrect: Component.Autocorrect.OFF,
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    this.$input = this.createPasswordInput(param);
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