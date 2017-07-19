/*
  Part of BrutusNEXT

  List of characters on an account.
*/

'use strict';

import {Component} from '../../../client/gui/Component';
import {Charplate} from '../../../client/gui/charlist/Charplate';

export class Charlist extends Component
{
  public static get S_CSS_CLASS()
    { return 'S_Charlist'; }

  // ----------------- Private data ---------------------

  private $charlist: JQuery = null;

  private charplates = new Array<Charplate>();

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: Charlist.S_CSS_CLASS
      }
    );

    this.$charlist = this.createDiv(param);

    /// TEST:
    /// TODO: Tohle by se asi spíš mělo volat v onShow() nebo tak.
    this.populate();
  }

  // ---------------- Private methods -------------------

  private createCharacterPlate()
  {
    let charplate = new Charplate();

    charplate.create({ $parent: this.$charlist });

    this.charplates.push(charplate);
  }

  private populate()
  {
    this.createCharacterPlate();
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

}