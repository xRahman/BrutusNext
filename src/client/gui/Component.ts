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

import $ = require('jquery');

export abstract class Component
{
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

  protected static createDiv
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
    let element = document.createElement('div');

    return this.initElement(element, $container, gCssClass, sCssClass);
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
    let element = document.createElement('img');

    return this.initElement(element, $container, gCssClass, sCssClass);
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
    let element = document.createElement('form');

    // Form must have a 'name' attribute.
    element.name = name;

    return this.initElement(element, $container, gCssClass, sCssClass);
  }

  protected static createTitle
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
    let element = document.createElement('title');

    return this.initElement(element, $container, gCssClass, sCssClass);
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

    let element = document.createElement('input');

    element.type = 'text';

    // Form input elements must have a 'name' attribute.
    element.name = name;

    this.applyInputParam(element, param);

    return this.initElement(element, $container, gCssClass, sCssClass);
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

    let element = document.createElement('input');

    element.type = 'password';

    // Form input elements must have a 'name' attribute.
    element.name = name;

    this.applyInputParam(element, param);

    return this.initElement(element, $container, gCssClass, sCssClass);
  }

  protected static createEmailInput
  (
    {
      $container = null,
      name,
      gCssClass = Component.INPUT_G_CSS_CLASS,
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

    let element = document.createElement('input');

    element.type = 'email';

    // Form input elements must have a 'name' attribute.
    element.name = name;

    this.applyInputParam(element, param);

    return this.initElement(element, $container, gCssClass, sCssClass);
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

    let element = document.createElement('input');

    element.type = 'checkbox';

    // Form input elements must have a 'name' attribute.
    element.name = name;

    this.applyInputParam(element, param);

    return this.initElement(element, $container, gCssClass, sCssClass);
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

    let element = document.createElement('button');

    element.type = 'submit';

    // Form input elements must have a 'name' attribute.
    element.name = name;

    this.applyButtonParam(element, param);

    let $element = this.initElement(element, $container, gCssClass, sCssClass);

    // Set 'text' using JQuery to handle browser incompatibilities.
    if (text)
      $element.text(text);

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
    let element = document.createElement('textarea');

    this.applyTextAreaParam(element, param);

    return this.initElement(element, $container, gCssClass, sCssClass);
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
      text
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
    let element = document.createElement('label');
    let $element = this.initElement(element, $container, gCssClass, sCssClass);

    // Set 'text' using JQuery to handle browser incompatibilities.
    $element.text(text);

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
    let element = document.createElement('span');

    return this.initElement(element, $container, gCssClass, sCssClass);
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
    let element = document.createElement('button');

    // This must be set so the button click won't trigger submit
    // of a form.
    element.type = 'button';

    this.applyButtonParam(element, param);

    let $element = this.initElement(element, $container, gCssClass, sCssClass);

    // Set 'text' using JQuery to handle browser incompatibilities.
    $element.text(text);

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

  private static initElement<T extends HTMLElement>
  (
    element: T,
    $container: JQuery,
    // Css class with graphical attributes of the element
    // (borders, background, font, font size, etc.).
    gCssClass: string,
    // Css class with structural attributes of the element
    // (size, position, margin, padding, floating, etc.).
    sCssClass: string
  )
  {
    // Create jquery element from the DOM element.
    let $element = $(element);

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
    element: HTMLInputElement,
    param: Component.InputParam
  )
  {
    if (!element || !param)
      return;

    // Standard attributes.

    if (param.required !== undefined)
      element.required = param.required;

    if (param.placeholder !== undefined)
      element.placeholder = param.placeholder;

    if (param.readonly !== undefined)
      element.readOnly = param.readonly;

    if (param.disabled !== undefined)
      element.disabled = param.disabled;

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
  }

  private static applyButtonParam
  (
    element: HTMLButtonElement,
    param: Component.ButtonParam
  )
  {
    if (!element || !param)
      return;

    if (param && param.disabled)
      element.disabled = param.disabled;
  }

  private static applyTextAreaParam
  (
    element: HTMLTextAreaElement,
    param: Component.TextAreaParam
  )
  {
    if (!element || !param)
      return;

    if (param && param.rows)
      element.rows = param.rows;

    if (param.spellcheck !== undefined)
      element.spellcheck = param.spellcheck;

    // Nonstandard attributes (so they can't be simply assigned
    // and must byt set using setAttribute()).

    if (param.autocorrect !== undefined)
      element.setAttribute('autocorrect', param.autocorrect);
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