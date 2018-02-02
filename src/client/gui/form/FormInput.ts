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

    if (!parent.$element)
    {
      ERROR("Unable to create form input element because parent"
        + " component doesn't have a valid $element");
      return;
    }

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

  // -------------- Static class data -------------------

  // Default css class for input elements
  // (not for label element containing the input element).
  protected static get S_CSS_CLASS()
    { return 'S_FormInput'; }
  protected static get PROBLEM_NOTICE_S_CSS_CLASS()
    { return 'S_FormInput_ProblemNotice'; }

  // ---------------- Protected data --------------------

  protected $input: (JQuery | null) = null;
  protected $problem: (JQuery | null) = null;

  // ---------------- Public methods --------------------

  public focus()
  {
    if (!this.$input)
    {
      ERROR("Unable to focus form input because"
        + " $input element is missing");
      return;
    }

    this.$input.focus();
  }

  // -> Returns value of input element.
  public getValue(): string
  {
    if (!this.$input)
    {
      ERROR("Unable to read value of form input because"
        + " $input element is missing");
      return "";
    }

    return <string>this.$input.val();
  }

  public setValue(value: string | number)
  {
    if (!this.$input)
    {
      ERROR("Unable to set value to form input because"
        + " $input element is missing");
      return;
    }

    this.$input.val(value);
  }

  public displayProblem(problem: string)
  {
    if (!this.$problem)
    {
      ERROR("Invalid $problem element");
      return;
    }

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
    if (!this.$problem)
    {
      ERROR("Unable to hide problems on form input because"
        + " $problem element is missing");
      return;
    }

    this.$problem.hide();
  }

  // --------------- Protected methods ------------------

  protected createProblemNotice(param: Component.DivParam = {})
  {
    if (!this.$element)
    {
      ERROR("Unable to create $problem element in form input"
        + " component because form input component doesn't"
        + " have a valid $element");
      return;
    }

    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$element,
        sCssClass: FormInput.PROBLEM_NOTICE_S_CSS_CLASS
      }
    );

    this.$problem = this.$createDiv(param);
  }
}