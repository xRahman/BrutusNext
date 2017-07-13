/*
  Part of BrutusNEXT

  Implements abstract ancestor of classes that create and manage html
  elements in the document.
*/

/*
  Implementation notes:
    Each html element uses two css classes: 'gCssClass' and 'sCssClass'.

    'gCssClass' should only contain basic graphical attributes
      (borders, background, font, etc.).

    'sCssClass': string should only contain structural attributes
      (size, font size, position, margin, padding, floating, etc.).

    Constants defining 'gCssClass' names should only be
    in class Component. Constants definining 'sCssNames' should be
    in an inherited class that creates that element or in it's ancestor.
    
    Using these two css classes greatly simplifies resultning css sheet.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {Utils} from '../../shared/lib/utils/Utils';
import {MudColors} from '../../client/gui/MudColors';
import {RegisterRequest} from '../../shared/lib/protocol/RegisterRequest';

import $ = require('jquery');

export abstract class Component
{
  // This is used to make an empty line of text.
  // (HTML <label> or <span> with no text is not drawn at all
  // because of zero height. Setting this text to it will fix it.)
  protected static get EMPTY_LINE_TEXT()
    { return '&K\n'; }

  protected static get NO_GRAPHICS_G_CSS_CLASS()
    { return 'G_NoGraphics'; }
  protected static get WINDOW_G_CSS_CLASS()
    { return 'G_Window'; }
  protected static get TITLE_BAR_G_CSS_CLASS()
    { return 'G_TitleBar'; }
  protected static get BUTTON_G_CSS_CLASS()
    { return 'G_Button'; }
  protected static get INPUT_G_CSS_CLASS()
    { return 'G_Input'; }
  protected static get CHECKBOX_G_CSS_CLASS()
    { return 'G_Checkbox'; }
  protected static get LINK_TEXT_G_CSS_CLASS()
    { return 'G_LinkText'; }
  protected static get SELECTABLE_PLATE_G_CSS_CLASS()
    { return 'G_SelectablePlate'; }

  protected static get LINK_TEXT_S_CSS_CLASS()
    { return 'S_Component_LinkText'; }
  protected static get FULL_WIDTH_BUTTON_S_CSS_CLASS()
    { return 'S_Component_FullWidthButton'; }
  
  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // Replaces html content of '$component' with <spans> created from 'text'.
  protected static setText
  (
    $component: JQuery,
    text: string,
    baseColor = null
  )
  {
    // Remove existing text if there is any.
    $component.empty();

    this.appendText
    (
      $component,
      text,
      baseColor
    );
  }

  // Appends <spans> created from 'text' to html content of '$component'
  // ('text' can contain mud color codes. It it doesn't and no 'baseColor'
  //  is provided, text color of $component will be used).
  protected static appendText
  (
    $component: JQuery,
    text: string,
    baseColor = null
  )
  {
    $component.append
    (
      MudColors.htmlize(text, baseColor)
    );
  }

  // Replaces html content of '$component' with clickable text link.
  protected static setTextLink
  (
    $component: JQuery,
    text: string,
    {
      gCssClass,
      sCssClass
    }:
    {
      gCssClass?: string;
      sCssClass?: string;
    },
    attributes: Component.ButtonAttributes = null
  )
  {
    // Remove existing html content if there is any.
    $component.empty();

    return this.appendTextLink
    (
      $component,
      text,
      {
        gCssClass: gCssClass,
        sCssClass: sCssClass
      },
      attributes
    );
  }

  // Appends clickable text link created from 'text' to html
  // content of '$component'.
  protected static appendTextLink
  (
    $component: JQuery,
    text: string,
    {
      gCssClass = Component.LINK_TEXT_G_CSS_CLASS,
      sCssClass = Component.LINK_TEXT_S_CSS_CLASS
    }:
    {
      gCssClass?: string;
      sCssClass?: string;
    }
    = {},
    attributes: Component.ButtonAttributes = null
  )
  {
    // Text link is a button containing requested link text.
    // (Use <button> instead of <a href=...> because
    //  we are going to handle the clicks ourselves.)
    return this.createButton
    (
      {
        $container: $component,
        gCssClass: gCssClass,
        sCssClass: sCssClass,
        text: text
      },
      attributes
    );
  }

  protected static createDiv
  (
    param: Component.DivParameters,
    defaults: Component.DivParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createElement('div', param);
  }

  protected static createImg
  (
    param: Component.ImgParameters,
    defaults: Component.ImgParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createElement('img', param);
  }

  protected static createForm
  (
    param: Component.FormParameters,
    defaults: Component.FormParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createElement
    (
      'form',
      param,
      { name: "form" }
    );
  }

  protected static createTitle
  (
    param: Component.TitleParameters,
    defaults: Component.TitleParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createElement('title', param);
  }

  protected static createTextInput
  (
    param: Component.TextInputParameters,
    defaults: Component.TextInputParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createInputElement
    (
      'text',
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "text_input"
      }
    );
  }

  protected static createPasswordInput
  (
    param: Component.PasswordInputParameters,
    defaults: Component.PasswordInputParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createInputElement
    (
      'password',
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "password_input"
      }
    );
  }

  protected static createEmailInput
  (
    param: Component.EmailInputParameters,
    defaults: Component.EmailInputParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createInputElement
    (
      'email',
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "email_input"
      }
    );
  }

  protected static createCheckboxInput
  (
    param: Component.CheckboxInputParameters,
    defaults: Component.CheckboxInputParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createInputElement
    (
      'checkbox',
      param,
      { name: "checkbox_input" }
    );
  }

  // Creates a button which submits form data
  // (use createButton() to create a standalone button).
  protected static createSubmitButton
  (
    param: Component.SubmitButtonParameters,
    defaults: Component.SubmitButtonParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createInputElement
    (
      'button',
      param,
      {
        gCssClass: Component.BUTTON_G_CSS_CLASS,
        name: "submit_button"
      }
    );
  }

  protected static createTextArea
  (
    param: Component.TextAreaParameters,
    defaults: Component.TextAreaParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createElement
    (
      'textarea',
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "textarea"
      }
    );
  }

  protected static createLabel
  (
    param: Component.LabelParameters,
    defaults: Component.LabelParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    return this.createElement('label', param);
  }

  // Creates a button which is not part of a form
  // (use createSubmitButton() to create a button that
  //  submits form data).
  protected static createButton
  (
    param: Component.ButtonParameters,
    defaults: Component.ButtonParameters = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, defaults);

    let $element = this.createElement
    (
      'button',
      param,
      {
        gCssClass: Component.BUTTON_G_CSS_CLASS
      }
    );

    // This must be set in order for the button click
    // not to trigger form submit.
    $element.attr('type', 'button');

    return $element;
  }

  // ---------------- Private methods -------------------

  private static createElement
  (
    type: string,
    param: Object,
    defaults: Object = {}
  )
  {
    Utils.applyDefaults(param, defaults);

    let $element = $(document.createElement(type));

    this.applyParameters($element, param);
    this.setAttributes($element, param);

    return $element;
  }

  private static applyTextParam
  (
    $element: JQuery,
    text: string,
    baseTextColor: string
  )
  {
    if (baseTextColor)
      this.setText($element, text, baseTextColor);
    else
      this.setText($element, text);
  }

  private static insertToContainer
  (
    $element: JQuery,
    $container: JQuery,
    mode: Component.InsertMode
  )
  {
    switch (mode)
    {
      case Component.InsertMode.APPEND:
        $container.append($element);
        break;

      case Component.InsertMode.PREPEND:
        $container.prepend($element);
        break;

      default:
        ERROR("Unknown insert mode");
        break;
    }
  }

  private static applyParameters
  (
    $element: JQuery,
    param: Component.Parameters
  )
  {
    if (param.text)
      this.applyTextParam($element, param.text, param.baseTextColor);

    if (param.$container)
      this.insertToContainer($element, param.$container, param.insertMode)

    if (param.gCssClass)
      $element.addClass(param.gCssClass);

    if (param.sCssClass)
      $element.addClass(param.sCssClass);
  }

  private static createInputElement
  (
    type: string,
    param: Object,
    defaults: Object = {}
  )
  {
    Utils.applyDefaults(param, defaults);

    let $element = this.createElement('input', param);
    
    $element.attr('type', type);

    return $element;
  }

  private static setAttributes
  (
    $element: JQuery,
    attributes: Component.Attributes
  )
  {
    if (!$element || !attributes)
      return;

    if (attributes.required !== undefined)
      $element.prop('required', attributes.required);

    if (attributes.placeholder !== undefined)
      $element.attr('placeholder', attributes.placeholder);

    if (attributes.readonly !== undefined)
      $element.prop('readOnly', attributes.readonly);

    if (attributes.size !== undefined)
      $element.attr('size', attributes.size);

    if (attributes.maxLength !== undefined)
      $element.attr('maxLength', attributes.maxLength);

    if (attributes.minLength !== undefined)
      $element.attr('minLength', attributes.minLength);

    if (attributes.checked !== undefined)
      $element.prop('checked', attributes.checked);

    // There is difference between attribute 'disabled' and
    // property 'disabled'. Attribute specifies initial value
    // of 'disabled' property of the element, property reflects
    // actual state of the element.
    //   We only set property 'disabled', never the attribute.
    if (attributes && attributes.disabled !== undefined)
      $element.prop('disabled', attributes.disabled);

    if (attributes && attributes.rows)
      $element.attr('rows', attributes.rows);

    if (attributes.spellcheck !== undefined)
      $element.prop('spellcheck', attributes.spellcheck);

    if (attributes.autocorrect !== undefined)
      $element.attr('autocorrect', attributes.autocorrect);

    if (attributes.autocomplete !== undefined)
      $element.attr('autocomplete', attributes.autocomplete);

  }

  // ---------------- Event handlers --------------------

}

// ------------------ Type Declarations ----------------------

export module Component
{
  export enum InsertMode
  {
    APPEND,
    PREPEND
  }

  // ------------- Non-attribute Parameters -------------

  interface CommonParameters
  {
    $container?: JQuery;
    insertMode?: InsertMode;
    gCssClass?: string;
    sCssClass?: string;
  }

  interface TextParameters
  {
    text?: string;
    baseTextColor?: string;   // For example 'rgb(255, 255, 255)'.
  }

  // This inteface contains properties of all other parameters
  // interfaces (by extending them all). This way we can have
  // just one method (applyParameters()) to set them for any
  // component.
  export interface Parameters extends
    CommonParameters,
    TextParameters
  {
     // All properties are inherited.
  }

  // ----------------- Html Attributes ------------------

  // Attributes common to all html elements.
  interface CommonAttributes
  {
    name?: string,
    disabled?: boolean
  }

  interface CheckedAttribute
  {
    checked?: boolean
  }

  // These elements should have 'autofocus' attribute:
  //  <button>, <input>, <keygen>, <select>, <textarea>
  interface AutofocusAttribute
  {
    autofocus?: boolean
  }

  interface InputAttributes
  {
    required?: boolean,
    readonly?: boolean,
    form?: string
  }

  interface TextInputAttributes
  {
    placeholder?: string,
    dirname?: string,
    maxLength?: number,
    size?: number,
    spellcheck?: boolean,
    autocorrect?: AutocorrectValue,
    autocomplete?: AutocompleteValue
    // Apparently 'autocapitalize' only works for virtual keybords at the
    // moment in Chrome (and doesn't work in other browsers except Safari
    // at all) so it's useless right now.
    /// autocapitalize?: AutocapitalizeValue
  }

  interface SingleLineInputAttributes
  {
    minLength?: number
  }

  export interface TextAreaAttributes
  {
    rows?: number,
    wrap?: WrapValue
  }

  // This inteface contains properties of all other attribute
  // interfaces (by extending them all). This way we can have
  // just one method (setAttributes()) to set them for any
  // component.
  export interface Attributes extends
    CommonAttributes,
    CheckedAttribute,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes,
    TextAreaAttributes
  {
    // All properties are inherited.
  };

  // ---------- Specific Component Parameters -----------

  export interface DivParameters extends
    CommonParameters,
    TextParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface ImgParameters extends
    CommonParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface FormParameters extends
    CommonParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface TitleParameters extends
    CommonParameters,
    TextParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface TextInputParameters extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes
  {
    // All properties are inherited.
  }

  export interface EmailInputParameters extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes
  {
    // All properties are inherited.
  }

  export interface PasswordInputParameters extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes
  {
    // All properties are inherited.
  }

  export interface CheckboxInputParameters extends
    CommonParameters,
    CommonAttributes,
    CheckedAttribute,
    AutofocusAttribute,
    InputAttributes
  {
    // All properties are inherited.
  }

  //.
  export interface TextAreaParameters extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    TextInputAttributes,
    TextAreaAttributes
  {
    // All properties are inherited.
  }

  export interface ButtonParameters extends
    CommonParameters,
    TextParameters,
    CommonAttributes,
    AutofocusAttribute
  {
    // All properties are inherited.
  }

  export interface SubmitButtonParameters extends
    CommonParameters,
    TextParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes
  {
    // All properties are inherited.
  }

  export interface LabelParameters extends
    CommonParameters,
    TextParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  // -------------- Valid Attribute Values --------------

  // Valid values of 'wrap' attribute.
  type WrapValue = 'soft' | 'hard';

  // Valid values of 'autocapitalize' attribute.
  type AutocapitalizeValue = 'none' | 'characters' | 'words' | 'sentences';

  // Valid values of 'autocorrect' attribute.
  type AutocorrectValue = 'on' | 'off';

  // Valid values of 'autocomplete' attribute
  // (there are a lot more possible values, add them here
  //  if you need them).
  type AutocompleteValue = 'on' | 'off' | 'email' | 'username';
}