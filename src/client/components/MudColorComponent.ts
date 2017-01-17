/*
  Part of BrutusNEXT

  Implements ability to convert mud colored message (like '&Rhealth&g')
  to respective html (using <span> elements).
*/

'use strict';

import Component = require('../components/Component');

abstract class MudColorComponent extends Component
{
  // --------------- Protected methods ------------------

  // -> Returns html that creates the element.
  protected htmlizeMudColors(mudText: string)
  {
    /// TODO: Korektni obarvovani message.

    let html =
      '<span style="color:green;font-family:CourrierNewBold;">'
        + mudText;
    + '</span>';

    return html;
  }
}

export = MudColorComponent;