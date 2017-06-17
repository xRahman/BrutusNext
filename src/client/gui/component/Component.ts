/*
  Part of BrutusNEXT

  Implements abstract ancestor of classes that create and manage html
  elements in the document.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';

export abstract class Component
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' attribute of html element.
  protected id = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // -> Returns created 'div' jquery element.
  protected createDiv(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('div');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'div' jquery element.
  protected createForm(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('form');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'title' jquery element.
  protected createTitle(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('title');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createTextInput(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('input');

    element.setAttribute('type', 'text');

    // Disable spell checking and other annoying stuff.
    element.setAttribute('spellcheck', 'false');
    element.setAttribute('autocapitalize', 'none');
    element.setAttribute('autocorrect', 'off');
    element.setAttribute('autocomplete', 'off');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createPasswordInput(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('input');

    element.setAttribute('type', 'password');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createEmailInput(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('input');

    element.setAttribute('type', 'email');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'input' jquery element.
  protected createCheckboxInput(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('input');

    element.setAttribute('type', 'checkbox');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'textarea' jquery element.
  protected createTextArea(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('textarea');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'svg' jquery element.
  protected createSvg(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('svg');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'label' jquery element.
  protected createLabel(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('label');

    return this.initElement(element, id, cssClass);
  }

  protected createSpan(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('span');

    return this.initElement(element, id, cssClass);
  }

  // Creates a button which is not part of a form
  // (use createSubmitButton() to create a button that
  //  submits form data).
  protected createButton(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('button');

    return this.initElement(element, id, cssClass);
  }

  /// Ve skutečnosti asi vůbec nechci používat href, ale button bez grafiky...
  /// 
  /*
  protected createHref(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('a');

    return this.initElement(element, id, cssClass);
  }
  */

  // Creates a button which submits data from a form
  // (use createButton() to create a standalone button).
  // -> Returns created 'label' jquery element.
  protected createSubmitButton(id: string, cssClass: string): JQuery
  {
    let element = document.createElement('button');

    element.setAttribute('type', 'submit');

    return this.initElement(element, id, cssClass);
  }

  // ---------------- Private methods -------------------

  // -> Returns created jquery element.
  private initElement<T extends HTMLElement>
  (
    element: T,
    id: string,
    cssClass: string
  )
  {
    if (id)
      element.id = id;

    if (cssClass)
      element.className = cssClass;

    // Create jquery element from the DOM element.
    return $(element);
  }

  // ---------------- Event handlers --------------------

}