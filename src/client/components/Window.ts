/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

import Element = require('../components/Element');

import $ = require('jquery');

class Window extends Element
{
  constructor()
  {
    super();
  }

  // -------------- Static class data -------------------


  //------------------ Private data ---------------------

  // 'id' parameter of html element.
  ///private id = '#scroll-view';

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