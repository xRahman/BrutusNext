/*
  Part of BrutusNEXT

  Text input form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {FormInput} from '../../../client/gui/form/FormInput';

export abstract class TextInput extends FormInput
{
  constructor
  (
    parent: Component,
    {
      labelParam = {},
      inputParam = {},
      problemParam = {}
    }
    : TextInput.Param = {}
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

  private createInput(param: Component.TextInputParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'text_input',
        $parent: this.$element,
        sCssClass: FormInput.S_CSS_CLASS,
        autocorrect: Component.Autocorrect.OFF,
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    this.$input = this.createTextInput(param);
  }
}

// ------------------ Type Declarations ----------------------

export module TextInput
{
  export interface Param
  {
    labelParam?: Component.LabelParam,
    inputParam?: Component.TextInputParam,
    problemParam?: Component.DivParam
  }
}