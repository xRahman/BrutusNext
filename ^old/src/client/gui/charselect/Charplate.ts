/*
  Part of BrutusNEXT

  Character plate.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Component} from '../../../client/gui/Component';
import {CharselectForm} from
  '../../../client/gui/charselect/CharselectForm';
import {CharselectWindow} from
  '../../../client/gui/charselect/CharselectWindow';
import {Character} from '../../../client/game/character/Character';

export class Charplate extends Component
{
  constructor
  (
    protected parent: CharselectForm,
    private charselectWindow: CharselectWindow,
    private character: Character,
    param: Component.LabelParam = {}
  )
  {
    super(parent);

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

    // Create a <label> element
    // (it will also server as container element).
    this.$element = this.createLabelContainer(param);

    if (!this.$element)
    {
      ERROR("Failed to create label container in charplate."
        + " Charplate won't be created as well");
      return;
    }
    
    // Put a hidden radio input inside it.
    this.$radio = this.createRadio({ $parent: this.$element });

    // Put another element inside the label which will
    // be styled using css.
    this.createCharplate({ $parent: this.$element });
  }

  // -------------- Static class data -------------------

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

  private $radio: (JQuery | null) = null;

  // ---------------- Public methods --------------------

  public select(direction: CharselectForm.SelectDirection)
  {
    if (!this.$radio)
    {
      ERROR("Radio input doesn't exist. Charplate is not selected");
      return;
    }

    this.$radio.prop('checked', true);

    this.parent.scrollTo(this, direction);

    this.parent.onSelectionChange();
  }

  // ---------------- Private methods -------------------

  private createLabelContainer(param: Component.LabelParam)
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
        sCssClass: Charplate.OUTER_LABEL_S_CSS_CLASS
      }
    );

    return this.$createLabel(param);
  }

  private createRadio(param: Component.RadioInputParam)
  {
    if (!this.character || !this.character.isValid())
    {
      ERROR("Invalid 'character' on charplate. Radiobutton is not created");
      return null;
    }

    let characterId = this.character.getId();

    if (!characterId)
    {
      ERROR("Failed to create radiobutton in charplate"
        + " because character " + this.character.getErrorIdString()
        + " assigned to charplate doesn't have a valid id");
      return null;
    }

    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Component.HIDDEN_S_CSS_CLASS,
        // This value will be read to extract character 'id' when
        // 'enter game' button is pressed.
        value: characterId,
        change: (event: JQueryEventObject) => this.onChange(event)
      }
    );

    return this.$createRadioInput(param);
  }

  private createCharplate(param: Component.DivParam = {})
  {
    Utils.applyDefaults
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
        dblclick: (event: JQueryEventObject) => this.onDoubleClick(event)
      }
    );

    let $charplate = this.$createDiv(param);

    if (!$charplate)
    {
      ERROR("Failed to create $charplate element");
      return;
    }

    this.createPortrait({ $parent: $charplate });
    this.createPortraitLabels({ $parent: $charplate });
  }

  private createPortrait(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: Charplate.PORTRAIT_S_CSS_CLASS,
        backgroundImage: '/images/portraits/Zuzka.jpg'
      }
    );

    this.$createDiv(param);
  }

  private createPortraitLabels(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      { sCssClass: Charplate.LABELS_CONTAINER_S_CSS_CLASS }
    );

    let $container = this.$createDiv(param);

    if (!$container)
    {
      ERROR("Failed to create $container element");
      return;
    }

    this.createNameLabel({ $parent: $container });
    this.createInfoLabel({ $parent: $container });
  }

  private createNameLabel(param: Component.DivParam = {})
  {
    if (!this.character || !this.character.isValid())
    {
      ERROR("Invalid 'character' on charplate. Name label is not created");
      return;
    }

    let characterName = this.character.getName();

    if (characterName === null)
    {
      ERROR("Invalid character name on character"
        + " " + this.character.getErrorIdString());
      characterName = "";
    }

    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Charplate.LABEL_BIG_S_CSS_CLASS,
        text: characterName
      }
    );

    // Note: We can't use <label> element because
    // it would prevent clicks on the radiobutton.
    this.$createDiv(param);
  }

  private createInfoLabel(param: Component.DivParam = {})
  {
    if (!this.character || !this.character.isValid())
    {
      ERROR("Invalid 'character' on charplate. Info label is not created");
      return;
    }

    /// TODO: Tohle je zatím čistě ilustrační.
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Charplate.LABEL_SMALL_S_CSS_CLASS,
        text: "Level 1 priest"
      }
    );

    // Note: We can't use <label> element because
    // it would prevent clicks on the radiobutton.
    this.$createDiv(param);
  }

  // ---------------- Event handlers --------------------

  private onChange(event: JQueryEventObject)
  {
    this.parent.onSelectionChange();
  }

  private onDoubleClick(event: JQueryEventObject)
  {
    this.parent.submit();
  }
}