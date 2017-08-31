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
      Utils.applyDefaults(param, { name: 'charselect_form' })
    );

    this.createCharlist();
    this.createSubmitButton();
  }

  // -------------- Static class data -------------------

  public static get CHARLIST_S_CSS_CLASS()
    { return 'S_CharselectForm_Charlist'; }

  // ----------------- Private data ---------------------

  private $charlist: JQuery = null;

  // Key: character id
  // Value: charplate
  private charplates = new Map<string, Charplate>();

  // ---------------- Public methods --------------------

  public onSelectionChange()
  {
    this.enable(this.$submitButton);
  }

  public focusCharlist()
  {
    this.$charlist.focus();
  }

  // ~ Overrides Component.onShow().
  public onShow()
  {
    super.onShow();

    this.populate();
    this.selectLastActiveCharacter();
  }

  public selectCharacter
  (
    id: string,
    // Default is 'PREVIOUS' - charlist will be scrolled
    // such that selected character is first.
    direction = CharselectForm.SelectDirection.PREVIOUS
  )
  {
    let charplate = this.charplates.get(id);

    if (!charplate)
    {
      ERROR("Unable to find charplate for character id '" + id + "'."
        + " Charplate is not selected");
      return;
    }

    charplate.select(direction);
  }

  public scrollTo
  (
    charplate: Charplate,
    direction: CharselectForm.SelectDirection
  )
  {
    if (this.charplates.size === 0)
    {
      // If there are no charplates, just scroll to the top.
      this.$charlist.scrollTop(0);
      return;
    }

    let topScrollPos = this.getTopScrollPos(charplate);
    let bottomScrollPos = this.getBottomScrollPos(charplate);

    // Do not change how charlist is scrolled if charplate already
    // is fully visible.
    if (this.isScrolledTo(charplate, topScrollPos, bottomScrollPos))
      return;

    switch (direction)
    {
      case CharselectForm.SelectDirection.NEXT:
        this.$charlist.scrollTop(bottomScrollPos);
        break;

      case CharselectForm.SelectDirection.PREVIOUS:
        this.$charlist.scrollTop(topScrollPos);
        break;

      default:
        ERROR("Invalid select direction");
        break;
    }
  }

  public selectPreviousCharacter()
  {
    // If there are no characters in the list, there is nothing to select.
    if (this.charplates.size === 0)
      return;

    let id = this.getAdjacentCharacterId
    (
      CharselectForm.SelectDirection.PREVIOUS
    );

    if (id)
      // Selecting the character will also scroll the list to it.
      this.selectCharacter(id, CharselectForm.SelectDirection.PREVIOUS);
  }

  public selectNextCharacter()
  {
    // If there are no characters in the list, there is nothing to select.
    if (this.charplates.size === 0)
      return;

    let id = this.getAdjacentCharacterId
    (
      CharselectForm.SelectDirection.NEXT
    );

    if (id)
      // Selecting the character will also scroll the list to it.
      this.selectCharacter(id, CharselectForm.SelectDirection.NEXT);
  }

  public selectAdjacentCharacter(direction: CharselectForm.SelectDirection)
  {
    // If there are no characters in the list, there is nothing to select.
    if (this.charplates.size === 0)
      return;

    let id = this.getAdjacentCharacterId(direction);

    if (id)
      // Selecting the character will also scroll the list to it.
      this.selectCharacter(id);
  }
    
  public displayProblem(response: CharselectResponse)
  {
    switch (response.result)
    {
      case CharselectResponse.Result.UNDEFINED:
        ERROR("Received charselect response with unspecified result."
          + " Someone problably forgot to set 'packet.result'"
          + " when sending charselect response from the server");
        break;

      case CharselectResponse.Result.ERROR:
        this.displayError(response.getProblem());
        break;

      case CharselectResponse.Result.OK:
        ERROR("displayProblem() called with 'Result: OK'");
        break;

      default:
        ERROR("Unknown register response result");
        break;
    }
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

  private isScrolledTo
  (
    charplate: Charplate,
    topScrollPos: number,
    bottomScrollPos: number
  )
  {
    let scrollPos = this.$charlist.scrollTop();

    // Note that 'bottomScrollPos' is always bigger than 'topScrollPoss'
    // (they are the scroll positions that place the charplate to the
    //  top or bottom of the charlist scroll area, not the positions
    //  of charplate itself).
    return scrollPos >= bottomScrollPos && scrollPos <= topScrollPos;
  }

  // -> Returns such 'scrollTop()' value of $charlist element
  //    that 'charplate' is shown at the top of scrollable area.
  private getTopScrollPos(charplate: Charplate)
  {
    // Convert hashmap values to array.
    let charplates = Array.from(this.charplates.values());

    if (charplates.length === 0)
      return 0;

    // Current position of the first charplate relative to the container.
    let firstElementPos = charplates[0].$element.position().top;

    // Current position of target charplate relative to the container.
    let charplateScrollPos = charplate.$element.position().top;

    return charplateScrollPos - firstElementPos;
  }

  // -> Returns such 'scrollTop()' value of $charlist element
  //    that 'charplate' is shown at the bottom of scrollable area.
  private getBottomScrollPos(charplate: Charplate)
  {
    // $charlist 'scrollTop()' position placing 'charplate' at the top.
    let topScrollPos = this.getTopScrollPos(charplate);

    // Height of scrollable area of $charlist element.
    let charlistHeight = this.$charlist.height();

    // Parameter means "include margin".
    let charplateOuterHeight = charplate.$element.outerHeight(true);

    return topScrollPos - charlistHeight + charplateOuterHeight;
  }

  private createCharlist()
  {
    this.$charlist = this.$createDiv
    (
      {
        name: 'charlist',
        $parent: this.$element,
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: CharselectForm.CHARLIST_S_CSS_CLASS,
        // We need to set 'tabindex' attribute so the charlist
        // can be given focus. That is necessary for it to be able
        // to process keyboard events.
        tabindex: -1
      }
    );
  }

  private createSubmitButton()
  {
    this.$createSubmitButton
    (
      {
        $parent: this.$element,
        text: 'Enter Game',
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        disabled: true
      }
    );
  }

  // -> Returns 'null' on error.
  private getPositionInDirection
  (
    characterIds: Array<string>,
    currentPos: number,
    direction: CharselectForm.SelectDirection
  )
  {
    let maxPosition = characterIds.length - 1;

    switch (direction)
    {
      case CharselectForm.SelectDirection.NEXT:
        return this.charlistBoundsCheck(currentPos + 1, maxPosition);

      case CharselectForm.SelectDirection.PREVIOUS:
        return this.charlistBoundsCheck(currentPos - 1, maxPosition);

      default:
        ERROR("Invalid direction value");
        break;
    }
  }

  // -> Returns 'null' on error.
  private getAdjacentCharacterPosition
  (
    characterIds: Array<string>,
    direction: CharselectForm.SelectDirection
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

    return this.getPositionInDirection(characterIds, currentPos, direction);
  }

  // -> Returns 'null' on error.
  private getAdjacentCharacterId(direction: CharselectForm.SelectDirection)
  {
    // Convert hashmap keys to array.
    let characterIds = Array.from(this.charplates.keys());
    // Position of character in this.charplates to be selected.
    let newPos = this.getAdjacentCharacterPosition(characterIds, direction);

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
      { $parent: this.$charlist }
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

  private selectLastActiveCharacter()
  {
    let account = Connection.account;

    if (!account)
    {
      ERROR("Invalid account. Last active character is not selected");
      return;
    }

    let lastActiveCharacter = account.data.lastActiveCharacter;

    // 'lastActiveCharacter' can be null if there is no character
    // on the account yet.
    if (lastActiveCharacter)
      this.selectCharacter(lastActiveCharacter.getId());
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

// ------------------ Type Declarations ----------------------

export module CharselectForm
{
  export enum SelectDirection
  {
    PREVIOUS,
    NEXT
  }
}