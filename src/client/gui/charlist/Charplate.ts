/*
  Part of BrutusNEXT

  Character plate.
*/

'use strict';

import {Component} from '../../../client/gui/Component';
import {CharlistWindow} from '../../../client/gui/charlist/CharlistWindow';

export class Charplate extends Component
{
  constructor(private charlistWindow: CharlistWindow)
  {
    super();
  }

  protected static get S_CSS_CLASS()
    { return 'S_Charplate'; }
  protected static get OUTER_LABEL_S_CSS_CLASS()
    { return 'S_Charplate_OuterLabel'; }
  protected static get PORTRAIT_S_CSS_CLASS()
    { return 'S_Charplate_Portrait'; }
  protected static get LABELS_CONTAINER_S_CSS_CLASS()
    { return 'S_Charplate_LabelsContainer'; }
  protected static get LABEL_BIG_S_CSS_CLASS()
    { return 'S_Charplate_LabelBig'; }
  protected static get LABEL_SMALL_S_CSS_CLASS()
    { return 'S_Charplate_LabelSmall'; }

  // ----------------- Private data ---------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(param: Component.LabelParam = {})
  {
    // Implementation note:
    //   In order to style radiobutton with css, we need
    // to hide the actual radiobutton and style the element
    // right after it using 'input:checked + .class' css
    // selector.
    //   There are two ways to do it: Either we place a label
    // right next to (hidden) radiobutton and set a 'for'
    // attribute to it to bind it to the checkbox (so the
    // checkbox is cliecked when the label is clicked, or we
    // put a checkbox inside a label (which also makes it
    // clicked anytime the label is clicked) and put another
    // element inside the label which we will be able to style
    // using the '+' css selector.
    //   We use the second option because it allows us to style
    // something else than <label> and we don't have to use
    // 'for' attribute on label this way.

    // Create a <label> element.
    let $label = this.createLabelContainer(param);
    
    // Put a hidden radiobutton inside it.
    this.createRadiobutton({ $parent: $label });

    // Put another element inside the label which will
    // be styled using css.
    this.createCharplate({ $parent: $label });
  }

  // ---------------- Private methods -------------------

  private createLabelContainer(param: Component.LabelParam)
  {
    this.applyDefaults
    (
      param,
      {
        gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
        sCssClass: Charplate.OUTER_LABEL_S_CSS_CLASS
      }
    );

    return this.createLabel(param);
  }

  private createRadiobutton(param: Component.RadioInputParam)
  {
    this.applyDefaults
    (
      param,
      {
        sCssClass: Component.HIDDEN_S_CSS_CLASS,
        change: (event) => this.onChange(event)
      }
    );

    this.createRadioInput(param);
  }

  private createCharplate(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        gCssClass: Component.SELECTABLE_PLATE_G_CSS_CLASS,
        sCssClass: Charplate.S_CSS_CLASS,
        // Note: 'dblclick' event must be attached to the
        // charplate rather than the actual radiobutton
        // because the radiobutton is hidden so it doesn't
        // fire mouse events (other than 'change' which it
        // fires because it's inside a label that also
        // contains charplate).
        dblclick: (event) => this.onDoubleClick(event)
      }
    );

    let $charplate = this.createDiv(param);

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
        src: '/images/portraits/Zuzka.jpg',
        draggable: false
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

  private createNameLabel(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        sCssClass: Charplate.LABEL_BIG_S_CSS_CLASS,
        text: "Zuzka"
      }
    );

    // Note: We can't use <label> element because
    // it would prevent clicks on the radiobutton.
    this.createDiv(param);
  }

  private createInfoLabel(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        sCssClass: Charplate.LABEL_SMALL_S_CSS_CLASS,
        text: "Level 1 priest"
      }
    );

    // Note: We can't use <label> element because
    // it would prevent clicks on the radiobutton.
    this.createDiv(param);
  }

  // ---------------- Event handlers --------------------

  private onChange(event: JQueryEventObject)
  {
    this.charlistWindow.onSelectionChange();
  }

  private onDoubleClick(event: JQueryEventObject)
  {
    console.log('onDoubleclick');
    this.charlistWindow.onCharplateDoubleClick();
  }
}