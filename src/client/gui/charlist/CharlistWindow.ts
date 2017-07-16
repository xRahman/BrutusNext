/*
  Part of BrutusNEXT

  Charlist window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';

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
  protected static get CHARACTER_PLATE_LABEL_BIG_S_CSS_CLASS()
    { return 'S_CharlistWindow_CharacterPlateLabelBig'; }
  protected static get CHARACTER_PLATE_LABEL_SMALL_S_CSS_CLASS()
    { return 'S_CharlistWindow_CharacterPlateLabelSmall'; }
  protected static get PORTRAIT_S_CSS_CLASS()
    { return 'S_CharlistWindow_Portrait'; }
  protected static get LABELS_CONTAINER_S_CSS_CLASS()
    { return 'S_CharlistWindow_LabelsContainer'; }

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
    super.create({ name: 'charlist_window' });

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
    let $container = this.createDiv
    (
      {
        $parent: this.$charlist,
        gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
        sCssClass: CharlistWindow.CHARACTER_PLATE_CONTAINER_S_CSS_CLASS
      }
    );

    let $plate = this.createDiv
    (
      {
        $parent: $container,
        gCssClass: Component.SELECTABLE_PLATE_G_CSS_CLASS,
        sCssClass: CharlistWindow.CHARACTER_PLATE_S_CSS_CLASS,
        // Set 'tabindex' attribute to make the <div> selectable
        // ('-1' means: focusable only by script or mouse click,
        //  not by tabbing).
        // As a side effect, 'tabindex' also enables keyboard events
        // on <div> element.
        tabindex: -1,
        focus: (event: FocusEvent) => { this.onCharacterPlateFocus(event); }
      }
    );

    let $portrait = this.createImg
    (
      {
        $parent: $plate,
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: CharlistWindow.PORTRAIT_S_CSS_CLASS,
        src: '/images/portraits/Zuzka.jpg'
      }
    );

    let $labelsContainer = this.createDiv
    (
      {
        $parent: $plate,
        sCssClass: CharlistWindow.LABELS_CONTAINER_S_CSS_CLASS
      }
    );

    this.createLabel
    (
      {
        $parent: $labelsContainer,
        sCssClass: CharlistWindow.CHARACTER_PLATE_LABEL_BIG_S_CSS_CLASS,
        text: "Zuzka"
      }
    );

    this.createLabel
    (
      {
        $parent: $labelsContainer,
        sCssClass: CharlistWindow.CHARACTER_PLATE_LABEL_SMALL_S_CSS_CLASS,
        text: "Level 1 priest"
      }
    );
  }

  private populateCharlist()
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

  private createCharlist()
  {
    this.$charlist = this.createDiv
    (
      {
        $parent: this.$content,
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: CharlistWindow.CHARLIST_S_CSS_CLASS
      }
    );

    this.populateCharlist();
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

  private onCharacterPlateFocus(event: FocusEvent)
  {
    this.$enterGameButton.prop('disabled', false);
  }

  private onCreateNewCharacterClick(event: MouseEvent)
  {
    ClientApp.setState(ClientApp.State.CHARGEN);
  }

  private onEnterGameClick(event: MouseEvent)
  {
    ClientApp.setState(ClientApp.State.IN_GAME);
  }
}