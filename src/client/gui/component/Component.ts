/*
  Part of BrutusNEXT

  Implements abstract ancestor of classes that create and manage html
  elements in the document.
*/

/*
  Naming convention:
    createSomething() methods always take css class as a parameter.
    appendSomething() methods provide css class themselves.

  So appendSomething() methods are usually used inside a specific
  component and use it's CSS_CLASS constats.

  Note:
    appendSomething() methods can't be named createSomething(),
  because they usually take different parameters than parent
  method (Component.createSomething()) so they can't be simply
  overriden.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';

import $ = require('jquery');

// Valid values of 'autocapitalize' attribute.
type AutocapitalizeValue = 'none' | 'characters' | 'words' | 'sentences';

// Valid values of 'autocorrect' attribute.
type AutocorrectValue = 'on' | 'off';

// Valid values of 'autocomplete' attribute
// (there are a lot more possible values, add them here
//  if you need them).
type AutocompleteValue = 'on' | 'off' | 'email' | 'username';

export interface InputParam
{
  required?: boolean,
  placeholder?: string,
  readonly?: boolean,
  disabled?: boolean,
  size?: number,
  maxlength?: number,
  spellcheck?: boolean,
  autocapitalize?: AutocapitalizeValue,
  autocorrect?: AutocorrectValue,
  autocomplete?: AutocompleteValue,
  checked?: boolean
}

interface ButtonParam
{
  disabled?: boolean
}

interface TextAreaParam
{
  rows?: number
}

export abstract class Component
{
  ///protected static get TEXT_CSS_CLASS() { return 'Text'; }
  protected static get LINK_CSS_CLASS() { return 'Link'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // -> Returns created 'div' jquery element.
  protected createDiv($container: JQuery, cssClass: string): JQuery
  {
    let element = document.createElement('div');

    return this.initElement(element, $container, cssClass);
  }

  // -> Returns created 'div' jquery element.
  protected createForm
  (
    $container: JQuery,
    cssClass: string,
    name: string               // 'name' attribute. Required.
  )
  : JQuery
  {
    let element = document.createElement('form');

    // Form must have a 'name' attribute.
    element.name = name;

    return this.initElement(element, $container, cssClass);
  }

  // -> Returns created 'title' jquery element.
  protected createTitle($container: JQuery, cssClass: string): JQuery
  {
    let element = document.createElement('title');

    return this.initElement(element, $container, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createTextInput
  (
    $container: JQuery,
    cssClass: string,
    name: string,               // 'name' attribute. Required.
    param: InputParam
    /*
    {
      placeholder?: string,        // Placeholder text.
      readonly?: boolean,
      disabled?: boolean,
      size?: number,             // In characters.
      maxlength?: number,        // In characters.
      spellcheck?: boolean,      // Enables red wavy underilne.
      autocapitalize?: AutocapitalizeValue,
      autocorrect?: AutocorrectValue,
      autocomplete?: AutocompleteValue
    }
    */
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

    /*
    if (param)
    {
      if (param.readonly)
        element.readOnly = param.readonly;
      if (param.disabled)
        element.disabled = param.disabled;
      if (param.size)
        element.size = param.size;
      if (param.maxlength)
        element.maxLength = param.maxlength;
      if (param.spellcheck)
        element.spellcheck = param.spellcheck;
      if (param.autocapitalize)
        element.setAttribute('autocapitalize', param.autocapitalize);
      if (param.autocorrect)
        element.setAttribute('param.autocorrect', param.autocorrect);
      if (param.autocomplete)
        element.setAttribute('param.autocomplete', param.autocomplete);

      // // Disable spell checking and other annoying stuff.
      // element.setAttribute('spellcheck', 'false');
      // element.setAttribute('autocapitalize', 'none');
      // element.setAttribute('autocorrect', 'off');
      // element.setAttribute('autocomplete', 'off');
    }
    */

    return this.initElement(element, $container, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createPasswordInput
  (
    $container: JQuery,
    cssClass: string,
    name: string,               // 'name' attribute. Required.
    param: InputParam
    /*
    {
      readonly: boolean,
      disabled: boolean,
      size: number,             // In characters.
      maxlength: number,        // In characters.
      spellcheck: boolean,      // Enables red wavy underilne.
      autocapitalize: AutocapitalizeValue,
      autocorrect: AutocorrectValue,
      autocomplete: AutocompleteValue
    }
    */
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

    return this.initElement(element, $container, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createEmailInput
  (
    $container: JQuery,
    cssClass: string,
    name: string,               // 'name' attribute. Required.
    param: InputParam
    /*
    {
      readonly: boolean,
      disabled: boolean,
      size: number,             // In characters.
      maxlength: number,        // In characters.
      spellcheck: boolean,      // Enables red wavy underilne.
      autocapitalize: AutocapitalizeValue,
      autocorrect: AutocorrectValue,
      autocomplete: AutocompleteValue
    }
    */
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

    return this.initElement(element, $container, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createCheckboxInput
  (
    $container: JQuery,
    cssClass: string,
    name: string,               // 'name' attribute. Required.
    param:
    {
      readonly?: boolean,
      disabled?: boolean,
      checked?: boolean
    }
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

    return this.initElement(element, $container, cssClass);
  }

  // Creates a button which submits data from a form
  // (use createButton() to create a standalone button).
  // -> Returns created 'label' jquery element.
  protected createSubmitButton
  (
    $container: JQuery,
    cssClass: string,
    name: string,               // 'name' attribute. Required.
    text: string,
    param: ButtonParam
    /*
    {
      disabled?: boolean
    }
    */
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

    let $element = this.initElement(element, $container, cssClass);

    // Set 'text' using JQuery to handle browser incompatibilities.
    $element.text(text);

    return $element;
  }

  // -> Returns created 'textarea' jquery element.
  protected createTextArea
  (
    $container: JQuery,
    cssClass: string,
    param: TextAreaParam
  )
  : JQuery
  {
    let element = document.createElement('textarea');

    this.applyTextAreaParam(element, param);

    return this.initElement(element, $container, cssClass);
  }

  /// Tohle se nejspíš nepoužívá (svg elementy se vyrábí přes knihovnu d3).
  /*
  // -> Returns created 'svg' jquery element.
  protected createSvg(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('svg');

    return this.initElement(element, $container, id, cssClass);
  }
  */

  // -> Returns created 'label' jquery element.
  protected createLabel
  (
    $container: JQuery,
    cssClass: string,
    text: string
  )
  : JQuery
  {
    let element = document.createElement('label');
    let $element = this.initElement(element, $container, cssClass);

    // Set 'text' using JQuery to handle browser incompatibilities.
    $element.text(text);

    return $element;
  }

  protected createSpan($container: JQuery, cssClass: string): JQuery
  {
    let element = document.createElement('span');

    return this.initElement(element, $container, cssClass);
  }

  // Creates a button which is not part of a form
  // (use createSubmitButton() to create a button that
  //  submits form data).
  protected createButton
  (
    $container: JQuery,
    cssClass: string,
    text: string,
    param: ButtonParam
  )
  : JQuery
  {
    let element = document.createElement('button');

    // This must be set so the button click won't trigger submit
    // of a form.
    element.type = 'button';

    this.applyButtonParam(element, param);

    let $element = this.initElement(element, $container, cssClass);

    // Set 'text' using JQuery to handle browser incompatibilities.
    $element.text(text);

    return $element;
  }

  /// Ve skutečnosti asi vůbec nechci používat href, ale button bez grafiky...
  /// 
  /*
  protected createHref(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('a');

    return this.initElement(element, $container, id, cssClass);
  }
  */

  // Generic non-clickable text.
  protected appendText($container: JQuery, text: string)
  {
    let $text = this.createSpan
    (
      null,   // No id.
      null    // No CSS class (use default font attributes).
    );

    $text.text(text);

    $container.append($text);

    return $text;
  }

  // Generic clickable text link
  // (note that it's <button>, not <a href=...>).
  protected appendLink($container: JQuery, text: string)
  {
    // Use <button> instead of <a href=...> because we
    // are going to handle the clicks ourselves.
    return this.createButton
    (
      $container,
      Component.LINK_CSS_CLASS,
      text,
      null
    );
  }

  // ---------------- Private methods -------------------

  // -> Returns created jquery element.
  private initElement<T extends HTMLElement>
  (
    element: T,
    $container: JQuery,
    cssClass: string
  )
  {

    // Create jquery element from the DOM element.
    let $element = $(element);

    // All components use .Text css class.
    // (This is because font attributes are not always
    //  correctly inherited from <body> element. This
    //  way all texts use the same base attributes.)
    ///$element.addClass(Component.TEXT_CSS_CLASS);

    if (cssClass)
      $element.addClass(cssClass);

    if ($container)
      $container.append($element);

    return $element;
  }

  // Applies values of 'param' to input element.
  private applyInputParam
  (
    element: HTMLInputElement,
    param: InputParam
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

    if (param.maxlength !== undefined)
      element.maxLength = param.maxlength;

    if (param.autocomplete !== undefined)
      element.autocomplete = param.autocomplete;

    if (param.spellcheck !== undefined)
      element.spellcheck = param.spellcheck;

    if (param.checked !== undefined)
      element.checked = param.checked

    // Nonstandard attributes (so they can't be simply assigned
    // and must byt set using setAttribute()).

    if (param.autocapitalize !== undefined)
      element.setAttribute('autocapitalize', param.autocapitalize);

    if (param.autocorrect !== undefined)
      element.setAttribute('autocorrect', param.autocorrect);
  }

  private applyButtonParam(element: HTMLButtonElement, param: ButtonParam)
  {
    if (!element || !param)
      return;

    if (param && param.disabled)
      element.disabled = param.disabled;
  }

  private applyTextAreaParam
  (
    element: HTMLTextAreaElement,
    param: TextAreaParam
  )
  {
    if (!element || !param)
      return;

    if (param && param.rows)
      element.rows = param.rows;
  }

  private checkNameParam(name: string)
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