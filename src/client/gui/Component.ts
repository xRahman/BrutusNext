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

    Constants defining 'gCssClass' names should only be declared in
    class Component. Constants definining 'sCssNames' should be declared
    with regard to inheritance (try to reuse them if possible).
    
    Using these two css classes greatly simplifies the resulting css sheet.
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

  // protected static get LINK_TEXT_S_CSS_CLASS()
  //   { return 'S_Component_LinkText'; }
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

  // // Shortcut to create text with no attributes
  // // ($component attributes will be used).
  // protected static setText
  // (
  //   $component: JQuery,
  //   text: string,
  //   baseColor = null,
  //   insertMode = Component.InsertMode.REPLACE
  // )
  // {
  //   return this.createText
  //   (
  //     {
  //       $container: $component,
  //       text: text,
  //       baseTextColor: baseColor,
  //       insertMode: insertMode
  //     }
  //   );
  // }

  // // Shortcut to create text with no attributes
  // // ($component attributes will be used).
  // protected static setTextLink
  // (
  //   $component: JQuery,
  //   text: string,
  //   baseColor = null,
  //   insertMode = Component.InsertMode.REPLACE
  // )
  // {
  //   return this.createText
  //   (
  //     {
  //       $container: $component,
  //       text: text,
  //       baseTextColor: baseColor,
  //       insertMode: insertMode,
  //       gCssClass: Component.LINK_TEXT_G_CSS_CLASS
  //     }
  //   );
  // }

  // Creates text styled as link.
  protected static createTextLink(param: Component.TextParam = {}): JQuery
  {
    Utils.applyDefaults(param, { gCssClass: Component.LINK_TEXT_G_CSS_CLASS });

    return this.createText(param);
  }

  // Creates colored <spans> from 'text' and sets them to html
  // content of '$component' (in a way specified by param.insertMode).
  // (If 'text' contains mud color codes, they will be used. It it doesn't
  //  and no 'baseColor' is provided, text color of $component will be used)
  protected static createText(param: Component.TextParam = {}): JQuery
  {
    console.log("createText(), text: " + param.text + ", insertMode: " + param.insertMode);
    let $text = $(MudColors.htmlize(param.text, param.baseTextColor));

    // Reset 'param.text' to prevent recursively setting text to itself.
    param.text = undefined;

    this.applyParameters($text, param);
    this.setAttributes($text, param);

    return $text;
  }

  /*
  // Appends <spans> created from 'text' to html content of '$component'
  // (If 'text' contains mud color codes, they will be used. It it doesn't
  //  and no 'baseColor' is provided, text color of $component will be used).
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

  // Prepends <spans> created from 'text' to html content of '$component'
  // (If 'text' contains mud color codes, they will be used. It it doesn't
  //  and no 'baseColor' is provided, text color of $component will be used).
  protected static prependText
  (
    $component: JQuery,
    text: string,
    baseColor = null
  )
  {
    $component.prepend
    (
      MudColors.htmlize(text, baseColor)
    );
  }
  */

  /*
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
  */

  /*
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
  */

  protected static createDiv(param: Component.DivParam = {}): JQuery
  {
    return this.createElement('div', param);
  }

  protected static createImg(param: Component.ImgParam = {}): JQuery
  {
    return this.createElement('img', param);
  }

  protected static createForm(param: Component.FormParam = {}): JQuery
  {
    Utils.applyDefaults(param, { name: "form" });

    return this.createElement('form', param);
  }

  protected static createTitle(param: Component.TitleParam = {}): JQuery
  {
    return this.createElement('title', param);
  }

  protected static createTextInput(param: Component.TextInputParam = {})
  : JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "text_input"
      }
    );

    return this.createInputElement('text', param);
  }

  protected static createPasswordInput
  (
    param: Component.PasswordInputParam = {}
  )
  : JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "password_input"
      }
    );

    return this.createInputElement('password', param);
  }

  protected static createEmailInput(param: Component.EmailInputParam = {})
  : JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "email_input"
      }
    );

    return this.createInputElement('email', param);
  }

  protected static createCheckboxInput
  (
    param: Component.CheckboxInputParam = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, { name: "checkbox_input" });

    return this.createInputElement('checkbox', param);
  }

  // Creates a button which submits form data
  // (use createButton() to create a standalone button).
  protected static createSubmitButton(param: Component.SubmitButtonParam = {})
  : JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.BUTTON_G_CSS_CLASS,
        name: "submit_button"
      }
    );

    let $element = this.createElement('button', param);

    // We use element <button> with 'type: "submit"' instead
    // of element <submit> with 'type: "button" because there
    // can be no html content inside a <submit> element so
    // we couldn't use <span> to display text.
    $element.attr('type', 'submit');

    return $element;

    //return this.createInputElement('submit', param);
  }

  protected static createTextArea(param: Component.TextAreaParam = {}): JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: "textarea"
      }
    );

    return this.createElement('textarea', param);
  }

  protected static createLabel(param: Component.LabelParam = {}): JQuery
  {
    return this.createElement('label', param);
  }

  // Creates a button which is not part of a form
  // (use createSubmitButton() to create a button
  //  that submits form data).
  protected static createButton(param: Component.ButtonParam = {}): JQuery
  {
    Utils.applyDefaults(param, { gCssClass: Component.BUTTON_G_CSS_CLASS });

    let $element = this.createElement('button', param);

    // Type must be set to ensure that the button click
    // doesn't submit the form.
    $element.attr('type', 'button');

    return $element;
  }

  // ---------------- Private methods -------------------

  private static createElement(type: string, param: Object): JQuery
  {
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
    this.createText
    (
      {
        $container: $element,
        text: text,
        baseTextColor: baseTextColor
      }
    );
    /*
    if (baseTextColor)
      this.setText($element, text, baseTextColor);
    else
      this.setText($element, text);
    */
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

      case Component.InsertMode.REPLACE:
        // Clear html content first.
        $container.empty();
        $container.append($element);
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
    console.log("::applyDefaults() - APPEND");
    Utils.applyDefaults(param, { insertMode: Component.InsertMode.APPEND });
    console.log("::param.insertMode: " + param.insertMode);

    if (param.text)
      this.applyTextParam($element, param.text, param.baseTextColor);

    if (param.$container)
      this.insertToContainer($element, param.$container, param.insertMode)

    if (param.gCssClass)
      $element.addClass(param.gCssClass);

    if (param.sCssClass)
      $element.addClass(param.sCssClass);
  }

  private static createInputElement(type: string, param: Object): JQuery
  {
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
    APPEND,   // Default value.
    PREPEND,
    REPLACE   // $container html contents is cleared first.
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
    autocorrect?: Component.AutocorrectValue,
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

  export interface TextParam extends
    CommonParameters,
    TextParameters,
    CommonAttributes
  {
  }

  export interface DivParam extends
    CommonParameters,
    TextParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface ImgParam extends
    CommonParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface FormParam extends
    CommonParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface TitleParam extends
    CommonParameters,
    TextParameters,
    CommonAttributes
  {
    // All properties are inherited.
  }

  export interface TextInputParam extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes
  {
    // All properties are inherited.
  }

  export interface EmailInputParam extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes
  {
    // All properties are inherited.
  }

  export interface PasswordInputParam extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes
  {
    // All properties are inherited.
  }

  export interface CheckboxInputParam extends
    CommonParameters,
    CommonAttributes,
    CheckedAttribute,
    AutofocusAttribute,
    InputAttributes
  {
    // All properties are inherited.
  }

  //.
  export interface TextAreaParam extends
    CommonParameters,
    CommonAttributes,
    AutofocusAttribute,
    TextInputAttributes,
    TextAreaAttributes
  {
    // All properties are inherited.
  }

  export interface ButtonParam extends
    CommonParameters,
    TextParameters,
    CommonAttributes,
    AutofocusAttribute
  {
    // All properties are inherited.
  }

  export interface SubmitButtonParam extends
    CommonParameters,
    TextParameters,
    CommonAttributes,
    AutofocusAttribute,
    InputAttributes
  {
    // All properties are inherited.
  }

  export interface LabelParam extends
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
  export type AutocorrectValue = 'on' | 'off';

  // Valid values of 'autocomplete' attribute
  // (there are a lot more possible values, add them here
  //  if you need them).
  type AutocompleteValue = 'on' | 'off' | 'email' | 'username';
}