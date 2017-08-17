/*
  Part of BrutusNEXT

  Checkbox input form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {FormInput} from '../../../client/gui/form/FormInput';

export class CheckboxInput extends FormInput
{
  constructor
  (
    parent: Component,
    {
      labelParam = {},
      inputParam = {},
      problemParam = {}
    }
    : CheckboxInput.Param = {}
  )
  {
    super
    (
      parent,
      Utils.applyDefaults
      (
        labelParam,
        { name: 'checkbox_input_label' }
      )
    );

    this.createInput(inputParam);
    this.createProblemNotice(problemParam);
  }

  protected static get S_CSS_CLASS()
    { return 'S_CheckboxInput'; }

  // ---------------- Public methods --------------------

  public isChecked()
  {
    // if (!this.$input)
    // {
    //   ERROR("Unable to determine state of checkbox because"
    //     + " respective element doesn't exist. Returning 'false'");
    //   return false;
    // }

    return this.$input.prop('checked');
  }

  public setChecked(value: boolean)
  {
    // if (!this.$input)
    // {
    //   ERROR("Unable to set checked state of checkbox because"
    //     + " respective element doesn't exist");
    //   return false;
    // }

    this.$input.prop('checked', value);
  }

  // ---------------- Private methods -------------------

  private createInput(param: Component.CheckboxInputParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'checkbox_input',
        $parent: this.$element,
        sCssClass: CheckboxInput.S_CSS_CLASS,
        // Place checkbox before the text.
        insertMode: Component.InsertMode.PREPEND
      }
    );

    this.$input = this.$createCheckboxInput(param);
  }
}

// ------------------ Type Declarations ----------------------

export module CheckboxInput
{
  export interface Param
  {
    labelParam?: Component.LabelParam,
    inputParam?: Component.CheckboxInputParam,
    problemParam?: Component.DivParam
  }
}