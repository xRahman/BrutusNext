/*
  Part of BrutusNEXT

  List of characters on an account.
*/

'use strict';

import {Form} from '../../../client/gui/form/Form';
import {Component} from '../../../client/gui/Component';
import {Charplate} from '../../../client/gui/charselect/Charplate';
import {CharselectWindow} from '../../../client/gui/charselect/CharselectWindow';
import {CharselectRequest} from
  '../../../shared/lib/protocol/CharselectRequest';
import {CharselectResponse} from
  '../../../shared/lib/protocol/CharselectResponse';

export class CharselectForm extends Form
{
  constructor(private charselectWindow: CharselectWindow)
  {
    super();
  }

  public static get S_CSS_CLASS()
    { return 'S_Charselect'; }

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
        name: 'charselect_form',
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: CharselectForm.S_CSS_CLASS
      }
    );

    super.create(param);

    /// TEST:
    /// TODO: Tohle by se asi spíš mělo volat v onShow() nebo tak.
    this.populate();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createRequest().
  protected createRequest()
  {
    let request = new CharselectRequest();

    /// TODO: Vyřešit pamatování idček charů a tady ho přiřadit do requestu.
    // request.selectedCharacterId = this.$emailInput.val();

    return request;
  }

  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: CharselectRequest)
  {
    // There is nothing to validate in charselect form.
    return true;
  }

  // ---------------- Private methods -------------------

  private createCharacterPlate()
  {
    let charplate = new Charplate(this.charselectWindow);

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