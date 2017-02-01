/*
  Part of BrutusNEXT

  Implements functionality attached directly to html document
  ('document' is a global variable).
*/

'use strict';

import Client = require('../Client');

import $ = require('jquery');

class Document
{
  constructor(private client: Client)
  {
    // Attach handler for 'documentready' event.
    $(document).ready
    (
      () => { this.onDocumentReady(); }
    );
  }

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // ---------------- Private methods -------------------

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
  }

  // Handles 'keydown' event.
  private onKeyDown(event: JQueryKeyEventObject)
  {
    let key = event.which;
    let alt = event.altKey;
    let ctrl = event.ctrlKey;
    let shift = event.shiftKey;

    console.log('onKeyDown(): ' + key);

    /*
      Note on shortcuts:
    
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

        We give focus to the input elemet, because it's the only one when
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

        This doesn't make sense in the output.
        ///

      'Ctrl + Home' -- to the top
      'Ctrl + End' -- to the bottom

      /// (nechat)

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

        /// Presmerovavat (asi jo, v outputu neni kurzor)

      'Esc'

        /// nejspíš nechat - ono to teda nic nedělá, ale kdyby dělalo, tak
        /// by to mělo dělat tam, kde je focus
    */

    

    switch (key)
    {
      case 16:  // Shift
      case 17:  // Ctrl
      case 18:  // Alt
        // Control keys do not give focus to the input
        // element because it would prevent copying and
        // pasting of text.
        break;

      case 33:  // PgUp
      case 34:  // PgDn
        // This allows output of currently active scrollview
        // window to be scrolled by PgUp and PgDown even if
        // it doesn't have a focus.
        this.client.activeScrollView.triggerOutputEvent(event);
        break;

      case 45:  // Ins
      case 46:  // Del

      case 67:  // C      
        if (ctrl)
          // 'Ctrl + C' copies selected text into the clipboard.
          // Focusing the input element would prevent this.
          break;
        
      
      default:
        // All othe keys is redirected to input element
        // of currently active scrollview window.
        this.client.activeScrollView.focusInput();
        break;
    }
    /*
    // PgUp (33), PgDn (34).
    if (key === 33 || key === 34)
    {
      // This allows output of currently active scrollview
      // window to be scrolled by PgUp and PgDown even if
      // it doesn't have a focus.
      this.client.activeScrollView.triggerOutputEvent(event);
    }
    else
    {
      console.log('onKeyDown(): ' + key);

      // All othe keys is redirected to input element
      // of currently active scrollview window.
      this.client.activeScrollView.focusInput();
    }
    */
    

    /*
    // PgUp(33), PgDn(34), End(35), Home(36),
    // Left(37), Up(38), Right(39), Down(40)
    if(key >= 33 && key <= 40)
    {
      if (!this.client.activeScrollView.inputHasFocus())
      {
        // Prevent default scrolling by keyboard
        // (for all elements with scrollbar).
        event.preventDefault();

        // Scroll the scrollview output manually.
        this.client.activeScrollView.keyboardScroll(key);
        return false;
      }
    }
    */
    return true;
  }
}

export = Document;