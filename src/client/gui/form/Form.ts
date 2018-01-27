/*
  Part of BrutusNEXT

  Form element.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Connection} from '../../../client/lib/connection/Connection';
import {MudColors} from '../../../client/gui/MudColors';
import {Component} from '../../../client/gui/Component';
import {Packet} from '../../../shared/lib/protocol/Packet';

export abstract class Form extends Component
{
  constructor
  (
    parent: Component,
    param: Component.FormParam = {}
  )
  {
    super(parent);

    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        submit: (event) => { this.onSubmit(event); }
      }
    );

    this.$element = this.$createForm(param);

    this.createErrorLabel();
  }

  // -------------- Static class data -------------------

  public static get TEXT_S_CSS_CLASS()
    { return 'S_Form_Text'; }
  public static get ERROR_TEXT_CONTAINER_S_CSS_CLASS()
    { return 'S_Form_ErorTextContainer'; }
  protected static  get LEFT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_LeftButton'; }
  protected static  get RIGHT_BUTTON_S_CSS_CLASS()
    { return 'S_Form_RightButton'; }

  // ---------------- Protected data --------------------

  protected $submitButton: (JQuery | null) = null;
  protected $errorLabel: (JQuery | null) = null;
  protected $errorLabelContainer: (JQuery | null) = null;

  // ----------------- Private data ---------------------

  public reset()
  {
    let form = <HTMLFormElement>this.$element[0];

    form.reset();
  }

  public submit()
  {
    this.$element.submit();
  }

  // --------------- Protected methods ------------------

  protected createButtonContainer(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'button_container',
        $parent: this.$element,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS
      }
    );

    return this.$createDiv(param);
  }

  protected $createSubmitButton(param: Component.SubmitButtonParam = {}): JQuery
  {
    Utils.applyDefaults
    (
      param,
      { sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS }
    );

    this.$submitButton = super.$createSubmitButton(param);

    return this.$submitButton;
  }

  protected createEmptyLine(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$element,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    this.$createEmptyLine(param);
  }

  protected disableSubmitButton()
  {
     this.disable(this.$submitButton);
  }

  protected enableSubmitButton()
  {
    this.enable(this.$submitButton);
  }

  protected createErrorLabel()
  {
    this.$errorLabelContainer = this.$createDiv
    (
      { $parent: this.$element }
    );

    let $textContainer = this.$createDiv
    (
      {
        $parent: this.$errorLabelContainer,
        sCssClass: Form.ERROR_TEXT_CONTAINER_S_CSS_CLASS,
        gCssClass: Component.WINDOW_G_CSS_CLASS
      }
    )

    this.$errorLabel = this.$createLabel
    (
      {
        $parent: $textContainer,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    // Add an empty line after error problem label
    // to separate it from next component.
    this.createEmptyLine
    (
      { $parent: this.$errorLabelContainer }
    );

    this.$errorLabelContainer.hide();
  }

  protected displayError(problem: string)
  {
    console.log('displayError()');

    this.$createText
    (
      {
        $parent: this.$errorLabel,
        text: MudColors.PROBLEM_TEXT_COLOR + problem,
        insertMode: Component.InsertMode.REPLACE
      }
    );

    this.$errorLabelContainer.show();
  }

  protected hideProblems()
  {
    this.$errorLabelContainer.hide();
  }

  protected abstract createRequest();

  protected abstract isRequestValid(request: Packet);

  // ---------------- Event handlers --------------------

  public onResponse()
  {
    this.hideProblems();
    this.enableSubmitButton();
  }

  protected onSubmit(event: JQueryEventObject)
  {
    console.log('onSubmit()');

    // We will handle the form submit ourselves.
    event.preventDefault();

    let request = this.createRequest();

    // Thanks to the shared code we don't have to
    // wait for server response to check for most
    // problems (the check will be done again on
    // the server of course to prevent exploits).
    if (!this.isRequestValid(request))
      return;

    // Disable submit button to prevent click-spamming
    // requests.
    this.disableSubmitButton();

    Connection.send(request);
  }
}

// ------------------ Type Declarations ----------------------

export module Form
{
  export interface CheckboxParam
  {
    labelParam?: Component.LabelParam,
    checkboxParam?: Component.CheckboxInputParam
  }
}