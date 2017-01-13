/*
  Part of BrutusNEXT

  Implements ancestor of classes that create and manage html
  elements in the document.
*/

'use strict';

///import $ = require('jquery');

class Component
{
  constructor()
  {
  }

  // -------------- Static class data -------------------


  //------------------ Private data ---------------------

  // 'id' parameter of html element.
  private id = null;

  // --------------- Static accessors -------------------

  // These are shortcuts so you don't have to use Client.getInstance()

  /// Example
  /*
  public static get game()
  {
    return Server.getInstance().game;
  }
  */
  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getId() { return this.id; }
  public setId(id: string) { this.id = id; }

  // ---------------- Public methods --------------------

  /// Nevim, jestli to budu potrebovat.
  /*
  // Creates respective html element in the document
  // (does not insert it in it's container element).
  // -> Returns newly created html element.
  public createHtmlElement()
  {
    
  }
  */

  // --------------- Protected methods ------------------

  protected appendElement(element: any)
  {
    // Select this element by it's id and add the element
    // as it's last child.
    ///$('#' + this.id).append(element);
    document.getElementById(this.id).appendChild(element);
  }


  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}

export = Component;