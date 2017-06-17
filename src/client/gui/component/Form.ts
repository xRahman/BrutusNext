/*
  Part of BrutusNEXT

  Ancestor of windows with form data.
*/

'use strict';

import {Component} from '../../../client/gui/component/Component';

import $ = require('jquery');

export abstract class Form extends Component
{
  protected static get CSS_CLASS() { return 'Form'; }
  protected static get LABEL_CSS_CLASS() { return 'FormLabel'; }
  protected static get INPUT_CSS_CLASS() { return 'FormInput'; }
  protected static get BUTTON_CSS_CLASS() { return 'FormButton'; }
  protected static get CHECKBOX_CSS_CLASS() { return 'FormCheckbox'; }
  protected static get CHECKBOX_CONTAINER_CSS_CLASS()
  {
    return 'FormCheckboxContainer';
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $form = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  protected create(id: string)
  {
    this.$form = this.createForm
    (
      id,
      Form.CSS_CLASS
    );

    // Register 'submit' event handler.
    this.$form.submit
    (
      (event: Event) => { this.onSubmit(event); }
    );

    return this.$form;
  }

  protected appendLabel(id: string, text: string)
  {
    let $label = this.createLabel
    (
      id,
      Form.LABEL_CSS_CLASS
    );
    $label.text(text);
    this.$form.append($label);

    return $label;
  }

  protected appendTextInput
  (
    id: string,
    placeholderText: string,
    maxCharacters: number)
  {
    let $input = this.createTextInput
    (
      id,
      Form.INPUT_CSS_CLASS
    );

    $input.prop('required', true);
    $input.attr('placeholder', placeholderText);
    $input.attr('maxlength', maxCharacters);

    this.$form.append($input);

    return $input;
  }

  protected appendPasswordInput(id: string, placeholderText: string)
  {
    let $input = this.createPasswordInput
    (
      id,
      Form.INPUT_CSS_CLASS
    );

    $input.prop('required', true);
    $input.attr('placeholder', placeholderText);

    this.$form.append($input);

    return $input;
  }

  protected appendEmailInput(id: string, placeholderText: string)
  {
    let $input = this.createEmailInput
    (
      id,
      Form.INPUT_CSS_CLASS
    );

    $input.prop('required', true);
    $input.attr('placeholder', placeholderText);

    this.$form.append($input);

    return $input;
  }

  protected appendCheckboxInput(id: string, text: string, checked: boolean)
  {
    let $container = this.createDiv
    (
      null, // No id.
      Form.CHECKBOX_CONTAINER_CSS_CLASS
    );

    let $checkbox = this.createCheckboxInput
    (
      id,
      Form.CHECKBOX_CSS_CLASS
    );
    $checkbox.prop('checked', checked);

    let $label = this.createLabel
    (
      null, // No id.
      Form.LABEL_CSS_CLASS
    );
    $label.text(text);

    $container.append($checkbox);
    $container.append($label)

    this.$form.append($container);

    return $checkbox;
  }

  protected appendSubmitButton($container: JQuery, id: string, text: string)
  {
    let $button = this.createSubmitButton
    (
      id,
      Form.BUTTON_CSS_CLASS
    );

    $button.text(text);

    $container.append($button);

    return $button;
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  protected abstract onSubmit(event: Event);
}