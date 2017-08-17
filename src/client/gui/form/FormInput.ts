/*
  Part of BrutusNEXT

  Form input element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {MudColors} from '../../../client/gui/MudColors';
import {Form} from '../../../client/gui/form/Form';

export abstract class FormInput extends Component
{
  constructor
  (
    parent: Component,
    param: Component.LabelParam = {}
  )
  {
    super(parent);

    Utils.applyDefaults
    (
      param,
      {
        name: 'form_input_label',
        $parent: parent.$element,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    // Input elements are inserted into their respective
    // labels. This is mainly important for checkbox input
    // where it ensures that clicks on the label will change
    // the checkbox value.
    this.$element = super.$createLabel(param);
  }

  // Default css class for input elements
  // (not for label element containing the input element).
  protected static get S_CSS_CLASS()
    { return 'S_FormInput'; }

  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  protected $input: JQuery = null;
  protected $problem: JQuery = null;

  // ---------------- Public methods --------------------

  public focus()
  {
    // if (!this.$input)
    // {
    //   ERROR("$input doesn't exist so it won't be focused");
    //   return;
    // }

    this.$input.focus();
  }

  // -> Returns value of input element.
  public getValue()
  {
    // if (!this.$input)
    // {
    //   ERROR("$input doesn't exist so its value cannot be read");
    //   return;
    // }

    return this.$input.val();
  }

  public setValue(value: string | number)
  {
    this.$input.val(value);
  }

  public displayProblem(problem: string)
  {
    // if (!this.$problem)
    // {
    //   ERROR("Unable to display problem notice because component"
    //     + " $problem doesn't exist");
    //   return;
    // }

    this.$createText
    (
      {
        $parent: this.$problem,
        text: MudColors.PROBLEM_TEXT_COLOR + problem,
        insertMode: Component.InsertMode.REPLACE
      }
    );

    this.$problem.show();

    // Focus input component which has the problem.
    this.focus();
  }

  public hideProblem()
  {
    this.$problem.hide();
  }

  // --------------- Protected methods ------------------

  protected createProblemNotice(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$element,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    this.$problem = this.$createDiv(param);
  }
}