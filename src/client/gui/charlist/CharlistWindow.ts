/*
  Part of BrutusNEXT

  Charlist window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {CharlistForm} from '../../../client/gui/charlist/CharlistForm';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';

export class CharlistWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARLIST);
  }

  // ----------------- Private data ---------------------

  private charlistForm = new CharlistForm();

  ///private $charlist: JQuery = null;
  private $enterGameButton: JQuery = null;

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ windowParam: { name: 'charlist_window' }});

    this.setTitle("Your Characters");

    this.createButtonNewCharacter();
    this.createCharlistForm();
    this.createButtonEnterGame();
  }

  // ---------------- Private methods -------------------

  private createCharlistForm()
  {
    this.charlistForm.create({ $parent: this.$content });
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
        click: (event: MouseEvent) => { this.onEnterGameClick(event); }
      }
    );
  }

  // ---------------- Event handlers --------------------

  private onCreateNewCharacterClick(event: MouseEvent)
  {
    ClientApp.setState(ClientApp.State.CHARGEN);
  }

  private onEnterGameClick(event: MouseEvent)
  {
    ClientApp.setState(ClientApp.State.IN_GAME);
  }
}