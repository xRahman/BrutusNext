/*
  Part of BrutusNEXT

  Implements svg component of map window
  (this is where the actual map is drawn).
*/

'use strict';

import {Coords} from '../../../shared/type/Coords';
import {Component} from '../../../client/gui/component/Component';
import {MapWindow} from '../../../client/gui/component/MapWindow';
import {MapData} from '../../../client/gui/mapper/MapData';
import {ExitRenderData} from '../../../client/gui/mapper/ExitRenderData';
import {RoomRenderData} from '../../../client/gui/mapper/RoomRenderData';

import d3 = require('d3');
type d3Selection = d3.Selection<any, any, HTMLElement, any>;

export class SvgMap extends Component
{
  protected static get SVG_MAP_CSS_CLASS() { return 'SvgMap'; }
  protected static get SVG_ROOM_CSS_CLASS() { return 'SvgRoom'; }
  protected static get SVG_NONEXISTENT_ROOM_CSS_CLASS()
  {
    return 'SvgNonexistentRoom';
  }
  protected static get SVG_EXIT_CSS_CLASS()  { return 'SvgExit'; }
  protected static get SVG_VERTICAL_EXIT_CSS_CLASS()
  {
    return 'SvgVerticalExit';
  }

  // Distance between two rooms on X axis.
  private static get ROOM_SPACING() { return 20; }
  private static get ROOM_RADIUS() { return 6; }

  constructor(private mapWindow: MapWindow)
  {
    super();

    /// TEST:
    /* TO BE DEPRECATED */
    ///let zg = new ZoneGenerator();
    ///let world = zg.generateZone();

    ///this.mapData.addRoom(world['50']);
    
    /* TO BE DEPRECATED */
    /*
    for (let property in world)
    {
      this.mapData.setRoom(world[property]);
    }
    */
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private editMode = true;

  private mapData = new MapData();

  // Coordinates of currently centered room.
  private coords = new Coords();

  // Stores room 'z' position and mouse 'y' position
  // when dragging of a room starts.
  private roomDragData =
  {
    origCoords: null,
    origMouseX: null,
    origMouseY: null
  }

  // --- d3 elements ---

  private d3Map = null;
  private d3Rooms = null;
  private d3Exits = null;
  private d3Tags = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

//.
  // Creates map svg element in '$ancestor' element.
  public create(id: string, $ancestor: JQuery)
  {
    this.id = id;

    // Select ancestor element using d3 library.
    // (Doing [0] on a jquery element accesses the DOM element.
    //  We do it instead of selecting ancetor element by it's
    //  id because ancestor element is not yet appended to the
    //  document at this time - so we need to use direct reference.)
    let d3WindowContent = d3.select($ancestor[0]);

    // Append a svg element that will be used to draw map in.
    this.d3Map = d3WindowContent.append('svg');
    this.d3Map.attr('class', SvgMap.SVG_MAP_CSS_CLASS);

    // Create a <defs> element inside a <svg> element.
    this.createDefs();
    // Create <g> elements that will contain the graphical elements.
    this.createGs();
  }

//.
  // Adds, removes or repositions svg elements in the map
  // to match changes in bound data.
  public render()
  {
    this.renderRooms();
    this.renderExits();
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  /*
  private appendFilters(d3MapSvg)
  {
    // Filters go in <defs> element (which should be in a root <svg> element).
    let defs = d3MapSvg.append('defs');

    let filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("filterUnits", "userSpaceOnUse")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 4)
        .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 4)
        .attr("dy", 4)
        .attr("result", "offsetBlur");

    let specular = filter.append("feSpecularLighting")
        .attr("in", "blur")
        .attr("surfaceScale", 5)
        .attr("specularConstant", .75)
        .attr("specularExponent", 20)
        .attr("lighting-color", "rgb(187,187,187)")
        .attr("result", "specOut");

    specular.append("fePointLight")
        .attr("x", -5000)
        .attr("y", -10000)
        .attr("z", 20000);

    filter.append("feComposite")
        .attr("in", "specOut")
        .attr("in2", "SourceAlpha")
        .attr("operator", "in")
        .attr("result", "specOut");

    filter.append("feComposite")
        .attr("in", "SourceGraphic")
        .attr("in2", "specOut")
        .attr("operator", "arithmetic")
        .attr("k1", "0")
        .attr("k2", "1")
        .attr("k3", "1")
        .attr("k4", "0")
        .attr("result", "litPaint");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "litPaint");
  }
  */

//.
  // Creates a triangular 'arrow' marker element that
  // can be attached to lines, paths, etc.
  private createArrowMarker(d3Defs: d3Selection)
  {
    let MARKER_SIZE = 2;

    let d3ExitArrowMarker = d3Defs.append('marker');

    d3ExitArrowMarker.attr('id', 'exitArrowMarker');
    d3ExitArrowMarker.attr('markerWidth', MARKER_SIZE);
    d3ExitArrowMarker.attr('markerHeight', MARKER_SIZE);
    // Reference point (origin point that will be transformed).
    d3ExitArrowMarker.attr('refX', 1);
    d3ExitArrowMarker.attr('refY', 1);
    // Match the direction of line or path.
    d3ExitArrowMarker.attr('orient', 'auto');
    d3ExitArrowMarker.attr('markerUnits', 'strokeWidth');

    let d3Triangle = d3ExitArrowMarker.append('path');
    d3Triangle.style('fill', 'rgb(0,0,255)');

    let drawCmd = 'M 0,0 L 2,1 L 0,2 Z';

    d3Triangle.attr('d', drawCmd);
  }

//.
  // Creates marker svg elements that can be attached to
  // lines, paths, etc.
  private createMarkerDefs(d3Defs: d3Selection)
  {
    // Create 'arrow' marker (a triangle).
    this.createArrowMarker(d3Defs);
  }

//.
  // Creates a <defs> element and appends it to 'this.d3MapSvg'.
  private createDefs()
  {
    // Append a <defs> element to svg map element.
    let defs = this.d3Map.append('defs');

    this.createMarkerDefs(defs);
  }

//.
  // Creates container <g> elements and apppends them to 'this.d3MapSvg'.
  private createGs()
  {
    // Order of creating of following elements is important!
    //   Mouse events will prioritize the last inserted
    // one, so 'this.d3RoomsSvg' must come last or the
    // lines (representing exits) will steal mouse events
    // from the rooms.
    //   It also determines drawing order.

    // Container for exit svg elements.
    this.d3Exits = this.d3Map.append('g');
    this.d3Exits.attr('id', 'exits');

    // Container for room svg elements.
    this.d3Rooms = this.d3Map.append('g');
    this.d3Rooms.attr('id', 'rooms');

    // Text tags.
    this.d3Tags = this.d3Map.append('g');
    this.d3Tags.attr('id', 'tags');
  }

//.
  private getRoomTransform(d: RoomRenderData)
  {
    let x = this.getRoomXPos(d);
    let y = this.getRoomYPos(d);

    return 'translate(' + x + ',' + y + ')';
  }

  private getVerticalExitVisibility(d: RoomRenderData, direction: string)
  {
    if (d.hasExit(direction))
      return 'visible';
    else
      return 'hidden';
  }

//.
  private createExitIcon
  (
    d3Room: d3Selection,
    points: string,
    direction: string
  )
  {
    let d3ExitIcon = d3Room.append('polygon');

    d3ExitIcon.attr('class', SvgMap.SVG_VERTICAL_EXIT_CSS_CLASS);

    /// TODO: Barva by měla záviset na terénu.
    d3ExitIcon.style('fill', 'yellow');
    /// (a barva borderu asi taky, aby to bylo vzájemně kontrastní)
    d3ExitIcon.style('stroke', 'black');

    // Svg <polygon> geometry.
    d3ExitIcon.attr('points', points);

    // Disable mouse interaction so the markers don't
    // prevent mouse-interacting with the room element.
    d3ExitIcon.attr('pointer-events', 'none');

    // Hide exit icon if the room doesn't have an exit in that direction.
    d3ExitIcon.style
    (
      'visibility',
      (d, i) => { return this.getVerticalExitVisibility(d, direction); }
    );
  }

//.
  private createVerticalExitIcons(d3Room: d3Selection)
  {
    /// Alternativa uprostřed místnosti - asi by to chtělo
    /// šipky trochu zmenšit, ale jinak to vypadá dobře
    /// (Nevýhoda: Nebyla by vidět ikonka místnosti).
    /// let xOffset = -MapWindowSvg.ROOM_RADIUS / 2;
    /// let yOffset = 0;
    let xOffset = 3 * SvgMap.ROOM_RADIUS / 8;
    let yOffset = SvgMap.ROOM_RADIUS / 2;
    // Bottom left vertex.
    let x1 = 0 + xOffset;
    let y1 = 0 + yOffset;
    // Bottom right vertex.
    let x2 = SvgMap.ROOM_RADIUS + xOffset;
    let y2 = 0 + yOffset;
    // Top vertex.
    let x3 = SvgMap.ROOM_RADIUS / 2 + xOffset;
    let y3 = -3 * SvgMap.ROOM_RADIUS / 2 + yOffset;

    let exitUpPoints =
              x1 + ',' + y1
      + ' ' + x2 + ',' + y2
      + ' ' + x3 + ',' + y3;

    let exitDownPoints =
              -x1 + ',' + -y1
      + ' ' + -x2 + ',' + -y2
      + ' ' + -x3 + ',' + -y3;

    this.createExitIcon(d3Room, exitUpPoints, 'u');
    this.createExitIcon(d3Room, exitDownPoints, 'd');
  }

//.
  private getRoomIconCssClass(d: RoomRenderData)
  {
    if (d.exists)
      return SvgMap.SVG_ROOM_CSS_CLASS;
    else
      return SvgMap.SVG_NONEXISTENT_ROOM_CSS_CLASS;
  }

//.
  private createRoomIcon(d3Room: d3Selection)
  {
    let d3Circle = d3Room.append('circle');

    d3Circle.attr('class', (d, i) => { return this.getRoomIconCssClass(d); });
    d3Circle.attr('r', SvgMap.ROOM_RADIUS);
    /// TODO: Barva by měla záviset na terénu.
    d3Circle.attr('stroke', 'yellow');
  }

//.
  private attachMouseOverHandlers(d3Room: d3Selection)
  {
    d3Room.on
    (
      'mouseover',
      function(d) { d3.select(this).classed('hover', true); }
      ///function(d) { console.log('mouseover: ' + $(this).attr('id')); d3.select(this).classed('hover', true); }
    );

    d3Room.on
    (
      'mouseout',
      function(d) { d3.select(this).classed('hover', false); }
    );
  }

//.
  private attachMouseDownHandlers(d3Room: d3Selection)
  {
    // To handle 'mousedown' event, we have to pass both
    // javascript 'this' (which is the element on which
    // the event fired) and typesctipt 'this' (which is
    // the instance of MapWindow class). To do that, we
    // must remember 'this' in a variable so we can pass
    // it through closure.
    let mapWindowSvg = this;

    d3Room.on
    (
      'mousedown',
      function(d)
      {
        // 'this' is the room SVG element.
        // 'mapWindow' is the local variable we remembered
        // earlier. It is available thanks to closure.
        mapWindowSvg.onRoomMouseDown(d, this);
      }
    );
  }

  private attachMouseUpHandlers(d3Room: d3Selection)
  {
    // To handle 'mouseup' event, we have to pass both
    // javascript 'this' (which is the element on which
    // the event fired) and typesctipt 'this' (which is
    // the instance of MapWindow class). To do that, we
    // must remember 'this' in a variable so we can pass
    // it through closure.
    let mapWindowSvg = this;

    d3Room.on
    (
      'mouseup',
      function(d)
      {
        // 'this' is the room SVG element.
        // 'mapWindow' is the local variable we remembered
        // earlier. It is available thanks to closure.
        mapWindowSvg.onRoomMouseUp(d, this);
      }
    );
  }

//.
  private attachRoomEventHandlers(d3Room: d3Selection)
  {
    // ---- Enable highlight on mouseover ----
    this.attachMouseOverHandlers(d3Room);
    
    // ---- Enable dragging ----
    this.attachMouseDownHandlers(d3Room);
    this.attachMouseUpHandlers(d3Room);
  }

//.
  private createRoomElements(d3Enter: d3Selection)
  {
    // Create container <g> element.
    let d3Room = d3Enter.append('g');
    d3Room.attr('transform', (d, i) => { return this.getRoomTransform(d); });

    this.createRoomIcon(d3Room);
    this.createVerticalExitIcons(d3Room);

    // ----------------- test -----------------------------

    // Assign filter with id 'drop-shadow' (which we have created
    // earlied using this.appendFilters() method).
    ///d3Rooms.style("filter", "url(#drop-shadow)");

    /*
    let d3Arrow = d3Room.append('line')
    d3Arrow.style('stroke', 'green');
    d3Arrow.style('stroke-width', 1.5);
    ///d3Arrow.style('stroke-opacity', '1.0');

    d3Arrow.attr('x1', '6px');
    d3Arrow.attr('y1', '5px');
    d3Arrow.attr('x2', '6px');
    d3Arrow.attr('y2', '-5px');
    d3Arrow.attr('marker-end', 'url(#exitArrowMarker)');
    */

    // ----------------- /test ----------------------------

    // ---- Hide unexplored and nonexistent rooms if not in edit mode ----
    d3Room.style
    (
      'visibility',
      (d, i) => { return this.getRoomVisibility(d); }
    );

    this.attachRoomEventHandlers(d3Room);
  }

//.
  private createExitElements(d3Enter: d3Selection)
  {
    let d3Exits = d3Enter.append('line');
    d3Exits.attr('class', SvgMap.SVG_EXIT_CSS_CLASS);
    /// TODO: Barva by měla záviset na terénu.
    d3Exits.style('stroke', 'yellow');
    d3Exits.style('stroke-opacity', '1.0');
    // Exit id is also used as respective svg element id.
    d3Exits.attr('id', function(d) { return d.id; });
    d3Exits.attr('x1', (d) => { return this.getFromXPos(d); });
    d3Exits.attr('y1', (d) => { return this.getFromYPos(d); });
    d3Exits.attr('x2', (d) => { return this.getToXPos(d); });
    d3Exits.attr('y2', (d) => { return this.getToYPos(d); });
  }

//.
  private updateRoomElements(d3Rooms: d3Selection)
  {
    ///console.log('updateRoomElements()');
    d3Rooms.attr('transform', (d, i) => { return this.getRoomTransform(d); });

    // Hide unexplored rooms, show explored ones.
    d3Rooms.style
    (
      'visibility',
      (d, i) => { return this.getRoomVisibility(d); }
    );
  }

//.
  private updateExitElements(d3Exits: d3Selection)
  {
    d3Exits.attr('x1', (d) => { return this.getFromXPos(d); });
    d3Exits.attr('y1', (d) => { return this.getFromYPos(d); });
    d3Exits.attr('x2', (d) => { return this.getToXPos(d); });
    d3Exits.attr('y2', (d) => { return this.getToYPos(d); });
  }

//.
  private renderRooms()
  {
    // We are going to manupulate all <g> elements inside
    // this.d3RoomsSvg.
    let d3RoomElements = this.d3Rooms.selectAll('g');

    // Bind values of this.rooms hashmap directly to the respective
    // svg elements (so when the data changes, the next updateRooms()
    // will create a new svg elements for added values and remove svg
    // elements bound to removed values).
    let d3Rooms = d3RoomElements.data(this.mapData.getRoomsRenderData());

    // Create svg elements for newly added rooms.
    this.createRoomElements(d3Rooms.enter());

    // Update existing elements.
    this.updateRoomElements(d3Rooms);

    // Remove elements of deleted rooms.
    d3Rooms.exit().remove();
  }

//.
  private renderExits()
  {
    // We are going to manupulate all <path> elements inside
    // this.d3ExitsSvg.
    let d3ExitElements = this.d3Exits.selectAll('line');

    // Bind values of this.exits hashmap directly to the respective
    // svg elements (so when the data changes, the next updateExits()
    // will create a new svg elements for added values and remove svg
    // elements bound to removed values).
    let d3Exits = d3ExitElements.data(this.mapData.getExitsRenderData());

    // Create svg elements for newly added exits.
    this.createExitElements(d3Exits.enter());

    // 'd3Exits' now contain elements that already existed
    // and need an update. Let's update them.
    this.updateExitElements(d3Exits);

    // Remove <path> elements for deleted exits.
    d3Exits.exit().remove();
  }

  /*
  // Updates position of svg elements corresponding to exits
  // leading from the room ('d' is data attached to that room).
  /// TODO: Nějak pořešit taky incomming jednosměrné exity.
  /// - Ty se pořešej samy - tím, že zkonstruuju idčka exitů
  ///   do všech možných směrů a zaadresuju jimi do renderovací
  ///   mapy, se dostanu i na jednosměrné exity.
  private updateRoomExits(d: RoomRenderData)
  {
    let roomId = d.getId();

    /// TODO: Projít všechny možné směry, nejen ty, do kterých z roomy
    /// vedou exity (protože potřebuju najít jednosměrné exity z okolních
    /// room.

    /// Respektive jinak - má tohle vůbec ještě smysl? Exity jsou na gridu,
    /// takže měnit, kam se kreslej příslušné čáry, asi není proč.
    /// - má smysl maximálně tak exity rušit/přidávat, případně dělat
    ///   z jednosměrných obousměrné a naopak.

    // 'exit' is an id of destination room.
    for (let exit in d.exits)
    {
      let destId = d.exits[exit].targetRoomId;
      let exitId = this.mapData.composeExitId(roomId, destId);

      this.updateExitElements(this.d3Exits.select('#' + exitId));
    }
  }
  */

  // ------- plotting methods --------

//.
  // -> Returns 'x' of origin of coordinate system within
  //    the map drawing area.
  private originX()
  {
    // Obtaining dimensions of svg element is complicated as hell,
    // so we 'cheat' a little bit and use the with of mapwindow content
    // element instead.
    return this.mapWindow.getContentWidth() / 2;
  }

//.
  // -> Returns 'y' of origin of coordinate system within
  //    the map drawing area.
  private originY()
  {
    // Obtaining dimensions of svg element is complicated as hell,
    // so we 'cheat' a little bit and use the with of mapwindow content
    // element instead.
    return this.mapWindow.getContentHeight() / 2;
  }

//.
  // -> Returns appropriate value of 'visibility' style
  //    of room svg element.
  private getRoomVisibility(d: RoomRenderData)
  {
    // In edit mode, rooms are always visible
    // (so they can be visible).
    if (this.editMode === true)
      return 'visible';

    if (d.explored === true && d.exists === true)
      return 'visible';

    // Hide unexplored and nonexistent rooms.
    return 'hidden';
  }

//.
  private getXPos(coords: Coords)
  {
    // Transformation to currently centered room.
    let s = coords.s - this.coords.s;

    // Transformation from mud coordinates to svg coordinates.
    let xPos = s * SvgMap.ROOM_SPACING;

    // Transformation of origin from top left (which is the
    // origin in svg elements) to the middle of map area.
    return xPos + this.originX();
  }

//.
  private getRoomXPos(d: RoomRenderData)
  {
    return this.getXPos(d.coords);
  }

//.
  private getYPos(coords: Coords)
  {
    // Transformation to currently centered room.
    let centeredMudY = coords.e - this.coords.e;

    // Transformation from mud coordinates to svg coordinates.
    let y = centeredMudY * SvgMap.ROOM_SPACING;

    // Transformation of origin from top left (which is the
    // origin in svg elements) to the middle of map area.
    return y + this.originY();
  }

//.
  private getRoomYPos(d: RoomRenderData)
  {
    return this.getYPos(d.coords);
  }

//.
  private getFromXPos(d: ExitRenderData)
  {
    return this.getXPos(d.from);
  }

//.
  private getFromYPos(d: ExitRenderData)
  {
    return this.getYPos(d.from);
  }

//.
  private getToXPos(d: ExitRenderData)
  {
    return this.getXPos(d.to);
  }

//.
  private getToYPos(d: ExitRenderData)
  {
    return this.getYPos(d.to);
  }

  // ---------------- Event handlers --------------------

//.
  private onMouseMove(d: RoomRenderData, element: HTMLElement)
  {
    /*
    let mouseY = d3.mouse(element)[1];
    let moveYDist = mouseY - this.roomDragData.origMouseY;

    // Change the 'z' coordinate (in MUD coords) of the room
    // (in data bound to the svg element).
    // Rate of change is 1.0 of 'z' cooordinate per 100 pixels moved.
    d.coords.u = this.roomDragData.origCoords - moveYDist / 100;

    // Reflect the change in data we have just made in the map.
    // ('d' parameter is taken from the closure here).
    d3.select(element).attr('cy', (d) => { return this.getRoomYPos(d); });

    // Update adjacend exit lines.
    this.updateRoomExits(d);
    */
  }

//.
  private onRoomMouseDown(d: RoomRenderData, element: HTMLElement)
  {
    console.log('onRoomMouseDown(): ' + d.getId());

    // Remember coordinates of room where dragging started.
    this.roomDragData.origCoords = d.coords;

    /*
    // Remember original state in data bound to element.
    this.roomDragData.origCoords = d.coords,
    this.roomDragData.origMouseX = d3.mouse(element)[0];
    this.roomDragData.origMouseY = d3.mouse(element)[1];

    // Disable text dragging and selection.
    d3.event.preventDefault();

    // 'mousemove' and 'mouseup' events need to be
    // attached to 'window', not the SVG element.
    let wnd = d3.select(window);

    wnd.on
    (
      'mousemove',
      // 'd' and 'elements' parameters are taken from
      // the closure.
      () => { this.onMouseMove(d, element); }
    );

    wnd.on
    (
      'mouseup',
      function()
      {
        // Detach 'mousemove' and 'mouseup' event handlers
        // from 'window'.
        wnd.on('mousemove', null).on('mouseup', null);
      }
    );
    */
  }

  private onRoomMouseUp(d: RoomRenderData, element: HTMLElement)
  {
    console.log('onRoomMouseUp(): ' + d.getId());

    if (this.roomDragData.origCoords !== null)
    {
      this.mapData.connect(this.roomDragData.origCoords, d.coords);
      this.renderExits();
    }

    this.roomDragData.origCoords = null;
  }
}