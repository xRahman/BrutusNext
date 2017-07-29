/*
  Part of BrutusNEXT

  Character selection window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {CharselectForm} from '../../../client/gui/charselect/CharselectForm';
import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';

export class CharselectWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARSELECT);
  }

  // ----------------- Private data ---------------------

  private charselectForm = new CharselectForm(this);
  private $enterGameButton: JQuery = null;

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ windowParam: { name: 'charselect_window' }});

    this.setTitle("Your Characters");

    this.createButtonNewCharacter();
    this.createCharselectForm();
    this.createButtonEnterGame();
  }

  public onSelectionChange()
  {
    this.enable(this.$enterGameButton);
  }

  public onCharplateDoubleClick()
  {
    this.enterGame();
  }

  // ---------------- Private methods -------------------

  private createCharselectForm()
  {
    this.charselectForm.create({ $parent: this.$content });
  }

  private createButtonNewCharacter()
  {
    let $button = this.createButton
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
    this.$enterGameButton = this.createButton
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

  private enterGame()
  {
    /// TODO: Přečíst z charselectForm, jaký je selectnutý char,
    /// a setnout ho jako ingame entity.

    ClientApp.setState(ClientApp.State.IN_GAME);
  }

  // ---------------- Event handlers --------------------

  private onCreateNewCharacterClick(event: JQueryEventObject)
  {
    this.enterChargen();
  }

  private onEnterGameClick(event: JQueryEventObject)
  {
    this.enterGame();
  }
}