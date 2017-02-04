/*
  Part of BrutusNEXT

  Implements functionality attached directly to html document
  ('document' is a global variable).
*/

'use strict';

import {Client} from '../Client';

import $ = require('jquery');

export class Document
{
  constructor(private client: Client)
  {
    // Attach handler for 'document.ready' event.
    $(document).ready
    (
      () => { this.onDocumentReady(); }
    );

    // Attach handler for 'window.resize' event.
    $(window).resize
    (
      'resize',
      // We call the handler 'onDocumentResize' instead of
      // 'onWindowResize' because we use windows inside our
      // application.
      () => { this.onDocumentResize(); }
    )
  }

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // ---------------- Private methods -------------------

  // Sets focus to the input element of currently active
  // scrollview window.
  private focusInput()
  {
    this.client.activeScrollView.focusInput();
  }

  // ---------------- Event handlers --------------------

  // Handles 'document.ready' event.
  // (This event is fired when web page is completely loaded.)
  private onDocumentReady()
  {
    console.log('onDocumentReady() launched');

    // Attach handler for 'keydown' event.
    $(document).keydown
    (
      (event) => { this.onKeyDown(event); }
    );

    this.client.onDocumentReady();
  }

  private onDocumentResize()
  {
    this.client.onDocumentResize();
  }

  // Handles 'keydown' event.
  private onKeyDown(event: JQueryKeyEventObject)
  {
    let key = event.which;
    let alt = event.altKey;
    let ctrl = event.ctrlKey;
    let shift = event.shiftKey;

    ///console.log('onKeyDown(): ' + key);

    /*
      Notes on shortcuts:
    
      'Ctrl + C' or 'Ctrl + Ins' -- copies the text into the clipboard.
        We don't want to give focus to the input element on these combinations,
        because focusing input would prevent copying the selected text.

      'Ctrl + X' or 'Shift + Del' cuts the text into the clipboard.
        We don't want to give focus to the input element on these combinations,
        because  the selection or cursor isn't actully in the input element
        so user doesn't expect the text to be deleted from the input element.
          Selected text actually won't be deleted from the output element
        (because it's disabled), but that's intended and intuitive behaviour.

      'Ctrl + V' or 'Shift + Ins' inserts the text from the clipboard.
        We do want to give focus to the input element, because it's the only
        element where it makes sense to put the text. It also saves the
        user one operation (clicking to input with the mouse to give it
        focus) when she wants to copy something from the output to the
        input. She only needs to select the text and pres 'Ctrl + C'
        followed by 'Ctrl + V' (or 'Ctrl + Ins' followed by 'Shift + Ins'). 

      'Del' deletes the selected text or the character at cursor position.
      'Backspace' deletes selected text or the character before cursor.
        We do not give focus to the input element, because user can't see
        the cursor so it would delete a seemingly random character from
        the input text. It won't do anything because deleting is disabled
        in output element.

      'Ctrl + Z' -- undo
      'Ctrl + Y' -- redo
        We give focus to the input elemet, because it's the only place where
        undoing or redoing makes sense.

      'Ctrl + A' -- select all
        We don't focus the input element, because user wants to select
        all text wherever she currecly is.

      'Tab' -- cycle to the next field
      'Shift + Tab' -- cycle to previous field
        We don't focus the input element, because 'Tab' is supposed to cycle
        between field which would be prevented by focusing the input (and
        tabbing doesn't work in the input element anyways).

      'Home' -- to beginning of line or far left of field or screen.
      'End' -- to end of line, or far right of field or screen.
        We give focus to the input elemet, because this doesn't make
        sense in the output.

      'Ctrl + Home' -- to the top
      'Ctrl + End' -- to the bottom
        We don't focus the input element, because user may want to
        scroll the output all the way up or down.

      'PageUp' -- moves you up by one page
      'PageDown' -- moves you down by one page
        These keys are always redirected to the output element so the user
        can scroll the output up or down even when typing commands to the
        input (or doing anything else). Paging the input element doesn't
        makes sense, because it works as a command buffer where cursor keys
        (Up or Down) recall previous or next command.

      Cursor keys ('Left', 'Right', 'Up', 'Down')
        We give focus to the input elemet, because cursor keys don't make
        any sense in the output.
        /// TODO: Asi je ale budu potřebovat v mapperu.

      'Shift + Ctrl + Right' -- select the whole word
        We give focus to the input elemet, because there is not
        cursor in the output element so it wouldn't do anything.

      'Esc'
        We don't focus the input element, because whatever escape
        does (if anything), it should do it where the focus is.
    */

    switch (key)
    {
      // These keys are never redirected.
      case 8:  // 'Backspace'
        // Use can't see what she would delete (because cursor is not
        // in the input element), so we won't redirect.
      case 9:  // 'Tab'
        // Focusing input would prevent correct cycling between fields.
      case 16:  // 'Shift'
      case 17:  // 'Ctrl'
      case 18:  // 'Alt'
        // Control keys do not give focus to the input
        // element because it would prevent copying and
        // pasting of text.
      case 27:  // 'Esc'
        // Whatever escape does (if anything), it should do it
        // where the focus is.
      case 46:  // 'Del'
        break;

      // These keys are redirected to the output element without
      // giving it focus (so user can keep typing to the input
      // element while scrolling the output element).
      case 33:  // 'PgUp'
      case 34:  // 'PgDn'
        this.client.activeScrollView.triggerOutputEvent(event);
        break;    

      // Following keys are redirected only when a specific key
      // combination is pressed.
      case 36:  // 'Home'
      case 35:  // 'End'
        if (ctrl)
          // 'Ctrl + Home' or 'Ctrl + End' scroll to the top
          // or to the bottom, which should work at the selected
          // element.
          break;
        // 'Home' or 'End' without ctrl is redirected to input element.
        this.focusInput();        
        break;
      case 45:  // 'Ins'
        if (shift)
        {
          // We want even 'Shift + Ins' (paste clipboard) to redirect
          // to the input element, because it's the only place where
          // it makes sense to insert contents of the clipboard.
          this.focusInput();
          break;
        }
        if (ctrl)
          // But we don't won't to redirect 'Ctrl + Ins' (copy to clipboard),
          // because giving focus to the input element would prevent it.
          break;
        // And there isn't really any point in redirecting 'Ins' or 'Alt+Ins'
        // so we won't bother.
        break;
      case 65:  // 'A'
        if (ctrl)
          // 'Ctrl + A' selects all, which should work in the output element.
          break;
        this.focusInput();        
        break;
      case 67:  // 'C'
        if (ctrl)
          // 'Ctrl + C' copies selected text into the clipboard.
          // Focusing the input element would prevent this.
          break;
        this.focusInput();        
        break;
      case 88:  // 'X'
      if (ctrl)
          // 'Ctrl + X' cuts selected text into the clipboard.
          // We don't want to do that in the input element if the
          // selection is elsewhere.
          break;
        this.focusInput();
        break; 

      // The rest of the key combinations are always redirected
      // to the input element.
      case 37:  // 'Left'
      case 38:  // 'Up'
      case 39:  // 'Right'      
      case 40:  // 'Down'
      case 86:  // 'V'
        // We want even 'Ctrl + V' to redirect to input element,
        // because it's the only place where it makes sense to
        // insert contents of the clipboard.
      case 89:  // 'Y'
      case 90:  // 'Z'
        // We give focus to the input elemet even for 'Ctrl + Z' (undo)
        // and 'Ctrl + Y' (redo) because it's the only place where undoing
        // or redoing makes sense.
      default:
        this.focusInput();
        break;
    }

    return true;
  }
}