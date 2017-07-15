/*
  Part of BrutusNEXT

  Chargen form.
*/

'use strict';

import {Utils} from '../../../shared/lib/utils/Utils';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';

import $ = require('jquery');

export class ChargenForm extends Form
{
  protected static get SUBMIT_BUTTON_S_CSS_CLASS()
    { return 'S_ChargenForm_SubmitButton'; }
  protected static get CANCEL_BUTTON_S_CSS_CLASS()
    { return 'S_ChargenForm_CancelButton'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------


  //------------------ Private data ---------------------

  private $characterNameInput: JQuery = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create(param: Component.FormParam = {})
  {
    Utils.applyDefaults(param, { name: 'chargen_form' });

    super.create(param);

    this.createLabel({ text: 'Character Name' });
    this.createCharacterNameInput();

    this.createButtons();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createSubmitButton().
  protected createSubmitButton(param: Component.SubmitButtonParam = {})
  {
    return super.createSubmitButton
    (
      {
        text: 'Create Character',
        sCssClass: ChargenForm.SUBMIT_BUTTON_S_CSS_CLASS
      }
    );
  }

  // ---------------- Private methods -------------------

  private createCharacterNameInput()
  {
    /// TODO: Číst to ze stejné proměnné jako server a jako register form.
    // Maximum length of acocunt name (in characters).
    let minLength = 3;
    let maxLength = 20;

    this.$characterNameInput = super.createTextInput
    (
      {
        name: 'character_name_input',
        placeholder: 'Enter Character Name',
        minLength: minLength,
        maxLength: maxLength
      }
    );
  }

  private createButtons()
  {
    let $parent = super.createButtonContainer();

    this.createSubmitButton({ $parent });
    this.createCancelButton({ $parent });
  }

  private createCancelButton(param: Component.ButtonParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: ChargenForm.CANCEL_BUTTON_S_CSS_CLASS,
        text: 'Cancel',
        click: (event: Event) => { this.onCancel(event); }
      }
    );

    return this.createButton(param);

    // let $button = this.createButton(param);

    // $button.click
    // (
    //   (event: Event) => { this.onCancel(event); }
    // );

    // return $button;
  }

  // ---------------- Event handlers --------------------

  protected onSubmit(event: Event)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    console.log("Submit (char_name: " + this.$characterNameInput.val() + " )");

    ClientApp.setState(ClientApp.State.IN_GAME);
  }

  protected onCancel(event: Event)
  {
    ClientApp.setState(ClientApp.State.CHARLIST);
  }
}