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
  protected static setText($component: JQuery, text: string)
  {
    // First remove existing text title if there is any.
    $component.empty();

    this.appendText($component, text);
  }

  // Appends <spans> created from 'text' to html content of '$component'.
  protected static appendText($component: JQuery, text: string)
  {
    if (text.indexOf('&') !== -1)
    {
      $component.append(MudColors.htmlize(text));
    }
    else
    {
      let $span = $(document.createElement('span'))

      $span.text(text);
      $component.append($span);
    }
  }

  protected static createDiv
  (
    {
      $container = null,
      text = null,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null
    }:
    {
      $container?: JQuery;
      text?: string;
      gCssClass?: string;
      sCssClass?: string;
    }
    = {}
  )
  : JQuery
  {
    let $element = $(document.createElement('div'));

    this.initElement($element, $container, gCssClass, sCssClass);

    if (text !== null)
      this.setText($element, text);

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
    param: Component.InputParam = null
  )
  : JQuery
  {
    if (!this.checkNameParam(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'text', name);
    this.applyInputParam($element, param);

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
    param: Component.InputParam = null
  )
  : JQuery
  {
    if (!this.checkNameParam(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'password', name);
    this.applyInputParam($element, param);

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
    param: Component.InputParam = null
  )
  : JQuery
  {
    if (!this.checkNameParam(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'email', name);
    this.applyInputParam($element, param);

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
    param: Component.CheckboxParam = null
  )
  : JQuery
  {
    if (!this.checkNameParam(name))
      return;

    let $element = $(document.createElement('input'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'checkbox', name);
    this.applyInputParam($element, param);

    return $element;
  }

  // Creates a button which submits form data
  // (use createButton() to create a standalone button).
  protected static createSubmitButton
  (
    {
      $container = null,
      name,
      gCssClass = Component.BUTTON_G_CSS_CLASS,
      sCssClass = null,
      text = null
    }:
    {
      $container?: JQuery;
      name: string;
      gCssClass?: string;
      sCssClass?: string;
      text: string;
    },
    param: Component.ButtonParam = null
  )
  : JQuery
  {
    if (!this.checkNameParam(name))
      return;

    let $element = $(document.createElement('button'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.initFormInputElement($element, 'submit', name);
    this.applyButtonParam($element, param);

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
    }:
    {
      $container?: JQuery;
      gCssClass?: string;
      sCssClass?: string;
    },
    param: Component.TextAreaParam
  )
  : JQuery
  {
    let $element = $(document.createElement('textarea'));

    this.initElement($element, $container, gCssClass, sCssClass);
    this.applyTextAreaParam($element, param);

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
  )
  : JQuery
  {
    let $element = $(document.createElement('label'));

    this.initElement($element, $container, gCssClass, sCssClass);

    if (text !== null)
      this.setText($element, text);

    return $element;
  }

  protected static createSpan
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
    let $element = $(document.createElement('span'));

    return this.initElement($element, $container, gCssClass, sCssClass);
  }

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
    }:
    {
      $container?: JQuery;
      gCssClass?: string;
      sCssClass?: string;
      text: string;
    },
    param: Component.ButtonParam = null
  )
  : JQuery
  {
    let $element = $(document.createElement('button'));

    // This must be set so the button click won't trigger submit
    // of a form.
    $element.attr('type', 'button');

    this.initElement($element, $container, gCssClass, sCssClass);
    this.applyButtonParam($element, param);

    if (text !== null)
      this.setText($element, text);

    return $element;
  }

  // Generic clickable text link
  // (note that it's <button>, not <a href=...>).
  protected static createTextLink
  (
    {
      $container = null,
      gCssClass = Component.LINK_TEXT_G_CSS_CLASS,
      sCssClass = null,
      text = null
    }:
    {
      $container?: JQuery;
      gCssClass?: string;
      sCssClass?: string;
      text: string;
    },
    param: Component.ButtonParam = null
  )
  : JQuery
  {
    // Use <button> instead of <a href=...> because we
    // are going to handle the clicks ourselves.
    return this.createButton
    (
      {
        $container,
        gCssClass,
        sCssClass,
        text
      },
      param
    );
  }

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

  // Generic non-clickable text.
  protected static createText
  (
    {
      $container = null,
      gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      sCssClass = null,
      text = null
    }:
    {
      $container?: JQuery;
      gCssClass?: string;
      sCssClass?: string;
      text: string;
    }
  )
  : JQuery
  {
    let $text = this.createSpan
    (
      {
        $container,
        gCssClass,
        sCssClass
      }
    );

    $text.text(text);

    return $text;
  }

  // ---------------- Private methods -------------------

  private static initFormInputElement
  (
    $element: JQuery,
    type: string,
    name: string
  )
  {
    $element.attr('type', type);

    // Form input elements must have a 'name' attribute.
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

  // Applies values of 'param' to input element.
  private static applyInputParam
  (
    $element: JQuery,
    param: Component.InputParam
  )
  {
    if (!$element || !param)
      return;

    if (param.required !== undefined)
      $element.prop('required', param.required);

    if (param.placeholder !== undefined)
      $element.attr('placeholder', param.placeholder);

    if (param.readonly !== undefined)
      $element.prop('readOnly', param.readonly);

    if (param.disabled !== undefined)
      this.setDisabled($element, param.disabled);

    if (param.size !== undefined)
      $element.attr('size', param.size);

    if (param.maxLength !== undefined)
      $element.attr('maxLength', param.maxLength);

    if (param.minLength !== undefined)
      $element.attr('minLength', param.minLength);

    if (param.autocomplete !== undefined)
      $element.attr('autocomplete', param.autocomplete);

    if (param.spellcheck !== undefined)
      $element.prop('spellcheck', param.spellcheck);

    if (param.checked !== undefined)
      $element.prop('checked', param.checked);

    // Apparently 'autocapitalize' only works for virtual keybords at the
    // moment in Chrome (and doesn't work in other browsers except Safari
    // at all) so it's useless right now.
    /// if (param.autocapitalize !== undefined)
    ///   element.setAttribute('autocapitalize', param.autocapitalize);

    if (param.autocorrect !== undefined)
      $element.attr('autocorrect', param.autocorrect);

    /*
    // Standard attributes.

    if (param.required !== undefined)
      element.required = param.required;

    if (param.placeholder !== undefined)
      element.placeholder = param.placeholder;

    if (param.readonly !== undefined)
      element.readOnly = param.readonly;

    // if (param.disabled !== undefined)
    //   element.disabled = param.disabled;

    if (param.size !== undefined)
      element.size = param.size;

    if (param.maxLength !== undefined)
      element.maxLength = param.maxLength;

    if (param.minLength !== undefined)
      element.minLength = param.minLength;

    if (param.autocomplete !== undefined)
      element.autocomplete = param.autocomplete;

    if (param.spellcheck !== undefined)
      element.spellcheck = param.spellcheck;

    if (param.checked !== undefined)
      element.checked = param.checked

    // Nonstandard attributes (so they can't be simply assigned
    // and must byt set using setAttribute()).

    // Apparently 'autocapitalize' only works for virtual keybords at the
    // moment in Chrome (and doesn't work in other browsers except Safari
    // at all) so it's useless right now.
    /// if (param.autocapitalize !== undefined)
    ///   element.setAttribute('autocapitalize', param.autocapitalize);

    if (param.autocorrect !== undefined)
      element.setAttribute('autocorrect', param.autocorrect);
    */
  }

  private static applyButtonParam
  (
    $element: JQuery,
    param: Component.ButtonParam
  )
  {
    if (!$element || !param)
      return;

    // Note that there is difference between attribute 'disabled'
    // and property 'disabled'. Attribute 'disabled' only specifies
    // initial value of 'disabled' property of the element, property
    // 'disabled' reflects actual state of the element.
    if (param && param.disabled !== undefined)
      this.setDisabled($element, param.disabled);
  }

  private static applyTextAreaParam
  (
    $element: JQuery,
    param: Component.TextAreaParam
  )
  {
    if (!$element || !param)
      return;

    if (param && param.rows)
      $element.attr('rows', param.rows);

    if (param.spellcheck !== undefined)
      $element.prop('spellcheck', param.spellcheck);

    // Nonstandard attributes (so they can't be simply assigned
    // and must byt set using setAttribute()).

    if (param.autocorrect !== undefined)
      $element.attr('autocorrect', param.autocorrect);
/*
    if (param && param.rows)
      element.rows = param.rows;

    if (param.spellcheck !== undefined)
      element.spellcheck = param.spellcheck;

    // Nonstandard attributes (so they can't be simply assigned
    // and must byt set using setAttribute()).

    if (param.autocorrect !== undefined)
      element.setAttribute('autocorrect', param.autocorrect);
*/
  }

  private static checkNameParam(name: string)
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

  private static setDisabled($element: JQuery, value: boolean)
  {
    // That there is difference between attribute 'disabled' and
    // property 'disabled'. Attribute only specifies initial value
    // of 'disabled' property of the element, property reflects
    // actual state of the element.
    $element.prop('disabled', value);
  }

  // ---------------- Event handlers --------------------

}

// ------------------ Type declarations ----------------------

export module Component
{
  export interface InputParam
  {
    required?: boolean,
    placeholder?: string,
    readonly?: boolean,
    disabled?: boolean,
    size?: number,
    minLength?: number,
    maxLength?: number,
    spellcheck?: boolean,
    ///autocapitalize?: AutocapitalizeValue,
    autocorrect?: AutocorrectValue,
    autocomplete?: AutocompleteValue,
    checked?: boolean
  }

  export interface ButtonParam
  {
    disabled?: boolean
  }

  export interface CheckboxParam
  {
    readonly?: boolean,
    disabled?: boolean,
    checked?: boolean
  }  

  export interface TextAreaParam
  {
    rows?: number,
    spellcheck?: boolean,
    autocorrect?: AutocorrectValue
  }

  // Valid values of 'autocapitalize' attribute.
  type AutocapitalizeValue = 'none' | 'characters' | 'words' | 'sentences';

  // Valid values of 'autocorrect' attribute.
  type AutocorrectValue = 'on' | 'off';

  // Valid values of 'autocomplete' attribute
  // (there are a lot more possible values, add them here
  //  if you need them).
  type AutocompleteValue = 'on' | 'off' | 'email' | 'username';
}