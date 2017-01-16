/*
  Part of BrutusNEXT

  Implements ancestor of classes that create and manage html
  elements in the document.
*/

'use strict';

///import $ = require('jquery');
import ERROR = require('../error/ERROR');

class Component
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

  // -> Returns created DOM 'title' element.
  protected createTitleElement(id: string, cssClass: string)
  {
    let element = document.createElement('title');

    return this.initElement(element, id, cssClass);
  }

  // -> Returns created DOM 'textarea' element.
  protected createTextAreaElement(id: string, cssClass: string)
  {
    let element = document.createElement('textarea');

    return this.initElement(element, id, cssClass);
  }

  /*
  // Adds '$child' jquery element as the last child
  // of '$parent' jquery element.
  protected appendElement($parent: JQuery, $child: JQuery)
  {
    if ($parent === null || $parent === undefined)
    {
      ERROR("Attempt to append to an invalid parent."
       + " Element is not added");
       return;
    }

    if ($child === null || $child === undefined)
    {
      ERROR("Attempt to append to an invalid element."
       + " Element is not added");
    }

    $parent.append($child);
  }
  */

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

export = Component;