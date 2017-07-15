/*
  Part of BrutusNEXT

  Implements output element of scrollable text window.
*/

'use strict';

import {Component} from '../../../client/gui/Component';
import {MudColors} from '../../../client/gui/MudColors';

import $ = require('jquery');

export class ScrollWindowOutput extends Component
{
  public static get S_CSS_CLASS()
    { return 'S_ScrollWindowOutput'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private $output = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create($container: JQuery)
  {
    this.$output = this.createDiv
    (
      {
        $parent: $container,
        sCssClass: ScrollWindowOutput.S_CSS_CLASS,
        // In order to trigger keyboard events on <div> element,
        // it must have focus. To give it a focus, it must have
        // a 'tabindex' attribute set.
        // ('tabindex: -1' means: focusable only by script, not by user)
        tabindex: -1
      }
    );

    /*
    // In order to trigger keyboard events on <div> element,
    // it must have focus. To give it a focus, it must have
    // a 'tabindex' attribute set.
    // ('tabindex: -1' means: focusable only by script, not by user)
    this.$output.attr('tabindex',  '-1');
    */

    this.$output.keydown
    (
      (event) => { this.onKeyDown(event); }
    );
  }

  public append
  (
    message: string,
    {
      baseTextColor = null,
      forceScroll = false
    }:
    {
      baseTextColor?: string;
      forceScroll?: boolean;
    }
    = {}
  )
  {
    let userScrolled = false;

    // Determine if output is scrolled up by user
    // (there is no need to do it if 'forceScroll' is true).
    if (!forceScroll)
      userScrolled = this.isUserScrolled();

    // Create a new <div> element, set 'message' as it's
    // text content and append it to 'this.$output'.
    this.createDiv
    (
      {
        $parent: this.$output,
        baseTextColor: baseTextColor
      }
    );

    // If user scolls up manually, we don't want to scroll
    // the output down to the bottom on each output, that
    // would be very inconvinient. However, 'forceScroll'
    // parameter overrides it.
    if (!userScrolled || forceScroll)
      this.scrollToBottom();
  }

  /// Deprecated.
  // Converts message from mud colors (like '&Rhealth&g') to html
  // reprezentation (using <span> elements) and adds the result to
  // the end of output component.
  public appendMessage(message: string)
  {
    this.append(message);
  }

  // // If 'param.forceScroll' is 'true', output always scrolls to the bottom.
  // // Otherwise it only scrolls if user hasn't scrolled up manually.
  // public appendHtml(html: string, param: { forceScroll: boolean })
  // {
  //   // Size of the scrollable range (in pixels).
  //   let range =
  //     this.$output.prop('scrollHeight') - this.$output.prop('clientHeight');

  //   // 'true' if user has scrolled up manually
  //   // (-1 to account for rounding errors. If user scolled up by
  //   //  less than one pixel, we can safely scoll back down anyways).
  //   let userScrolled = (this.$output.scrollTop()) < (range - 1);

  //   this.$output.append(html);

  //   // If user scolls up manually, we don't want to scroll
  //   // the output down to the bottom on each output, that
  //   // would be very inconvinient.
  //   if (param.forceScroll || !userScrolled)
  //     this.scrollToBottom();
  // }

  public scrollToTop()
  {
    this.$output.scrollTop(0);
  }

  public scrollToBottom()
  {
    this.$output.scrollTop(this.$output.prop('scrollHeight'));
  }

  public triggerKeyboardEvent(event: JQueryKeyEventObject)
  {
    // In order for <div> element to process keyboard events,
    // it must have focus. To be able to give it a focus,
    // it must have a 'tabindex' attribute set (that's done
    // in ScrollWindowOutput.create()).
    this.$output.focus();

    // Now we can trigger the keyboard event.
    this.$output.trigger(event);
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // Determines if output is scrolled up by user.
  private isUserScrolled()
  {
    // Size of the scrollable range (in pixels).
    let range =
      this.$output.prop('scrollHeight') - this.$output.prop('clientHeight');

    // 'true' if user has scrolled up manually
    // (-1 to account for rounding errors. If user scolled up by
    //  less than one pixel, we can safely scoll back down anyways).
    return (this.$output.scrollTop()) < (range - 1);
  }

  // ---------------- Event handlers --------------------

  // Handles 'keydown' event.
  // (Note that this will only trigger on <div> element
  //  if it has a focus and it can only have a focus if
  //  it has a 'tabidnex' attribute set.)
  private onKeyDown(event: KeyboardEvent)
  {
    let key = event.which;

    // PgUp(33), PgDn(34).
    if (key === 33 || key === 34)
    {
      // We are not preventing default handler because we
      // want it to do the scrolling for us. We are, however,
      // preventing propagation of the event to our parent
      // element (and thus recursively up to the 'document'),
      // because document is watching for this very type of
      // event (so that output can be scrolled by PgUp and PgDown
      // even if it doesn't have a focus) so letting this event
      // propagate would lead to infinite recursion.
      event.stopPropagation();
    }
  }
}