/*
  Part of BrutusNEXT

  Character selection window.
*/

'use strict';

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
    this.createButtonEnterGame();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARSELECT);
  }

  // ----------------- Private data ---------------------

  // ~ Overrides FormWindow.form.
  private $enterGameButton: JQuery = null;

  // ----------------- Public data ---------------------- 

  public form: CharselectForm = null;

  // ---------------- Public methods --------------------

  public onSelectionChange()
  {
    this.enable(this.$enterGameButton);
  }

  // ---------------- Private methods -------------------

  private createCharselectForm()
  {
    this.form = new CharselectForm(this, { $parent: this.$content });
  }

  private createButtonNewCharacter()
  {
    let $button = this.$createButton
    (
      {
        $parent: this.$content,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        text: 'Create New Character',
        click: (event) => { this.onCreateNewCharacterClick(event); }
      }
    );
  }

  private createButtonEnterGame()
  {
    this.$enterGameButton = this.$createButton
    (
      {
        $parent: this.$content,
        text: 'Enter Game',
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        disabled: true,
        click: (event) => { this.onEnterGameClick(event); }
      }
    );
  }

  private enterChargen()
  {
    ClientApp.setState(ClientApp.State.CHARGEN);
  }

  // ---------------- Event handlers --------------------

  private onCreateNewCharacterClick(event: JQueryEventObject)
  {
    this.enterChargen();
  }

  private onEnterGameClick(event: JQueryEventObject)
  {
    this.form.submit();
  }

  // ~ Overrides FormeWindow.onKeyDown().
  // Handles 'keydown' event fired on html document
  // (it means that this handler runs even if this
  //  window desn't have focus).
  public onKeyDown(event: JQueryKeyEventObject)
  {
    // Super call handles 'Enter' and 'Escape' keys.
    super.onKeyDown(event);

    let key = event.which;

    switch (key)
    {
      case 33:  // 'PgUp'
/// TODO: Tohle nefunguje, protože form nemůže dostat focus.
        this.form.focus();
        break;
      case 34:  // 'PgDn'
/// TODO: Tohle nefunguje, protože form nemůže dostat focus.
        this.form.focus();
        break;

      case 38:  // 'Up'
        this.form.selectAdjacentCharacter(-1);
        // We don't want default event handler to scroll the contents
        // after we scrolled to the selected element.
        event.preventDefault();
        break;

      case 40:  // 'Down'
        this.form.selectAdjacentCharacter(+1);
        // We don't want default event handler to scroll the contents
        // after we scrolled to the selected element.
        event.preventDefault();
        break;
    }
  }
}