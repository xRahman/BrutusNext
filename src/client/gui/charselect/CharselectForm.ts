/*
  Part of BrutusNEXT

  List of characters on an account.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Connection} from '../../../client/lib/connection/Connection';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/form/Form';
import {Charplate} from '../../../client/gui/charselect/Charplate';
import {CharselectWindow} from
  '../../../client/gui/charselect/CharselectWindow';
import {CharselectRequest} from
  '../../../shared/lib/protocol/CharselectRequest';
import {CharselectResponse} from
  '../../../shared/lib/protocol/CharselectResponse';
import {Character} from '../../../client/game/character/Character';

export class CharselectForm extends Form
{
  constructor
  (
    protected parent: CharselectWindow,
    param: Component.FormParam = {}
  )
  {
    super
    (
      parent,
      Utils.applyDefaults
      (
        param,
        {
          name: 'charselect_form',
          gCssClass: Component.WINDOW_G_CSS_CLASS,
          sCssClass: CharselectForm.S_CSS_CLASS
        }
      )
    );
  }

  // -------------- Static class data -------------------

  public static get S_CSS_CLASS()
    { return 'S_Charselect'; }

  // ----------------- Private data ---------------------

  // Key: character id
  // Value: charplate
  private charplates = new Map<string, Charplate>();

  // ---------------- Public methods --------------------

  // ~ Overrides Component.onShow().
  public onShow()
  {
    super.onShow();

    this.populate();
  }

  public selectCharacter(id: string)
  {
    let charplate = this.charplates.get(id);

    if (!charplate)
    {
      ERROR("Unable to find charplate for character id '" + id + "'."
        + " Charplate will not be selected");
      return;
    }

    charplate.select();
  }

  public scrollTo(charplate: Charplate)
  {
    // Convert hashmap values to array.
    let charplates = Array.from(this.charplates.values());

    if (charplates.length === 0)
    {
      // If there are no charplates, just scroll to the top.
      this.$element.scrollTop(0);
      return;
    }
    
    // Current position of the first charplate relative to the container.
    let firstElementPos = charplates[0].$element.position().top;
    // Current position of target charplate relative to the container.
    let charplateScrollPos = charplate.$element.position().top;

    // 'scrollTop()' sets number of pixels to be hidden by scrolling.
    //   This number is equal to the distance between position of the
    // first charplate and position of the charplate we want to select.
    this.$element.scrollTop(charplateScrollPos - firstElementPos);
  }

  public selectAdjacentCharacter
  (
    // Valid values are '1' (for previous character)
    // or '-1' (for next character).
    offset: number
  )
  {
    // If there are no characters in the list, there is nothing to select.
    if (this.charplates.size === 0)
      return;

    let id = this.getAdjacentCharacterId(offset);

    if (id)
      // Selecting the character will also scroll the list to it.
      this.selectCharacter(id);
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createRequest().
  protected createRequest()
  {
    console.log('CharselectForm.createRequest()');

    let id = this.getSelectedCharacterId();

    if (!id)
    {
      ERROR("Unable to find selected character id");
      return null;
    }

    let request = new CharselectRequest();

    request.characterId = id;

    return request;
  }

  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: CharselectRequest)
  {
    if (!request)
      return false;

    return true;
  }

  // ---------------- Private methods -------------------

  // -> Returns 'null' on error.
  private getOffsetPosition
  (
    characterIds: Array<string>,
    currentPos: number,
    offset: number
  )
  {
    if (offset !== -1 && offset !== 1)
    {
      ERROR("Invalid character position offset (" + offset + ")."
        + " Expected '-1' or '1'. Character is not selected");
      return null;
    }

    // If we are already at first or last character in the list, stay
    // at it (but we will still select it, which will scroll to it).
    return this.charlistBoundsCheck
    (
      currentPos + offset,      // Requested new position.
      characterIds.length - 1   // Maximum valid position.
    );
  }

  // -> Returns 'null' on error.
  private getAdjacentCharacterPosition
  (
    characterIds: Array<string>,
    offset: number
  )
  {
    // Id of currently selected character
    // (or 'null' if no character is selected).
    let id = this.getSelectedCharacterId();

    if (!id)
      // If no character is selected, pressing cursor 'up' or 'down' will
      // select the first character (at position 0).
      return 0;

    let currentPos = characterIds.indexOf(id);

    if (currentPos === -1)
    {
      ERROR("Unable to find id '" + id + "' in characterIds."
        + " Adjacent character will not be selected");
      return null;
    }

    return this.getOffsetPosition(characterIds, currentPos, offset);
  }

  // -> Returns 'null' on error.
  private getAdjacentCharacterId(offset: number)
  {
    // Convert hashmap keys to array.
    let characterIds = Array.from(this.charplates.keys());
    // Position of character in this.charplates to be selected.
    let newPos = this.getAdjacentCharacterPosition(characterIds, offset);

    if (newPos === null)
      return null;

    // Id of character adjacent to currently selected one.
    let id = characterIds[newPos];

    if (!id)
    {
      ERROR("Invalid character id in this.charlist"
        + " at position " + newPos + ". Charplate"
        + " is not selected");
      return null;
    }

    return id;
  }

  // -> Returns 'null' if no character is selected.
  private getSelectedCharacterId()
  {
    let id = this.$element.find(':checked').val();

    if (!id)
      return null;

    return id;
  }

  private createCharplate(character: Character)
  {
    let charplate = new Charplate
    (
      this,
      this.parent,
      character,
      { $parent: this.$element }
    );

    this.charplates.set(character.getId(), charplate);
  }

  private clear()
  {
    for (let charplate of this.charplates.values())
      charplate.remove();

    this.charplates.clear();
  }

  private populate()
  {
    this.clear();

    let account = Connection.account;

    for (let character of account.data.characters.values())
      this.createCharplate(character);
  }

  // Ensures that 'position' stays within <0, max> interval.
  private charlistBoundsCheck(position: number, max: number)
  {
    if (position < 0)
      return 0;

    if (position > max)
      return max;

    return position;
  }
}