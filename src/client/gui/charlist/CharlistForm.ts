/*
  Part of BrutusNEXT

  List of characters on an account.
*/

'use strict';

import {Form} from '../../../client/gui/Form';
import {Component} from '../../../client/gui/Component';
import {Charplate} from '../../../client/gui/charlist/Charplate';
import {CharlistWindow} from '../../../client/gui/charlist/CharlistWindow';

export class CharlistForm extends Form
{
  constructor(private charlistWindow: CharlistWindow)
  {
    super();
  }

  public static get S_CSS_CLASS()
    { return 'S_Charlist'; }

  // ----------------- Private data ---------------------

  private charplates = new Array<Charplate>();

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        name: 'charlist_form',
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: CharlistForm.S_CSS_CLASS
      }
    );

    super.create(param);

    /// TEST:
    /// TODO: Tohle by se asi spíš mělo volat v onShow() nebo tak.
    this.populate();
  }

  // ---------------- Private methods -------------------

  private createCharacterPlate()
  {
    let charplate = new Charplate(this.charlistWindow);

    charplate.create({ $parent: this.$form });

    this.charplates.push(charplate);
  }

  private populate()
  {
    this.createCharacterPlate();
    this.createCharacterPlate();
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

  // ~ Overrides Form.onSubmit().
  protected onSubmit(event: JQueryEventObject)
  {
    // We will handle the form submit ourselves.
    event.preventDefault();

    /// TODO
  }
}