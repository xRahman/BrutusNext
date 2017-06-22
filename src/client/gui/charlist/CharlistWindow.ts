/*
  Part of BrutusNEXT

  Register window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';

import $ = require('jquery');

export class CharlistWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARLIST);
  }

  protected static get CHARLIST_S_CSS_CLASS()
    { return 'S_CharlistWindow_Charlist'; }
  protected static get CHARACTER_PLATE_CONTAINER_S_CSS_CLASS()
    { return 'S_CharlistWindow_CharacterPlateContainer'; }
  protected static get CHARACTER_PLATE_S_CSS_CLASS()
    { return 'S_CharlistWindow_CharacterPlate'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private $charlist: JQuery = null;
  private $enterGameButton: JQuery = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create();

    this.setTitle("Your Characters");

    this.createButtonNewCharacter();

    this.createCharlist();

    this.createButtonEnterGame();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createCharacterPlate()
  {
    // Use another container with no graphics and margin
    // to make sure that outline is drawn correctly when
    // the plate is focused.
    let $container = Component.createDiv
    (
      {
        $container: this.$charlist,
        gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
        sCssClass: CharlistWindow.CHARACTER_PLATE_CONTAINER_S_CSS_CLASS
      }
    );

    let $plate = Component.createDiv
    (
      {
        $container: $container,
        gCssClass: Component.SELECTABLE_PLATE_G_CSS_CLASS,
        sCssClass: CharlistWindow.CHARACTER_PLATE_S_CSS_CLASS
      }
    );

    // Set 'tabindex' attribute to make the <div> selectable
    // ('-1' means: focusable only by script or mouse click,
    //  not by tabbing).
    // As a side effect, 'tabindex' also enables keyboard events
    // on <div> element.
    $plate.attr('tabindex',  '-1');

    $plate.text("Zuzka (level 1 priest)");

    $plate.focus
    (
      (event: Event) => { this.onCharacterPlateFocus(event); }
    );
  }

  private populateCharlist()
  {
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
    this.createCharacterPlate();

    /// TODO.
  }

  private createCharlist()
  {
    this.$charlist = Component.createDiv
    (
      {
        $container: this.$content,
        sCssClass: CharlistWindow.CHARLIST_S_CSS_CLASS
      }
    );
    /// Container by měl mít pevnou velikost - ideálně celočíselný
    /// násobek velikosti 1 charu + 2 * padding.

    this.populateCharlist();
  }

  private createButtonNewCharacter()
  {
    let $button = Component.createButton
    (
      {
        $container: this.$content,
        sCssClass: Component.FULL_WIDTH_BUTTON_S_CSS_CLASS,
        text: 'Create New Character'
      }
    );

    $button.click
    (
      (event: Event) => { this.onCreateNewCharacterClick(event); }
    );
  }

  private createButtonEnterGame()
  {
    this.$enterGameButton = Component.createButton
    (
      {
        $container: this.$content,
        sCssClass: Component.FULL_WIDTH_BUTTON_S_CSS_CLASS,
        text: 'Enter Game',
      },
      {
        disabled: true
      }
    );

    this.$enterGameButton.click
    (
      (event: Event) => { this.onEnterGameClick(event); }
    );
  }

  // ---------------- Event handlers --------------------

  private onCharacterPlateFocus(event: Event)
  {
    this.$enterGameButton.prop('disabled', false);
  }

  private onCreateNewCharacterClick(event: Event)
  {
    console.log("Clicked on 'Create New Character'");
    ClientApp.setState(ClientApp.State.CHARGEN);
  }

  private onEnterGameClick(event: Event)
  {
    console.log("Clicked on 'Enter Game'");
    ClientApp.setState(ClientApp.State.IN_GAME);
  }
}