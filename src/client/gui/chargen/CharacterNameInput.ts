/*
  Part of BrutusNEXT

  Input element for new character name.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {TextInput} from '../../../client/gui/form/TextInput';
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';

export class CharacterNameInput extends TextInput
{
  constructor(parent: Component)
  {
    super
    (
      parent,
      {
        labelParam:
        {
          name: 'character_name_input_label',
          text: 'Character Name'
        },
        inputParam:
        {
          name: 'character_name_input',
          placeholder: 'Enter Character Name',
          /// We are not letting browser to validate 'minLenght'
          /// because 'minLength' validation does't work anyways
          /// after setting value to the input element.
          ///minLength: ChargenRequest.MIN_NAME_LENGTH_CHARACTERS,
          maxLength: ChargenRequest.MAX_NAME_LENGTH_CHARACTERS,
          /// Automatic form validation is no longer used.
          ///required: true,
          input: (event: JQueryEventObject) => { this.onInput(event); }
        }
      }
    );
  }

  // ---------------- Private methods -------------------

  // Note that this is also enforced in
  // ChargenRequest.getInvalidCharacterProblem().
  private removeInvalidCharacters()
  {
    if (!this.$input)
    {
      ERROR("Invalid $input element");
      return;
    }

    // Make sure that we work with a string.
    let oldValue = "" + this.$input.val();
    let newValue = "";
    let regexp = ChargenRequest.VALID_CHARACTERS_REGEXP;

    if (oldValue)
      newValue = oldValue.replace(regexp, '');

    // Note: Setting value to an input element breaks automatic
    //   value validation on the browser.
    this.$input.val(newValue);
  }

  private upperCaseFirstCharacter()
  {
    if (!this.$input)
    {
      ERROR("Invalid $input element");
      return;
    }

    let oldValue = this.$input.val();
    let newValue = "";

    if (oldValue)
      newValue = Utils.uppercaseFirstCharacter(oldValue);

    // Note: Setting value to an input element breaks automatic
    //   value validation on the browser.
    this.$input.val(newValue);
  }

  // ---------------- Event handlers --------------------

  private onInput(event: JQueryEventObject)
  {
    if (!this.$input)
    {
      ERROR("Invalid $input element");
      return;
    }

    // Remember original selection (and cursor) position.
    let element = <HTMLInputElement>this.$input[0];
    let selectionStart = element.selectionStart;
    let selectionEnd = element.selectionEnd;

    this.removeInvalidCharacters();
    this.upperCaseFirstCharacter();

    // Restore original selection (and cursor) position.
    element.setSelectionRange(selectionStart, selectionEnd);

    return true;
  }
}