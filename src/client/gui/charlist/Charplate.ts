/*
  Part of BrutusNEXT

  Character plate.
*/

'use strict';

import {Component} from '../../../client/gui/Component';

export class Charplate extends Component
{
  protected static get S_CSS_CLASS()
    { return 'S_Charplate'; }
  protected static get OUTER_CONTAINER_S_CSS_CLASS()
    { return 'S_Charplate_OuterContainer'; }
  protected static get PORTRAIT_S_CSS_CLASS()
    { return 'S_Charplate_Portrait'; }
  protected static get LABELS_CONTAINER_S_CSS_CLASS()
    { return 'S_Charplate_LabelsContainer'; }

  protected static get LABEL_BIG_S_CSS_CLASS()
    { return 'S_Charplate_LabelBig'; }
  protected static get LABEL_SMALL_S_CSS_CLASS()
    { return 'S_Charplate_LabelSmall'; }

  // ----------------- Private data ---------------------

  private $outerContainer: JQuery = null;
  private $charplate: JQuery = null;

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(param: Component.DivParam = {})
  {
    // Use outer container with no graphics and margin
    // to make sure that outline is drawn correctly when
    // the plate is focused.
    this.applyDefaults
    (
      param,
      {
        gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
        sCssClass: Charplate.OUTER_CONTAINER_S_CSS_CLASS
      }
    );

    this.$outerContainer = this.createDiv(param);

    this.createCharplate({ $parent: this.$outerContainer });
  }

  // ---------------- Private methods -------------------

  private createCharplate(param: Component.DivParam = {})
  {
    let $charplate = this.createDiv
    (
      {
        $parent: this.$outerContainer,
        gCssClass: Component.SELECTABLE_PLATE_G_CSS_CLASS,
        sCssClass: Charplate.S_CSS_CLASS,
        // Set 'tabindex' attribute to make the <div> selectable
        // ('-1' means: focusable only by script or mouse click,
        //  not by tabbing).
        // As a side effect, 'tabindex' also enables keyboard events
        // on <div> element.
        tabindex: -1,
        focus: (event: FocusEvent) => { this.onCharacterPlateFocus(event); }
      }
    );

    this.createPortrait({ $parent: $charplate });
    this.createPortraitLabels({ $parent: $charplate });
  }

  private createPortrait(param: Component.ImgParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: Charplate.PORTRAIT_S_CSS_CLASS,
        src: '/images/portraits/Zuzka.jpg'
      }
    );

    this.createImg(param);
  }

  private createPortraitLabels(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      { sCssClass: Charplate.LABELS_CONTAINER_S_CSS_CLASS }
    );

    let $container = this.createDiv(param);

    this.createNameLabel({ $parent: $container });
    this.createInfoLabel({ $parent: $container });
  }

  private createNameLabel(param: Component.LabelParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        sCssClass: Charplate.LABEL_BIG_S_CSS_CLASS,
        text: "Zuzka"
      }
    );

    this.createLabel(param);
  }

  private createInfoLabel(param: Component.LabelParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        sCssClass: Charplate.LABEL_SMALL_S_CSS_CLASS,
        text: "Level 1 priest"
      }
    );

    this.createLabel(param);
  }

  // private createCharacterPlate()
  // {
  //   // Use another container with no graphics and margin
  //   // to make sure that outline is drawn correctly when
  //   // the plate is focused.
  //   let $container = this.createDiv
  //   (
  //     {
  //       $parent: this.$charlist,
  //       gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
  //       sCssClass: CharlistWindow.CHARACTER_PLATE_CONTAINER_S_CSS_CLASS
  //     }
  //   );

  //   let $plate = this.createDiv
  //   (
  //     {
  //       $parent: $container,
  //       gCssClass: Component.SELECTABLE_PLATE_G_CSS_CLASS,
  //       sCssClass: CharlistWindow.CHARACTER_PLATE_S_CSS_CLASS,
  //       // Set 'tabindex' attribute to make the <div> selectable
  //       // ('-1' means: focusable only by script or mouse click,
  //       //  not by tabbing).
  //       // As a side effect, 'tabindex' also enables keyboard events
  //       // on <div> element.
  //       tabindex: -1,
  //       focus: (event: FocusEvent) => { this.onCharacterPlateFocus(event); }
  //     }
  //   );

  //   let $portrait = this.createImg
  //   (
  //     {
  //       $parent: $plate,
  //       gCssClass: Component.WINDOW_G_CSS_CLASS,
  //       sCssClass: CharlistWindow.PORTRAIT_S_CSS_CLASS,
  //       src: '/images/portraits/Zuzka.jpg'
  //     }
  //   );

  //   let $labelsContainer = this.createDiv
  //   (
  //     {
  //       $parent: $plate,
  //       sCssClass: CharlistWindow.LABELS_CONTAINER_S_CSS_CLASS
  //     }
  //   );

  //   this.createLabel
  //   (
  //     {
  //       $parent: $labelsContainer,
  //       sCssClass: CharlistWindow.CHARACTER_PLATE_LABEL_BIG_S_CSS_CLASS,
  //       text: "Zuzka"
  //     }
  //   );

  //   this.createLabel
  //   (
  //     {
  //       $parent: $labelsContainer,
  //       sCssClass: CharlistWindow.CHARACTER_PLATE_LABEL_SMALL_S_CSS_CLASS,
  //       text: "Level 1 priest"
  //     }
  //   );
  // }

  // ---------------- Event handlers --------------------

  private onCharacterPlateFocus(event: FocusEvent)
  {
    /// TODO:
    ///this.enable(this.$enterGameButton);
  }
}