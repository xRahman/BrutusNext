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
    this.$element.scrollTop(charplate.getScrollPosition());
  }

  public selectAdjacentCharacter(offset: number)
  {
    // If there are no characters in the list, there is nothing to select.
    if (this.charplates.size === 0)
      return;

    if (offset !== -1 && offset !== 1)
    {
      ERROR("Invalid character position offset (" + offset + ")."
        + " Expected '-1' or '1'. Character is not selected");
      return;
    }

    // Position of character in this.charplates to be selected.
    let newPos = 0;
    // Id of currently selected character
    // (or 'null' if no character is selected).
    let id = this.getSelectedCharacterId();
    // Convert map keys to array so we can get index of 'id'.
    let characterIds = Array.from(this.charplates.keys());

    if (id)
    {
      let currentPos = characterIds.indexOf(id);

      if (currentPos !== -1)
        newPos = currentPos + offset;

      // If we are already at first or last character in the list, stay
      // at it (but we will still select it, which will scroll to it).
      newPos = this.charlistBoundsCheck(newPos, characterIds.length - 1);
    }

    let newId = characterIds[newPos];

    if (!newId)
    {
      ERROR("Invalid character id in this.charlist"
        + " at position " + newPos + ". Charplate"
        + " is not selected");
      return;
    }

    this.selectCharacter(newId);
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

  // -> Returns id of selected character,
  //    Returns 'null' if no character is selected.
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