/*
  Part of BrutusNEXT

  Implements output element of scrollable text window.
*/

'use strict';

import MudColorComponent = require('../components/MudColorComponent');

import $ = require('jquery');

class ScrollViewOutput extends MudColorComponent
{
  public static get CSS_CLASS() { return 'ScrollViewOutput'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $output = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(id: string)
  {
    this.id = id;

    // Create a DOM element.
    let output = this.createDivElement
    (
      this.id,
      ScrollViewOutput.CSS_CLASS
    );

    // Create jquery element from the DOM element.
    this.$output = $(output);

    /*
      Nefunguje to, protoze div defaultne nemuze dostat focus,
      takze se na nem nespoustej keyboard eventy.
      - reseni je setnout tabindex = '0'
        (0 znamena 'in natural tab order')
        (-1 by znamenalo "focusable only by script, not by user",
         to by taky mohlo pomoct).
    */
    this.$output.keydown
    (
      (event) => { this.onKeyDown(event); }
    );

    /*
    /// Test
    this.$output.keypress
    (
      (event) => { console.log('!'); event.preventDefault(); }
    );

    /// Test
    this.$output.keydown
    (
      (event) => { console.log('!'); event.preventDefault(); }
    );

    /// Test
    this.$output.keyup
    (
      (event) => { console.log('!'); event.preventDefault(); }
    );
    */

    return this.$output;
  }

  // Converts message from mud colors (like '&Rhealth&g') to html
  // reprezentation (using <span> elements) and adds the result to
  // the end of output component.
  public appendMessage(message: string)
  {
    let html = this.htmlizeMudColors(message);

    this.appendHtml(html, { forceScroll: false });
  }

  // If 'param.forceScroll' is 'true', output always scrolls to the bottom.
  // Otherwise it only scrolls if user hasn't scrolled up manually.
  public appendHtml(html: string, param: { forceScroll: boolean })
  {
    // Size of the scrollable range (in pixels).
    let range =
      this.$output.prop('scrollHeight') - this.$output.prop('clientHeight');

    // 'true' if user has scrolled up manually
    // (-1 to account for rounding errors. If use scolled up by
    //  less than one pixel, we can safely scoll back down anyways).
    let userScrolled = (this.$output.scrollTop()) < (range - 1);

    this.$output.append(html);

    // If user scolls up manually, we don't want to scroll
    // the output down to the bottom on each output, that
    // would be very inconvinient.
    if (param.forceScroll || !userScrolled)
      this.scrollToBottom();
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  public scrollToBottom()
  {
    // Scroll to bottom.
    this.$output.scrollTop(this.$output.prop('scrollHeight'));
  }

  // ---------------- Event handlers --------------------

  private onKeyDown(event: KeyboardEvent)
  {
    console.log('ScrollViewOutput.onKeyDown()');
  }
}

export = ScrollViewOutput;