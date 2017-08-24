/*
  Part of BrutusNEXT

  Functionality attached directly to html 'document'.
*/

'use strict';

import {ClientApp} from '../../client/lib/app/ClientApp';
import {Windows} from '../../client/gui/window/Windows';

import $ = require('jquery');

export class Document
{
  constructor()
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

  // ----------------- Private data ---------------------

  // Jquery <body> element.
  private $body = $('#body');

  // --------------- Static accessors -------------------

  public static get $body() { return ClientApp.document.$body; }

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

    ClientApp.onDocumentReady();
  }

  private onDocumentResize()
  {
    Windows.onDocumentResize();
  }

  // Handles 'keydown' event.
  private onKeyDown(event: JQueryKeyEventObject)
  {
    if (Windows.activeStandaloneWindow)
    {
      Windows.activeStandaloneWindow.onKeyDown(event);
      return;
    }

    if (ClientApp.state === ClientApp.State.IN_GAME)
      Windows.activeScrollWindow.onKeyDown(event);

    // TODO: zbytek přesunout nejspíš do ScrollWindow
    // (Nebo do něčeho, co bude řešit ClientApp.State.IN_GAME).
  }
}