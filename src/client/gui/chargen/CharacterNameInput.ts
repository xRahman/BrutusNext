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
          ///minLength: ChargenRequest.MIN_CHARACTER_NAME_LENGTH,
          maxLength: ChargenRequest.MAX_CHARACTER_NAME_LENGTH,
          /// Automatic form validation is no longer used.
          ///required: true,
          input: (event) => { this.onInput(event); }
        }
      }
    );
  }

  // ---------------- Private methods -------------------

  // Note that this is also enforced in
  // ChargenRequest.getInvalidCharacterProblem().
  private removeInvalidCharacters()
  {
    let oldValue = this.$input.val();
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
    let oldValue = this.$input.val();
    let newValue = "";

    if (oldValue)
      newValue = Utils.upperCaseFirstCharacter(oldValue);

    // Note: Setting value to an input element breaks automatic
    //   value validation on the browser.
    this.$input.val(newValue);
  }

  // ---------------- Event handlers --------------------

  private onInput(event: JQueryEventObject)
  {
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