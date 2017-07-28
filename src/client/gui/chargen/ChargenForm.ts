/*
  Part of BrutusNEXT

  Chargen form.
*/

'use strict';

import {Utils} from '../../../shared/lib/utils/Utils';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Connection} from '../../../client/lib/connection/Connection';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/Form';
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';

export class ChargenForm extends Form
{
  // ----------------- Private data ---------------------

  private $characterNameInput: JQuery = null;

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create(param: Component.FormParam = {})
  {
    Utils.applyDefaults(param, { name: 'chargen_form' });

    super.create(param);

    this.createLabel({ text: 'Character Name' });
    this.createCharacterNameInput();

    this.createEmptyLine();

    this.createButtons();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createSubmitButton().
  protected createSubmitButton(param: Component.SubmitButtonParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        text: 'Create Character',
        sCssClass: Form.LEFT_BUTTON_S_CSS_CLASS
      }
    );

    return super.createSubmitButton(param);
  }

  // ---------------- Private methods -------------------

  private createCharacterNameInput()
  {
    this.$characterNameInput = super.createTextInput
    (
      {
        name: 'character_name_input',
        placeholder: 'Enter Character Name',
        minLength: ChargenRequest.MIN_CHARACTER_NAME_LENGTH,
        maxLength: ChargenRequest.MAX_CHARACTER_NAME_LENGTH,
        input: (event) => { this.onCharacterNameInput(event); }
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
        sCssClass: Form.RIGHT_BUTTON_S_CSS_CLASS,
        text: 'Cancel',
        click: (event) => { this.onCancel(event); }
      }
    );

    return this.createButton(param);
  }

  // ---------------- Event handlers --------------------

  protected onSubmit(event: JQueryEventObject)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    let request = new ChargenRequest();

    request.characterName = this.$characterNameInput.val();

    // Disable submit button to prevent click-spamming
    // requests.
    this.disableSubmitButton();

    Connection.send(request);

    /// TODO: Tohle až když přije response.
    ///ClientApp.setState(ClientApp.State.IN_GAME);
  }

  private onCharacterNameInput(event: JQueryEventObject)
  {
    console.log('onCharacterNameInputChange');

    let oldValue = this.$characterNameInput.val();
    let newValue = Utils.upperCaseFirstCharacter(oldValue);

    this.$characterNameInput.val(newValue);
  }

  private onCancel(event: JQueryEventObject)
  {
    ClientApp.setState(ClientApp.State.CHARLIST);
  }
}