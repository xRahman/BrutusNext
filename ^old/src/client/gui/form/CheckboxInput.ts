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

  // -------------- Static class data -------------------

  protected static get S_CSS_CLASS()
    { return 'S_CheckboxInput'; }

  // ---------------- Public methods --------------------

  public isChecked()
  {
    if (!this.$input)
    {
      ERROR("Invalid $input element");
      return;
    }

    return this.$input.prop('checked');
  }

  public setChecked(value: boolean)
  {
    if (!this.$input)
    {
      ERROR("Invalid $input element");
      return;
    }

    this.$input.prop('checked', value);
  }

  // ---------------- Private methods -------------------

  private createInput(param: Component.CheckboxInputParam = {})
  {
    if (!this.$element)
    {
      ERROR("Unable to create $input element in checkbox"
        + " input component because checkbox input component"
        + " doesn't have a valid $element");
      return;
    }

    this.$createDiv
    (
      {
        name: 'checkbox_input_graphics',
        $parent: this.$element,
        gCssClass: Component.CHECKBOX_G_CSS_CLASS,
        sCssClass: CheckboxInput.S_CSS_CLASS,
        // Place the checkbox graphics element before the text.
        insertMode: Component.InsertMode.PREPEND
      }
    );

    Utils.applyDefaults
    (
      param,
      {
        name: 'checkbox_input',
        $parent: this.$element,
        // Actuall checkbox will be hidden. This is because
        // it's not possible to style checkbox using css
        // so we have to hide the checkbox and style something
        // else instead.
        sCssClass: Component.HIDDEN_S_CSS_CLASS,
        // Place checkbox before the text and before it's respective
        // graphics element (this is important because we will be using
        // css '+' selector to style element immediately following
        // the checkbox input element).
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