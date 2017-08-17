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
import {CharselectWindow} from '../../../client/gui/charselect/CharselectWindow';
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

  public static get S_CSS_CLASS()
    { return 'S_Charselect'; }

  // ----------------- Private data ---------------------

  // Key: character id
  // Value: charplate
  private charplates = new Map<string, Charplate>();

  // ---------------- Public methods --------------------

  // // -> Returns created jquery element.
  // public create(param: Component.DivParam = {})
  // {
  //   this.applyDefaults
  //   (
  //     param,
  //     {
  //       name: 'charselect_form',
  //       gCssClass: Component.WINDOW_G_CSS_CLASS,
  //       sCssClass: CharselectForm.S_CSS_CLASS
  //     }
  //   );

  //   super.create(param);
  // }

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

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createRequest().
  protected createRequest()
  {
    console.log('CharselectForm.createRequest()');

    let id = this.$element.find(':checked').val();

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

  private createCharacterPlate(character: Character)
  {
    let charplate = new Charplate
    (
      this.parent,
      character,
      { $parent: this.$element }
    );

    this.charplates.set(character.getId(), charplate);
  }

  private clear()
  {
    for (let charplate of this.charplates.values())
      charplate.delete();

    this.charplates.clear();
    
    /// Tohle už by nemělo bejt potřeba, dělá se to v charplate.delete().
    // this.$element.empty();
  }

  private populate()
  {
    this.clear();

    let account = Connection.account;

    for (let character of account.data.characters.values())
      this.createCharacterPlate(character);

    // this.createCharacterPlate();
    // this.createCharacterPlate();
    ///this.createCharacterPlate();
    /*
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    this.createCharacterPlate();
    */

    /// TODO.
  }

  // ---------------- Event handlers --------------------

  // // ~ Overrides Form.onSubmit().
  // protected onSubmit(event: JQueryEventObject)
  // {
  //   // We will handle the form submit ourselves.
  //   event.preventDefault();

  //   ERROR("CharselectForm is not supposed to be submited."
  //     + " CharselectWindow.enterGame() should be called"
  //     + " instead");
  // }
}