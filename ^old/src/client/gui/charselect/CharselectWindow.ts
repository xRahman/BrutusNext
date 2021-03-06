/*
  Part of BrutusNEXT

  Character selection window.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {FormWindow} from '../../../client/gui/window/FormWindow';
import {CharselectForm} from '../../../client/gui/charselect/CharselectForm';

export class CharselectWindow extends FormWindow
{
  constructor()
  {
    super({ windowParam: { name: 'charselect_window' }});

    this.setTitle("Your Characters");

    this.createButtonNewCharacter();
    this.createCharselectForm();
    ///this.createButtonEnterGame();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARSELECT);
  }

  // --------------- Public accessors -------------------

  // ! Throws an exception on error.
  public getForm(): CharselectForm
  {
    if (!this.form)
      throw new Error("Charselect form doesn't exist");

    return this.form;
  }

  // ----------------- Public data ----------------------

  // ---------------- Protected data --------------------

  // ~ Overrides FormWindow.form.
  protected form: (CharselectForm | null) = null;

  // ----------------- Private data ---------------------

  // ~ Overrides FormWindow.form.
  private $enterGameButton: (JQuery | null) = null;


  // ---------------- Private methods -------------------

  private createCharselectForm()
  {
    if (this.form !== null)
    {
      ERROR("Charselect form already exists. Not creating it again");
      return;
    }

    if (!this.$content)
    {
      ERROR("Failed to create form component in charselect window"
        + " because $content element is missing");
      return;
    }

    this.form = new CharselectForm(this, { $parent: this.$content });
  }

  private createButtonNewCharacter()
  {
    if (!this.$content)
    {
      ERROR("Failed to create 'new character' $button in charselect"
        + " window because $content element is missing");
      return;
    }

    this.$createButton
    (
      {
        $parent: this.$content,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        text: 'Create New Character',
        click: (event: JQueryEventObject) =>
          { this.onCreateNewCharacterClick(event); }
      }
    );
  }

  private enterChargen()
  {
    ClientApp.switchToState(ClientApp.State.CHARGEN);
  }

  // ---------------- Event handlers --------------------

  private onCreateNewCharacterClick(event: JQueryEventObject)
  {
    this.enterChargen();
  }

  // ~ Overrides FormeWindow.onKeyDown().
  // Handles 'keydown' event fired on html document
  // (it means that this handler runs even if this
  //  window desn't have focus).
  public onKeyDown(event: JQueryEventObject)
  {
    // Super call handles 'Enter' and 'Escape' keys.
    super.onKeyDown(event);

    if (!this.form)
    {
      ERROR("Invalid form component");
      return;
    }

    let key = event.which;

    switch (key)
    {
      case 33:  // 'PgUp'
        // Set focus to 'charlist' component so it can
        // process the event.
        this.form.focusCharlist();
        break;

      case 34:  // 'PgDn'
        // Set focus to 'charlist' component so it can
        // process the event.
        this.form.focusCharlist();
        break;

      case 38:  // 'Up'
        this.form.selectPreviousCharacter();
        ///this.form.selectAdjacentCharacter(-1);
        // We don't want default event handler to scroll the contents
        // after we scrolled to the selected element.
        event.preventDefault();
        break;

      case 40:  // 'Down'
        this.form.selectNextCharacter();
        ///this.form.selectAdjacentCharacter(+1);
        // We don't want default event handler to scroll the contents
        // after we scrolled to the selected element.
        event.preventDefault();
        break;
    }
  }
}