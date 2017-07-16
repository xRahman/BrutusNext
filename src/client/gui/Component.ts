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

  protected static get FULL_WIDTH_BLOCK_S_CSS_CLASS()
    { return 'S_Component_FullWidthBlock'; }

  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // Creates text styled as link.
  protected createTextLink(param: Component.TextParam = {}): JQuery
  {
    Utils.applyDefaults(param, { gCssClass: Component.LINK_TEXT_G_CSS_CLASS });

    return this.createText(param);
  }

  // Creates colored <spans> from 'text' and sets them to html
  // content of '$component' (in a way specified by param.insertMode).
  // (If 'text' contains mud color codes, they will be used. It it doesn't
  //  and no 'baseColor' is provided, text color of $component will be used)
  protected createText(param: Component.TextParam = {}): JQuery
  {
    let $text = $(MudColors.htmlize(param.text, param.baseTextColor));

    // Reset 'param.text' to prevent recursively setting text to itself.
    param.text = undefined;

    // Hack: Set 'name' attribute first so it's listed first
    //   in DOM inspector in browser.
    if (param.name !== undefined)
      $text.attr('name', param.name);

    this.applyParameters($text, param);
    this.setAttributes($text, param);

    return $text;
  }

  protected createDiv(param: Component.DivParam = {}): JQuery
  {
    return this.createElement('div', param);
  }

  protected createImg(param: Component.ImgParam = {}): JQuery
  {
    return this.createElement('img', param);
  }

  protected createForm(param: Component.FormParam = {}): JQuery
  {
    Utils.applyDefaults(param, { name: 'form' });

    return this.createElement('form', param);
  }

  protected createTitle(param: Component.TitleParam = {}): JQuery
  {
    return this.createElement('title', param);
  }

  protected createTextInput(param: Component.TextInputParam = {})
  : JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: 'text_input'
      }
    );

    return this.createInputElement('text', param);
  }

  protected createPasswordInput
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
        name: 'password_input'
      }
    );

    return this.createInputElement('password', param);
  }

  protected createEmailInput(param: Component.EmailInputParam = {}): JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: 'email_input'
      }
    );

    return this.createInputElement('email', param);
  }

  protected createCheckboxInput
  (
    param: Component.CheckboxInputParam = {}
  )
  : JQuery
  {
    Utils.applyDefaults(param, { name: 'checkbox_input' });

    return this.createInputElement('checkbox', param);
  }

  // Creates a button which submits form data
  // (use createButton() to create a standalone button).
  protected createSubmitButton(param: Component.SubmitButtonParam = {}): JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.BUTTON_G_CSS_CLASS,
        name: 'submit_button'
      }
    );

    let $element = this.createElement('button', param);

    // We use element <button> with 'type: "submit"' instead
    // of element <submit> with 'type: "button" because there
    // can be no html content inside a <submit> element so
    // we couldn't use <span> to display text.
    $element.attr('type', 'submit');

    return $element;
  }

  protected createTextArea(param: Component.TextAreaParam = {}): JQuery
  {
    Utils.applyDefaults
    (
      param,
      {
        gCssClass: Component.INPUT_G_CSS_CLASS,
        name: 'textarea'
      }
    );

    return this.createElement('textarea', param);
  }

  protected createLabel(param: Component.LabelParam = {}): JQuery
  {
    return this.createElement('label', param);
  }

  // Creates a button which is not part of a form
  // (use createSubmitButton() to create a button
  //  that submits form data).
  protected createButton(param: Component.ButtonParam = {}): JQuery
  {
    Utils.applyDefaults(param, { gCssClass: Component.BUTTON_G_CSS_CLASS });

    let $element = this.createElement('button', param);

    // Type must be set to ensure that the button click
    // doesn't submit the form.
    $element.attr('type', 'button');

    return $element;
  }

  protected createEmptyLine(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'empty_line',
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        text: Component.EMPTY_LINE_TEXT
      }
    );

    return this.createDiv(param);
  }

  // ---------------- Private methods -------------------

  private createElement(type: string, param: Object): JQuery
  {
    let $element = $(document.createElement(type));

    // Hack: Set 'name' attribute first so it's listed first
    //   in DOM inspector in browser.
    if (param['name'] !== undefined)
      $element.attr('name', param['name']);

    this.applyParameters($element, param);
    this.setAttributes($element, param);

    return $element;
  }

  private applyTextParam
  (
    $element: JQuery,
    text: string,
    baseTextColor: string
  )
  {
    this.createText
    (
      {
        $parent: $element,
        text: text,
        baseTextColor: baseTextColor
      }
    );
  }

  private insertToParent
  (
    $element: JQuery,
    $parent: JQuery,
    mode: Component.InsertMode
  )
  {
    switch (mode)
    {
      case Component.InsertMode.APPEND:
        $parent.append($element);
        break;

      case Component.InsertMode.PREPEND:
        $parent.prepend($element);
        break;

      case Component.InsertMode.REPLACE:
        // Clear html content first.
        $parent.empty();
        $parent.append($element);
        break;

      default:
        ERROR("Unknown insert mode");
        break;
    }
  }

  private applyParameters
  (
    $element: JQuery,
    param: Component.Parameters
  )
  {
    Utils.applyDefaults(param, { insertMode: Component.InsertMode.APPEND });

    if (param.text)
      this.applyTextParam($element, param.text, param.baseTextColor);

    if (param.$parent)
      this.insertToParent($element, param.$parent, param.insertMode)

    if (param.gCssClass)
      $element.addClass(param.gCssClass);

    if (param.sCssClass)
      $element.addClass(param.sCssClass);

    // Attach event handlers if there are present in 'param'.

    if (param.click)
      $element.click(param.click);

    if (param.keypress)
      $element.keypress(param.keypress);

    if (param.keydown)
      $element.keydown(param.keydown);

    if (param.focus)
      $element.focus(param.focus);

    if (param.submit)
      $element.submit(param.submit);

    if (param.change)
      $element.change(param.change);
  }

  private createInputElement(type: string, param: Object): JQuery
  {
    let $element = this.createElement('input', param);
    
    $element.attr('type', type);

    return $element;
  }

  private setAttributes
  (
    $element: JQuery,
    attributes: Component.Attributes
  )
  {
    if (!$element || !attributes)
      return;

    // Note: Don't set 'name' attribute because we have
    //   already done it out of order (to make it show
    //   first in browser DOM inspector).

    if (attributes.required !== undefined)
      $element.prop('required', attributes.required);

    if (attributes.placeholder !== undefined)
      $element.attr('placeholder', attributes.placeholder);

    if (attributes.readonly !== undefined)
      $element.prop('readOnly', attributes.readonly);

    if (attributes.autofocus !== undefined)
      $element.prop('autofocus', attributes.autofocus);

    if (attributes.form !== undefined)
      $element.attr('form', attributes.form);

    if (attributes.wrap !== undefined)
    {
      let value = Component.Wrap[attributes.wrap].toLowerCase();
      $element.attr('wrap', value);
    }

    if (attributes.size !== undefined)
      $element.attr('size', attributes.size);

    if (attributes.maxLength !== undefined)
      $element.attr('maxLength', attributes.maxLength);

    if (attributes.minLength !== undefined)
      $element.attr('minLength', attributes.minLength);

    if (attributes.checked !== undefined)
      $element.prop('checked', attributes.checked);

    if (attributes.src !== undefined)
      $element.attr('src', attributes.src);

    // There is difference between attribute 'disabled' and
    // property 'disabled'. Attribute specifies initial value
    // of 'disabled' property of the element, property reflects
    // actual state of the element.
    //   We only set property 'disabled', never the attribute.
    if (attributes && attributes.disabled !== undefined)
      $element.prop('disabled', attributes.disabled);

    if (attributes && attributes.tabindex !== undefined)
      $element.attr('tabindex', attributes.tabindex);

    if (attributes && attributes.rows)
      $element.attr('rows', attributes.rows);

    if (attributes.spellcheck !== undefined)
      $element.prop('spellcheck', attributes.spellcheck);

    if (attributes.autocorrect !== undefined)
    {
      let value = Component.Autocorrect[attributes.autocorrect].toLowerCase();
      $element.attr('autocorrect', value);
    }

    if (attributes.autocomplete !== undefined)
    {
      let value =
        Component.Autocomplete[attributes.autocomplete].toLowerCase();
      $element.attr('autocomplete', value);
    }
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
    REPLACE   // Html contents of $parent is cleared first.
  }

  // ------------- Non-attribute Parameters -------------

  interface CommonParameters
  {
    $parent?: JQuery;
    insertMode?: InsertMode;
    gCssClass?: string;
    sCssClass?: string;

    // Event handlers.
    click?: (event: MouseEvent) => any;
    keypress?: (event: KeyboardEvent) => any;
    keydown?: (event: KeyboardEvent) => any;
    focus?: (event: FocusEvent) => any;
  }

  interface TextParameters
  {
    text?: string;
    baseTextColor?: string;   // For example 'rgb(255, 255, 255)'.
  }

  interface FormParameters
  {
    // Event handlers.
    submit?: (event: Event) => any;
  }

  // These elements fire 'change' events:
  // <input>, <select>, and <textarea>
  interface ChangeEventParameter
  {
    change?: (event: Event) => any;
  }

  // This inteface contains properties of all other parameters
  // interfaces (by extending them all). This way we can have
  // just one method (applyParameters()) to set them for any
  // component.
  export interface Parameters extends
    CommonParameters,
    TextParameters,
    FormParameters,
    ChangeEventParameter
  {
     // All properties are inherited.
  }

  // ----------------- Html Attributes ------------------

  // Attributes common to all html elements.
  interface CommonAttributes
  {
    name?: string,
    disabled?: boolean,
    // Specifies oder in which elements are selected by 'tab' key
    // ('tabindex: -1' means selectetable only by scripts and mouse
    //  clicks, not by tabbing. It also enables keyboard events on
    //  elements which don't normally fire them - like <div>).
    tabindex?: number
  }

  interface CheckboxAttributes
  {
    checked?: boolean
  }

  interface ImgAttributes
  {
    src?: string
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
    maxLength?: number,
    size?: number,
    spellcheck?: boolean,
    autocorrect?: Component.Autocorrect,
    autocomplete?: Component.Autocomplete
    // Apparently 'autocapitalize' only works for virtual keybords at the
    // moment in Chrome (and doesn't work in other browsers except Safari
    // at all) so it's useless right now.
    /// autocapitalize?: Component.Autocapitalize
  }

  interface SingleLineInputAttributes
  {
    minLength?: number
  }

  export interface TextAreaAttributes
  {
    rows?: number,
    wrap?: Component.Wrap
  }

  // This inteface contains properties of all other attribute
  // interfaces (by extending them all). This way we can have
  // just one method (setAttributes()) to set them for any
  // component.
  export interface Attributes extends
    CommonAttributes,
    CheckboxAttributes,
    ImgAttributes,
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
    // All properties are inherited.
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
    CommonAttributes,
    ImgAttributes
  {
    // All properties are inherited.
  }

  export interface FormParam extends
    CommonParameters,
    FormParameters,
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
    ChangeEventParameter,
    AutofocusAttribute,
    InputAttributes,
    TextInputAttributes,
    SingleLineInputAttributes
  {
    // All properties are inherited.
  }

  export interface EmailInputParam extends
    CommonParameters,
    ChangeEventParameter,
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
    ChangeEventParameter,
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
    ChangeEventParameter,
    CommonAttributes,
    CheckboxAttributes,
    AutofocusAttribute,
    InputAttributes
  {
    // All properties are inherited.
  }

  export interface TextAreaParam extends
    CommonParameters,
    ChangeEventParameter,
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
  export enum Wrap
  {
    SOFT,
    HARD
  }

  // Apparently 'autocapitalize' only works for virtual keybords at the
  // moment in Chrome (and doesn't work in other browsers except Safari
  // at all) so it's useless right now.
  // // Valid values of 'autocapitalize' attribute.
  // export enum Autocapitalize
  // {
  //   NONE,
  //   CHARACTERS,
  //   WORDS,
  //   SENTENCES
  // }

  // Valid values of 'autocorrect' attribute.
  export enum Autocorrect
  {
    ON,
    OFF
  }

  // Valid values of 'autocomplete' attribute
  // (there are a lot more possible values, add them here
  //  if you need them).
  export enum Autocomplete
  {
    ON,
    OFF,
    EMAIL,
    USERNAME
  }
}