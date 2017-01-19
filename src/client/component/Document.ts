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

    /*
    /// TODO: Tohle by se melo predavat nejak elegantneji.
    this.client.body.scrollView.webSocketDescriptor = this.webSocketDescriptor;

    this.webSocketDescriptor.connect();
    */

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

    // PgUp(33), PgDn(34).
    if (key === 33 || key === 34)
    {
      // This allows output of currently active scrollview
      // window to be scrolled by PgUp and PgDown even if
      // it doesn't have a focus.
      this.client.activeScrollView.triggerOutputEvent(event);
    }
    else
    {
      // All othe keys is redirected to input element
      // of currently active scrollview window.
      this.client.activeScrollView.focusInput();
    }

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