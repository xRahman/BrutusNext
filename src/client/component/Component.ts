/*
  Part of BrutusNEXT

  Implements abstract ancestor of classes that create and manage html
  elements in the document.
*/

'use strict';

///import ERROR = require('../error/ERROR');
import {ERROR} from '../error/ERROR';

export abstract class Component
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element.
  protected id = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // -> Returns created 'div' DOM element.
  protected createDivElement(id: string, cssClass: string)
  {
    let element = document.createElement('div');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'title' DOM element.
  protected createTitleElement(id: string, cssClass: string)
  {
    let element = document.createElement('title');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created 'textarea' DOM element.
  protected createTextAreaElement(id: string, cssClass: string)
  {
    let element = document.createElement('textarea');

    return this.initElement(element, id, cssClass);
  }

  // ---------------- Private methods -------------------

  // -> Returns created DOM element.
  private initElement<T extends HTMLElement>
  (
    element: T,
    id: string,
    cssClass: string
  )
  {
    element.id = id;
    element.className = cssClass;

    return element;
  }

  // ---------------- Event handlers --------------------

}

///export default Component;
///export = Component;