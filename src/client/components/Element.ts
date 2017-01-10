/*
  Part of BrutusNEXT

  Implements ancestor of classes that create and manage html
  elements in the document.
*/

'use strict';

import $ = require('jquery');

class Element
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

  // ---------------- Public methods --------------------

  // Creates respective html element and inserts it to the
  // document.
  public createElement()
  {
    
  }


  // ---------------- Event handlers --------------------

}

export = Window;