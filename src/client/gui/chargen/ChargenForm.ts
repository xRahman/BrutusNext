/*
  Part of BrutusNEXT

  Chargen form.
*/

'use strict';

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
  public create({ $container }: { $container: JQuery; })
  {
    super.create({ $container: $container, name: 'chargen_form' });

    super.createLabel({ text: 'Character Name' });
    this.createCharacterNameInput();

    this.createButtons();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createSubmitButton().
  protected createSubmitButton({ $container }: { $container: JQuery; })
  {
    return super.createSubmitButton
    (
      {
        $container:  $container,
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
    let $container = super.createButtonContainer();

    this.createSubmitButton({ $container: $container });
    this.createCancelButton({ $container: $container });
  }

  private createCancelButton({ $container }: { $container: JQuery; })
  {
    let $button = this.createButton
    (
      {
        $container: $container,
        sCssClass: ChargenForm.CANCEL_BUTTON_S_CSS_CLASS,
        text: 'Cancel'
      }
    );

    $button.click
    (
      (event: Event) => { this.onCancel(event); }
    );

    return $button;
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