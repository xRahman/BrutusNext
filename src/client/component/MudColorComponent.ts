/*
  Part of BrutusNEXT

  Implements ability to convert mud colored message (like '&Rhealth&g')
  to respective html (using <span> elements).
*/

'use strict';

import Component = require('../component/Component');

const Colors =
{
  '&k': '#000',	   //black
  '&K':	'#6E6E6E', //bright black
  '&r':	'#bf1b00', //red
  '&R':	'#ff193f', //bright red
  '&g':	'#00ac00', //green
  '&G':	'#a1e577', //bright green
  '&y':	'#DAA520', //yellow		
  '&Y':	'#f3df00', //bright yellow
  '&b':	'#1f68d5', //blue
  '&B':	'#3680ee', //bright blue
  '&m':	'#a501a7', //magenta
  '&M':	'#e100e4', //bright magenta
  '&c':	'#01c8d4', //cyan
  '&C':	'#5bedf6', //bright cyan
  '&w':	'#dbdbdb', //off-white
  '&W':	'#fff',	   //bright white
  '39': '#dbdbdb', //default
}

abstract class MudColorComponent extends Component
{
  // --------------- Protected methods ------------------

  // -> Returns html that creates the element.
  protected htmlizeMudColors(mudText: string)
  {
    /// TODO: Korektni obarvovani message.

    let html =
      '<div>'
    +   '<span style="color:green;font-family:CourrierNewBold;">'
    +      mudText
    +   '</span>'
    + '</div>';

    return html;
  }
}

export = MudColorComponent;