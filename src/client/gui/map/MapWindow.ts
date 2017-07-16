/*
  Part of BrutusNEXT

  Map window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {TitledWindow} from '../../../client/gui/TitledWindow';
import {SvgMap} from '../../../client/gui/map/SvgMap';
import {Connection} from '../../../client/lib/net/Connection';

/// TEST:
import {Packet} from '../../../shared/lib/protocol/Packet';

///import $ = require('jquery');
///import d3 = require('d3');

export class MapWindow extends TitledWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.IN_GAME);
  }

  protected static get S_CSS_CLASS()
    { return 'S_MapWindow'; }

  // Map is updated only after 'resize' event doesn't fire
  // for this period (in miliseconds).
  private static get RESIZE_UPDATE_DELAY() { return 10; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private svgMap = new SvgMap(this);

  // Prevents map updating until MapWindow.RESIZE_UPDATE_DELAY
  // miliseconds after last 'window.resize' event.
  private resizeTimeout = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides GameWindow.create().
  public create()
  {
    super.create({ name: 'map_window', sCssClass: MapWindow.S_CSS_CLASS });

    this.$window.resize
    (
      (event) => { this.onResize(event); }
    );

    /// TEST
    this.setTitle('Dragonhelm Mountains');

    this.svgMap.create(this.$content);

    return this.$window;
  }

  // ~ Overrides Window.onDocumentReady().
  //  (Executes when html document is fully loaded.)
  public onDocumentReady()
  {
    this.updateMap();
  }

  // ~ Overrides Window.onDocumentResize().
  //  (Executes when html document is resized.)
  public onDocumentResize()
  {
    clearTimeout(this.resizeTimeout);

    this.resizeTimeout = setTimeout
    (
      // 'updateMap()' will only be called MapWindow.RESIZE_UPDATE_DELAY
      // miliseconds after the last 'window.resize' event fired.
      () => { this.updateMap(); },
      MapWindow.RESIZE_UPDATE_DELAY
    );
  }

  public getContentWidth()
  {
    return this.$content.width();
  }

  public getContentHeight()
  {
    return this.$content.height();
  }

  /*
  /// TEST
  public send(packet: Packet)
  {
    this.connection.send(packet);
  }
  */

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // Adds or removes svg elements in the map to match
  // changes in bound data.
  private updateMap()
  {
    this.svgMap.render();
  }

  /*
  private createMap($ancestor: JQuery)
  {
    // Select ancestor element using d3 library.
    // (Doing [0] on a jquery element accesses the DOM element.
    //  We do it instead of selecting ancetor element by it's
    //  id because ancestor element is not yet appended to the
    //  document at this time - so we need to use direct reference.)
    let d3WindowContent = d3.select($ancestor[0]);

    // Append a svg element that will be used to draw map in.
    this.d3MapSvg = d3WindowContent.append('svg');
    this.d3MapSvg.attr('class', MapWindow.SVG_MAP_CSS_CLASS);

    this.createSvgDefs();

    /// svg filter test
    ///this.d3MapSvg.attr('enable-background', 'new');
    ///this.appendFilters(this.d3MapSvg);

      // Note:
      //   Order of creating of following elements is
      // important!
      //   Mouse events will prioritize the last inserted
      // one, so 'this.d3RoomsSvg' must come last or the
      // lines (representing exits) will steal mouse events
      // from the rooms.

    // Text tags.
    //this.d3TagsSvg = this.d3MapSvg.append('g');

    // Container for exit svg elements.
    this.d3ExitsSvg = this.d3MapSvg.append('g');

    // Container for room svg elements.
    this.d3RoomsSvg = this.d3MapSvg.append('g');
  }
  */

  // ---------------- Event handlers --------------------

  private onResize(event: Event)
  {
    ///console.log('onResize()');
    this.updateMap();
  }
}