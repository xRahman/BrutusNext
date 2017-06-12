/*
  Part of BrutusNEXT

  Implements mapper window.
*/

'use strict';

import {Window} from '../../../client/gui/component/Window';
import {SvgMap} from '../../../client/gui/component/SvgMap';
import {Connection} from '../../../client/lib/connection/Connection';

/// TEST:
import {Packet} from '../../../shared/lib/protocol/Packet';

import $ = require('jquery');
import d3 = require('d3');

export class MapWindow extends Window
{
  constructor()
  {
    super();

    ///this.connection.mapWindow = this;
  }

  protected static get CSS_CLASS() { return 'MapWindow'; }
  protected static get CONTENT_CSS_CLASS() { return 'MapWindowContent'; }

  // Map is updated only after 'resize' event doesn't fire
  // for this period (in miliseconds).
  private static get RESIZE_UPDATE_DELAY() { return 10; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'mapwindow';

  //------------------ Private data ---------------------

  private svgMap = new SvgMap(this);

  // ----- timers ------

  // Prevents map updating until MapWindow.RESIZE_UPDATE_DELAY
  // miliseconds after last 'window.resize' event.
  private resizeTimeout = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getMapSvgId() { return this.id + '_mapsvg'; }

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create();

    // MapWindow uses css class .MapWindow along with .Window.
    this.$window.addClass(MapWindow.CSS_CLASS);

    this.$window.resize
    (
      (event) => { this.onResize(event); }
    );

    /// TEST
    this.setTitle('Dragonhelm Mountains');

    return this.$window;
  }

  // ~ Overrides Window.onDocumentReady().
  // Executes when html document is fully loaded.
  public onDocumentReady()
  {
    this.updateMap();
  }

  // ~ Overrides Window.onDocumentResize().
  // Executes when html document is resized
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

  // --- Element-generating methods ---

  // ~ Overrides Window.createContentElement().
  // -> Returns created html element.
  protected createContent()
  {
    let $content = super.createContent();

    // MapWindow content uses css class .MapWindowContent along with
    // .WindowContent.
    $content.addClass(MapWindow.CONTENT_CSS_CLASS);

    // Create map svg element in a '$content' element
    this.svgMap.create(this.getMapSvgId(), $content);

    return $content;
  }

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