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

      console.log('document.keydown ' + key);

      // PgUp(33), PgDn(34), End(35), Home(36),
      // Left(37), Up(38), Right(39), Down(40)
      if(key >= 33 && key <= 40)
      {
        console.log('preventing default action');
        event.preventDefault();
        return false;
      }
      return true;
  }
}

export = Document;