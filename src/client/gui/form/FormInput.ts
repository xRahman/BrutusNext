/*
  Part of BrutusNEXT

  Form input element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
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
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    // Input elements are inserted into their respective
    // labels. This is mainly important for checkbox input
    // where it ensures that clicks on the label will change
    // the checkbox value.
    this.$element = super.createLabel(param);
  }

  // Default css class for input elements
  // (not for label element containing the input element).
  protected static get S_CSS_CLASS()
    { return 'S_FormInput'; }

  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  protected $input: JQuery = null;
  protected $problem: JQuery = null;

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

    this.$problem = this.createDiv(param);
  }
}