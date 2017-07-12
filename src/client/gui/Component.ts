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

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

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

    // if (text.indexOf('&') !== -1)
    // {
    //   $component.append
    //   (
    //     MudColors.htmlize(text, baseColor)
    //   );
    // }
    // else
    // {
    //   // let $span = $(document.createElement('span'))

    //   // $span.text(text);
    //   // $component.append($span);

    //   /// TODO: Použít baseColor, pokud není null.
    //   /// TODO: Nevolat createSpan, vyrobit ho na přímo (zaremovaným
    //   ///  kódem o kus výš).
    //   Component.createSpan
    //   (
    //     text,
    //     {
    //       $container: $component
    //     }
    //   )
    // }
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
    {
      $container = null,
      text = null,
      baseTextColor = null,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      text?: string;
      baseTextColor?: string;
      gCssClass?: string;
      sCssClass?: string;
    }
  )
  : JQuery
  {
    let $element = $(document.createElement('div'));

    this.initElement($element, $container, gCssClass, sCssClass);

    if (text !== null)
      this.setText($element, text, baseTextColor);

    return $element;
  }

  protected static createImg
  (
    {
      $container = null,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      gCssClass?: string;
      sCssClass?: string;
    }
    = {}
  )
  : JQuery
  {
    let $element = $(document.createElement('img'));

    return this.initElement($element, $container, gCssClass, sCssClass);
  }

  protected static createForm
  (
    {
      $container = null,
      name,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      name: string;
      gCssClass?: string;
      sCssClass?: string;
    }
  )
  : JQuery
  {
    let $element = $(document.createElement('form'));

    // Form must have a 'name' attribute.
    $element.attr('name', name);

    return this.initElement($element, $container, gCssClass, sCssClass);
  }

  protected static createTitle
  (
    {
      $container = null,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null,
      // 'text' can use mud colors. If it doesn't,
      // color set in css will be used.
      text = null
    }:
    {
      $container?: JQuery;
      gCssClass?: string;
      sCssClass?: string;
      text?: string;
    }
    = {}
  )
  : JQuery
  {
    let $element = $(document.createElement('title'));

    this.initElement($element, $container, gCssClass, sCssClass);

    if (text !== null)
      this.setText($element, text);

    return $element;
  }

  protected static createTextInput
  (
    {
      $container = null,
      name,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      name: string;
      gCssClass?: string;
      sCssClass?: string;
    },
    attributes: Component.InputAttributes = null
  )
  : JQuery
  {
    if (!this.checkNameAttribute(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'text', name);
    this.setAttributes($element, attributes);

    return $element;
  }

  protected static createPasswordInput
  (
    {
      $container = null,
      name,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      name: string;
      gCssClass?: string;
      sCssClass?: string;
    },
    attributes: Component.InputAttributes = null
  )
  : JQuery
  {
    if (!this.checkNameAttribute(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'password', name);
    this.setAttributes($element, attributes);

    return $element;
  }

  protected static createEmailInput
  (
    {
      $container = null,
      name,
      minLength = RegisterRequest.MIN_EMAIL_LENGTH,
      maxLength = RegisterRequest.MAX_EMAIL_LENGTH,
      gCssClass = Component.INPUT_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      name: string;
      minLength?: number;
      maxLength?: number;
      gCssClass?: string;
      sCssClass?: string;
    },
    attributes: Component.InputAttributes = null
  )
  : JQuery
  {
    if (!this.checkNameAttribute(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'email', name);
    this.setAttributes($element, attributes);

    return $element;
  }

  protected static createCheckboxInput
  (
    {
      $container = null,
      name,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      name: string;
      gCssClass?: string;
      sCssClass?: string;
    },
    attributes: Component.CheckboxAttributes = null
  )
  : JQuery
  {
    if (!this.checkNameAttribute(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'checkbox', name);
    this.setAttributes($element, attributes);

    return $element;
  }

  // Creates a button which submits form data
  // (use createButton() to create a standalone button).
  protected static createSubmitButton
  (
    name,
    {
      $container = null,
      gCssClass = Component.BUTTON_G_CSS_CLASS,
      sCssClass = null,
      text = null
    }
    :Component.ButtonParameters,
    attributes: Component.ButtonAttributes = null
  )
  : JQuery
  {
    if (!this.checkNameAttribute(name))
      return;

    let $element = $(document.createElement('button'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'submit', name);
    this.setAttributes($element, attributes);

    if (text !== null)
      this.setText($element, text);

    return $element;
  }

  protected static createTextArea
  (
    {
      $container = null,
      gCssClass = Component.INPUT_G_CSS_CLASS,
      sCssClass = null
    }
    : Component.TextAreaParameters,
    attributes: Component.TextAreaAttributes
  )
  : JQuery
  {
    let $element = $(document.createElement('textarea'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.setAttributes($element, attributes);

    return $element;
  }

  /// Tohle se nejspíš nepoužívá (svg elementy se vyrábí přes knihovnu d3).
  /*
  protected static createSvg(id: string, gCssClass, sCssClass: string): JQuery
  {
    let element = document.createElement('svg');

    return this.initElement(element, $container, id, gCssClass, sCssClass);
  }
  */

  protected static createLabel
  (
    {
      $container = null,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null,
      text = null
    }
    : Component.LabelParameters
  )
  : JQuery
  {
    let $element = $(document.createElement('label'));

    this.initElement($element, $container, gCssClass, sCssClass);

    if (text !== null)
      this.setText($element, text);

    return $element;
  }

  /// Not used anymore.
  // protected static createSpan
  // (
  //   text: string = null,
  //   {
  //     $container = null,
  //     gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
  //     sCssClass = null
  //   }:
  //   {
  //     $container?: JQuery;
  //     gCssClass?: string;
  //     sCssClass?: string;
  //   }
  //   = {}
  // )
  // : JQuery
  // {
  //   let $element = $(document.createElement('span'));

  //   this.initElement($element, $container, gCssClass, sCssClass);

  //   if (text !== null)
  //     this.setText($element, text);

  //   return $element;
  // }

  // Creates a button which is not part of a form
  // (use createSubmitButton() to create a button that
  //  submits form data).
  protected static createButton
  (
    {
      $container = null,
      gCssClass = Component.BUTTON_G_CSS_CLASS,
      sCssClass = null,
      text = null
    }
    : Component.ButtonParameters,
    attributes: Component.ButtonAttributes = null
  )
  : JQuery
  {
    let $element = $(document.createElement('button'));

    // This must be set so the button click won't trigger submit
    // of a form.
    $element.attr('type', 'button');

    this.initElement($element, $container, gCssClass, sCssClass);
    this.setAttributes($element, attributes);

    if (text !== null)
      this.setText($element, text);

    return $element;
  }

  /// Deprecated. Use Component.setTextLink() instead.
  // // Generic clickable text link
  // // (note that it's <button>, not <a href=...>).
  // protected static createTextLink
  // (
  //   {
  //     $container = null,
  //     gCssClass = Component.LINK_TEXT_G_CSS_CLASS,
  //     sCssClass = null,
  //     text = null
  //   }:
  //   {
  //     $container?: JQuery;
  //     gCssClass?: string;
  //     sCssClass?: string;
  //     text: string;
  //   },
  //   param: Component.ButtonParam = null
  // )
  // : JQuery
  // {
  //   // Use <button> instead of <a href=...> because we
  //   // are going to handle the clicks ourselves.
  //   return this.createButton
  //   (
  //     {
  //       $container,
  //       gCssClass,
  //       sCssClass,
  //       text
  //     },
  //     param
  //   );
  // }

  /// Ve skutečnosti asi vůbec nechci používat href, ale button bez grafiky...
  /// 
  /*
  protected static createHref
  (
    id: string,
    gCssClass: string,
    sCssClass: string
  )
  : JQuery
  {
    let element = document.createElement('a');

    return this.initElement(element, $container, id, gCssClass, sCssClass);
  }
  */

  /// Deprecated. Use Component.setText() instead.
  // Generic non-clickable text.
  // protected static createText
  // (
  //   {
  //     $container = null,
  //     gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
  //     sCssClass = null,
  //     text = null
  //   }:
  //   {
  //     $container?: JQuery;
  //     gCssClass?: string;
  //     sCssClass?: string;
  //     text: string;
  //   }
  // )
  // : JQuery
  // {
  //   let $text = this.createSpan
  //   (
  //     {
  //       $container,
  //       gCssClass,
  //       sCssClass
  //     }
  //   );

  //   $text.text(text);

  //   return $text;
  // }

  // ---------------- Private methods -------------------

  private static initFormInputElement
  (
    $element: JQuery,
    type: string,
    name: string
  )
  {
    // Both 'type' and 'name' attributes are mandatory
    // for input elements.
    $element.attr('type', type);
    $element.attr('name', name);
  }

  private static initElement
  (
    $element: JQuery,
    $container: JQuery,
    // Css class with graphical attributes of the element
    // (borders, background, font, font size, etc.).
    gCssClass: string,
    // Css class with structural attributes of the element
    // (size, position, margin, padding, floating, etc.).
    sCssClass: string
  )
  {
    $element.addClass(gCssClass);

    if (sCssClass)
      $element.addClass(sCssClass);

    if ($container)
      $container.append($element);

    return $element;
  }

  // // Applies values of 'attributes' to input element.
  // private static applyInputAttributes
  // (
  //   $element: JQuery,
  //   attributes: Component.InputAttributes
  // )
  // {
  //   if (!$element || !attributes)
  //     return;

  //   if (attributes.required !== undefined)
  //     $element.prop('required', attributes.required);

  //   if (attributes.placeholder !== undefined)
  //     $element.attr('placeholder', attributes.placeholder);

  //   if (attributes.readonly !== undefined)
  //     $element.prop('readOnly', attributes.readonly);

  //   if (attributes.disabled !== undefined)
  //     this.setDisabled($element, attributes.disabled);

  //   if (attributes.size !== undefined)
  //     $element.attr('size', attributes.size);

  //   if (attributes.maxLength !== undefined)
  //     $element.attr('maxLength', attributes.maxLength);

  //   if (attributes.minLength !== undefined)
  //     $element.attr('minLength', attributes.minLength);

  //   if (attributes.autocomplete !== undefined)
  //     $element.attr('autocomplete', attributes.autocomplete);

  //   if (attributes.spellcheck !== undefined)
  //     $element.prop('spellcheck', attributes.spellcheck);

  //   if (attributes.checked !== undefined)
  //     $element.prop('checked', attributes.checked);

  //   // Apparently 'autocapitalize' only works for virtual keybords at the
  //   // moment in Chrome (and doesn't work in other browsers except Safari
  //   // at all) so it's useless right now.
  //   /// if (attributes.autocapitalize !== undefined)
  //   ///   element.setAttribute('autocapitalize', attributes.autocapitalize);

  //   if (attributes.autocorrect !== undefined)
  //     $element.attr('autocorrect', attributes.autocorrect);

  //   // // Standard attributes.

  //   // if (attributes.required !== undefined)
  //   //   element.required = attributes.required;

  //   // if (attributes.placeholder !== undefined)
  //   //   element.placeholder = attributes.placeholder;

  //   // if (attributes.readonly !== undefined)
  //   //   element.readOnly = attributes.readonly;

  //   // // if (attributes.disabled !== undefined)
  //   // //   element.disabled = attributes.disabled;

  //   // if (attributes.size !== undefined)
  //   //   element.size = attributes.size;

  //   // if (attributes.maxLength !== undefined)
  //   //   element.maxLength = attributes.maxLength;

  //   // if (attributes.minLength !== undefined)
  //   //   element.minLength = attributes.minLength;

  //   // if (attributes.autocomplete !== undefined)
  //   //   element.autocomplete = attributes.autocomplete;

  //   // if (attributes.spellcheck !== undefined)
  //   //   element.spellcheck = attributes.spellcheck;

  //   // if (attributes.checked !== undefined)
  //   //   element.checked = attributes.checked

  //   // // Nonstandard attributes (so they can't be simply assigned
  //   // // and must byt set using setAttribute()).

  //   // // Apparently 'autocapitalize' only works for virtual keybords at the
  //   // // moment in Chrome (and doesn't work in other browsers except Safari
  //   // // at all) so it's useless right now.
  //   // /// if (attributes.autocapitalize !== undefined)
  //   // ///   element.setAttribute('autocapitalize', attributes.autocapitalize);

  //   // if (attributes.autocorrect !== undefined)
  //   //   element.setAttribute('autocorrect', attributes.autocorrect);
  // }

  // private static applyButtonAttributes
  // (
  //   $element: JQuery,
  //   attributes: Component.ButtonAttributes
  // )
  // {
  //   if (!$element || !attributes)
  //     return;

  //   // Note that there is difference between attribute 'disabled'
  //   // and property 'disabled'. Attribute 'disabled' only specifies
  //   // initial value of 'disabled' property of the element, property
  //   // 'disabled' reflects actual state of the element.
  //   if (attributes && attributes.disabled !== undefined)
  //     this.setDisabled($element, attributes.disabled);
  // }

  // private static applyTextAreaAttributes
  // (
  //   $element: JQuery,
  //   attributes: Component.TextAreaAttributes
  // )
  // {
  //   if (!$element || !attributes)
  //     return;

  //   if (attributes && attributes.rows)
  //     $element.attr('rows', attributes.rows);

  //   if (attributes.spellcheck !== undefined)
  //     $element.prop('spellcheck', attributes.spellcheck);

  //   // Nonstandard attributes (so they can't be simply assigned
  //   // and must byt set using setAttribute()).

  //   if (attributes.autocorrect !== undefined)
  //     $element.attr('autocorrect', attributes.autocorrect);

  //   // if (attributes && attributes.rows)
  //   //   element.rows = attributes.rows;

  //   // if (attributes.spellcheck !== undefined)
  //   //   element.spellcheck = attributes.spellcheck;

  //   // // Nonstandard attributes (so they can't be simply assigned
  //   // // and must byt set using setAttribute()).

  //   // if (attributes.autocorrect !== undefined)
  //   //   element.setAttribute('autocorrect', attributes.autocorrect);
  // }

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

  private static checkNameAttribute(name: string)
  {
    if (!name)
    {
      ERROR("Missing or empty 'name' attribute. Form input"
        + " elements must have it or the form won't work"
        + " propely. Element is not created");
      return false;
    }

    return true;
  }

  // ---------------- Event handlers --------------------

}

// ------------------ Type declarations ----------------------

export module Component
{
  interface BasicParameters
  {
    $container?: JQuery;
    gCssClass?: string;
    sCssClass?: string;
  }

  interface TextComponentParameters extends BasicParameters
  {
    text?: string;
  }

  export interface TextAreaParameters extends BasicParameters
  {
    // Nothing here, just default (inherited) parameters.
  }

  export interface ButtonParameters extends TextComponentParameters
  {
    // Nothing here, just default (inherited) parameters.
  }

  export interface LabelParameters extends TextComponentParameters
  {
    // Nothing here, just default (inherited) parameters.
  }

  export interface InputAttributes
  {
    required?: boolean,
    placeholder?: string,
    readonly?: boolean,
    disabled?: boolean,
    size?: number,
    minLength?: number,
    maxLength?: number,
    spellcheck?: boolean,
    // Apparently 'autocapitalize' only works for virtual keybords at the
    // moment in Chrome (and doesn't work in other browsers except Safari
    // at all) so it's useless right now.
    /// autocapitalize?: AutocapitalizeValue,
    autocorrect?: AutocorrectValue,
    autocomplete?: AutocompleteValue,
    checked?: boolean
  }

  export interface ButtonAttributes
  {
    disabled?: boolean
  }

  export interface CheckboxAttributes
  {
    readonly?: boolean,
    disabled?: boolean,
    checked?: boolean
  }  

  export interface TextAreaAttributes
  {
    rows?: number,
    spellcheck?: boolean,
    autocorrect?: AutocorrectValue
  }

  // This inteface contains properties of all other attribute
  // interfaces (by extending them all). This way we can have
  // just one method (setAttributes()) to set them for any
  // component.
  export interface Attributes extends InputAttributes,
    ButtonAttributes, CheckboxAttributes, TextAreaAttributes
  {
    // Nothing here because the point is just to inherit
    // attributes from all other attribute interfaces.
  };

  // Valid values of 'autocapitalize' attribute.
  type AutocapitalizeValue = 'none' | 'characters' | 'words' | 'sentences';

  // Valid values of 'autocorrect' attribute.
  type AutocorrectValue = 'on' | 'off';

  // Valid values of 'autocomplete' attribute
  // (there are a lot more possible values, add them here
  //  if you need them).
  type AutocompleteValue = 'on' | 'off' | 'email' | 'username';
}