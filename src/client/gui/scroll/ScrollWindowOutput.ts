/*
  Part of BrutusNEXT

  Displays scrollable text.
*/

'use strict';

import {Component} from '../../../client/gui/Component';

export class ScrollWindowOutput extends Component
{
  public static get S_CSS_CLASS()
    { return 'S_ScrollWindowOutput'; }

  // ----------------- Private data ---------------------

  private $output: JQuery = null;

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(param: Component.DivParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        name: 'scroll_window_output',
        // Use NO_GRAPHICS_G_CSS_CLASS to disable default outline
        // when selected.
        gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
        sCssClass: ScrollWindowOutput.S_CSS_CLASS,
        // In order to trigger keyboard events on <div> element,
        // it must have focus. To give it a focus, it must have
        // a 'tabindex' attribute set.
        // ('tabindex: -1' means: focusable only by script, not by user)
        tabindex: -1,
        keydown: (event) => { this.onKeyDown(event); }
      }
    );

    this.$output = this.createDiv(param);
  }

  public append
  (
    message: string,
    {
      baseTextColor = null,
      forceScroll = false
    }
    : ScrollWindowOutput.AppendParam = {}
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
        baseTextColor: baseTextColor,
        text: message
      }
    );

    // If user scolls up manually, we don't want to scroll
    // the output down to the bottom on each output, that
    // would be very inconvinient. However, 'forceScroll'
    // parameter overrides it.
    if (!userScrolled || forceScroll)
      this.scrollToBottom();
  }

  public scrollToTop()
  {
    this.$output.scrollTop(0);
  }

  public scrollToBottom()
  {
    this.$output.scrollTop(this.$output.prop('scrollHeight'));
  }

  public triggerKeyboardEvent(event)
  {
    // In order for <div> element to process keyboard events,
    // it must have focus. To be able to give it a focus,
    // it must have a 'tabindex' attribute set (that's done
    // in ScrollWindowOutput.create()).
    this.$output.focus();

    // Now we can trigger the keyboard event.
    this.$output.trigger(event);
  }

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
  private onKeyDown(event: JQueryEventObject)
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

// ------------------ Type Declarations ----------------------

export module ScrollWindowOutput
{
  export interface AppendParam
  {
    baseTextColor?: string;
    forceScroll?: boolean;
  }
}