/*
  Part of BrutusNEXT

  Implements svg component of map window
  (this is where the actual map is drawn).
*/

'use strict';

import {Component} from '../../../client/gui/component/Component';
import {MapWindow} from '../../../client/gui/component/MapWindow';
import {MapData} from '../../../client/gui/mapper/MapData';
import {RoomData} from '../../../client/gui/mapper/RoomData';
import {Coords} from '../../../shared/type/Coords';

import {ZoneGenerator} from '../mapper/ZoneGenerator';

import d3 = require('d3');

export class MapWindowSvgMap extends Component
{
  protected static get SVG_MAP_CSS_CLASS() { return 'SvgMap'; }
  protected static get SVG_ROOM_CSS_CLASS() { return 'SvgRoom'; }
  protected static get SVG_NONEXISTENT_ROOM_CSS_CLASS()
  {
    return 'SvgNonexistentRoom';
  }
  protected static get SVG_EXIT_CSS_CLASS()  { return 'SvgExit'; }

  // Distance between two rooms on X axis in pixels.
  private static get ROOM_SPACING() { return 20; }
  private static get ROOM_RADIUS() { return 6; }

  constructor(private mapWindow: MapWindow)
  {
    super();

    /// TEST:
    /* TO BE DEPRECATED */
    let zg = new ZoneGenerator();
    let world = zg.generateZone();

    ///this.mapData.addRoom(world['50']);
    
    /* TO BE DEPRECATED */
    for (let property in world)
    {
      this.mapData.addRoom(world[property]);
    }


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
    origZ: null,
    origMouseY: null
  }

  // --- d3 elements ---

  private d3MapSvg = null;
  private d3RoomsSvg = null;
  private d3ExitsSvg = null;
  private d3TagsSvg = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

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
    this.d3MapSvg = d3WindowContent.append('svg');
    this.d3MapSvg.attr('class', MapWindowSvgMap.SVG_MAP_CSS_CLASS);

    this.createDefs();
    this.createGs();
  }

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

  // Creates a triangular 'arrow' marker element that
  // can be attached to lines, paths, etc.
  private createArrowMarker(d3Defs)
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

  // Creates marker svg elements that can be attached to
  // lines, paths, etc.
  private createMarkerDefs(d3Defs)
  {
    // Create 'arrow' marker (a triangle).
    this.createArrowMarker(d3Defs);
  }

  // Creates a <defs> element and appends it to 'this.d3MapSvg'.
  private createDefs()
  {
    // Append a <defs> element to svg map element.
    let defs = this.d3MapSvg.append('defs');

    // 
    this.createMarkerDefs(defs);
  }

  // Creates container <g> elements and apppends them to 'this.d3MapSvg'.
  private createGs()
  {
    /*
      Note:
        Order of creating of following elements is
      important!
        Mouse events will prioritize the last inserted
      one, so 'this.d3RoomsSvg' must come last or the
      lines (representing exits) will steal mouse events
      from the rooms.
        It also determines drawing order.
    */

    // Container for exit svg elements.
    this.d3ExitsSvg = this.d3MapSvg.append('g');
    this.d3ExitsSvg.attr('id', 'exits');

    // Container for room svg elements.
    this.d3RoomsSvg = this.d3MapSvg.append('g');
    this.d3RoomsSvg.attr('id', 'rooms');

    // Text tags.
    this.d3TagsSvg = this.d3MapSvg.append('g');
    this.d3TagsSvg.attr('id', 'tags');
  }

  private getRoomTransform(d)
  {
    let x = this.getRoomXPos(d);
    let y = this.getRoomYPos(d);

    return 'translate(' + x + ',' + y + ')';
  }

  private createExitIcon(d3Room, points: string)
  {
    let d3ExitMarker = d3Room.append('polygon');

    d3ExitMarker.style('fill', 'yellow');
    d3ExitMarker.style('stroke', 'black');
    d3ExitMarker.style('stroke-width', 0.8);
    d3ExitMarker.attr('points', points);

    // Disable mouse interaction so the markers don't
    // prevent mouse-interacting with the room element.
    d3ExitMarker.attr('pointer-events', 'none');
  }

  private createVerticalExitIcons(d3Room)
  {
    let xOffset = 3 * MapWindowSvgMap.ROOM_RADIUS / 8;
    let yOffset = MapWindowSvgMap.ROOM_RADIUS / 2;
    /// Alternativa uprostřed místnosti - asi by to chtělo
    /// šipky trochu zmenšit, ale jinak to vypadá dobře
    /// (Nevýhoda: Nebyla by vidět ikonka místnosti).
    /*
    let xOffset = -MapWindowSvg.ROOM_RADIUS / 2;
    let yOffset = 0;
    */
    // Bottom left vertex.
    let x1 = 0 + xOffset;
    let y1 = 0 + yOffset;
    // Bottom right vertex.
    let x2 = MapWindowSvgMap.ROOM_RADIUS + xOffset;
    let y2 = 0 + yOffset;
    // Top vertex.
    let x3 = MapWindowSvgMap.ROOM_RADIUS / 2 + xOffset;
    let y3 = -3 * MapWindowSvgMap.ROOM_RADIUS / 2 + yOffset;

    let exitUpPoints =
              x1 + ',' + y1
      + ' ' + x2 + ',' + y2
      + ' ' + x3 + ',' + y3;

    let exitDownPoints =
              -x1 + ',' + -y1
      + ' ' + -x2 + ',' + -y2
      + ' ' + -x3 + ',' + -y3;

    this.createExitIcon(d3Room, exitUpPoints);
    this.createExitIcon(d3Room, exitDownPoints);
  }

  private getRoomIconCssClass(d)
  {
    if (d.exists)
      return MapWindowSvgMap.SVG_ROOM_CSS_CLASS;
    else
      return MapWindowSvgMap.SVG_NONEXISTENT_ROOM_CSS_CLASS;
  }

  private createRoomIcon(d3Room)
  {
    let d3Circle = d3Room.append('circle');

    d3Circle.attr('class', (d, i) => { return this.getRoomIconCssClass(d); });
    d3Circle.attr('r', MapWindowSvgMap.ROOM_RADIUS);
    /// TODO: Barva by měla záviset na terénu.
    d3Circle.attr('stroke', 'yellow');
  }

  private attachMouseoverHandlers(d3Room)
  {
    d3Room.on
    (
      'mouseover',
      function(d) { d3.select(this).classed('hover', true); }
    );

    d3Room.on
    (
      'mouseout',
      function(d) { d3.select(this).classed('hover', false); }
    );
  }

  private attachMousedownHandlers(d3Room)
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

  private attachRoomEventHandlers(d3Room)
  {
    // ---- Enable highlight on mouseover ----
    this.attachMouseoverHandlers(d3Room);
    
    // ---- Enable dragging ----
    this.attachMousedownHandlers(d3Room);
  }

  private createRoomElements(d3Enter)
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

  private createExitElements(d3Enter)
  {
    let d3Exits = d3Enter.append('line');
    d3Exits.attr('class', MapWindowSvgMap.SVG_EXIT_CSS_CLASS);
    /// TODO: Barva by měla záviset na terénu.
    d3Exits.style('stroke', 'yellow');
    d3Exits.style('stroke-opacity', '1.0');
    // Exit id is also used as respective svg element id.
    d3Exits.attr('id', function(d) { return d.id; });
    d3Exits.attr('x1', (d) => { return this.getFromRoomXPos(d) /* + 'px'; */ });
    d3Exits.attr('y1', (d) => { return this.getFromRoomYPos(d) /* + 'px'; */ });
    d3Exits.attr('x2', (d) => { return this.getToRoomXPos(d) /* + 'px'; */ });
    d3Exits.attr('y2', (d) => { return this.getToRoomYPos(d) /* + 'px'; */ });
  }

  private updateRoomElements(d3Rooms)
  {
    ///console.log('updateRoomElements()');
    d3Rooms.attr('transform', (d, i) => { return this.getRoomTransform(d); });
    /*
    d3Update.attr("cx", (d, i) => { return this.getRoomXPos(d) + 'pt'; });
    d3Update.attr("cy", (d, i) => { return this.getRoomYPos(d) + 'pt'; });
    */

    // Hide unexplored rooms, show explored ones.
    d3Rooms.style
    (
      'visibility',
      (d, i) => { return this.getRoomVisibility(d); }
    );
  }

  private updateExitElements(d3Exits)
  {
    d3Exits.attr('x1', (d) => { return this.getFromRoomXPos(d) /* + 'px'; */ });
    d3Exits.attr('y1', (d) => { return this.getFromRoomYPos(d) /* + 'px'; */ });
    d3Exits.attr('x2', (d) => { return this.getToRoomXPos(d) /* + 'px'; */ });
    d3Exits.attr('y2', (d) => { return this.getToRoomYPos(d) /* + 'px'; */ });
  }

  private renderRooms()
  {
    // We are going to manupulate all <g> elements inside
    // this.d3RoomsSvg.
    let d3RoomElements = this.d3RoomsSvg.selectAll('g');

    // Bind values of this.rooms hashmap directly to the respective
    // svg elements (so when the data changes, the next updateRooms()
    // will create a new svg elements for added values and remove svg
    // elements bound to removed values).
    let d3Rooms = d3RoomElements.data(this.mapData.getRoomsData());

    // Create svg elements for newly added rooms.
    this.createRoomElements(d3Rooms.enter());

    // Update existing elements.
    this.updateRoomElements(d3Rooms);

    // Remove elements of deleted rooms.
    d3Rooms.exit().remove();
  }

  private renderExits()
  {
    // We are going to manupulate all <path> elements inside
    // this.d3ExitsSvg.
    let d3ExitElements = this.d3ExitsSvg.selectAll('line');

    // Bind values of this.exits hashmap directly to the respective
    // svg elements (so when the data changes, the next updateExits()
    // will create a new svg elements for added values and remove svg
    // elements bound to removed values).
    let d3Exits = d3ExitElements.data(this.mapData.getExitsData());

    // Create svg elements for newly added exits.
    this.createExitElements(d3Exits.enter());

    // 'd3Exits' now contain elements that already existed
    // and need an update. Let's update them.
    this.updateExitElements(d3Exits);

    // Remove <path> elements for deleted exits.
    d3Exits.exit().remove();
  }

  // Updates position of svg elements corresponding to exits
  // leading from the room ('d' is data attached to that room).
  /// TODO: Nějak pořešit taky incomming jednosměrné exity.
  private updateRoomExits(d: MapData.RoomData)
  {
    let roomId = d.id;

    // 'exit' is an id of destination room.
    for (let exit in d.exits)
    {
      let destId = d.exits[exit].targetRoomId;
      let exitId = this.mapData.composeExitId(roomId, destId);

      this.updateExitElements(this.d3ExitsSvg.select('#' + exitId));
    }
  }

  // ------- plotting methods --------

  // -> Returns 'x' of origin of coordinate system within
  //    the map drawing area.
  private originX()
  {
    // Obtaining dimensions of svg element is complicated as hell,
    // so we 'cheat' a little bit and use the with of mapwindow content
    // element instead.
    return this.mapWindow.getContentWidth() / 2;
  }

  // -> Returns 'y' of origin of coordinate system within
  //    the map drawing area.
  private originY()
  {
    // Obtaining dimensions of svg element is complicated as hell,
    // so we 'cheat' a little bit and use the with of mapwindow content
    // element instead.
    return this.mapWindow.getContentHeight() / 2;
  }

  // -> Returns appropriate value of 'visibility' style
  //    of room svg element.
  private getRoomVisibility(d: RoomData)
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

  private getRoomXPos(d: any)
  {
    // 'd.coords' contains relative room coordinates.
    // (Room directly north of the room at [0, 0, 0] has
    //  cooords [0, 1, 0]).
    // 'x' and 'y' coords are always ordinary numbers
    //  (so the rooms always 'stick' to [x, y] grid),
    // 'z' coord can be a floating point number.
    let mudX = d.coords.x;

    // Transformation to currently centered room.
    let centeredMudX = mudX - this.coords.x;

    let xPos = centeredMudX * MapWindowSvgMap.ROOM_SPACING;

    // Transformation of origin from top left
    // (which is an origin point in svg elements)
    // to the middle of map area).
    return xPos + this.originX();
  }

  private getRoomYPos(d: any)
  {
    let mudY = d.coords.y;

    // Transformation to currently centered room.
    let centeredMudY = mudY - this.coords.y;

    // Projection of mud 'Y' axis to viewport 'y' axis.
    let yPos = centeredMudY * MapWindowSvgMap.ROOM_SPACING;

    // Transformation of origin from top left
    // (which is an origin point in svg elements)
    //  to the middle of map area and invert 'y' axis.
    return this.originY() - yPos;
  }

  private getFromRoomXPos(d: any)
  {
    let fromRoom = this.mapData.getRoomDataById(d.from);

    return this.getRoomXPos(fromRoom);
  }

  private getFromRoomYPos(d: any)
  {
    let fromRoom = this.mapData.getRoomDataById(d.from);

    return this.getRoomYPos(fromRoom);
  }

  private getToRoomXPos(d: any)
  {
    let toRoom = this.mapData.getRoomDataById(d.to);

    return this.getRoomXPos(toRoom);
  }

  private getToRoomYPos(d: any)
  {
    let toRoom = this.mapData.getRoomDataById(d.to);

    return this.getRoomYPos(toRoom);
  }

  // ---------------- Event handlers --------------------

  private onMouseMove(d, element)
  {
    let mouseY = d3.mouse(element)[1];
    let moveYDist = mouseY - this.roomDragData.origMouseY;

    // Change the 'z' coordinate (in MUD coords) of the room
    // (in data bound to the svg element).
    // Rate of change is 1.0 of 'z' cooordinate per 100 pixels moved.
    d.coords.z = this.roomDragData.origZ - moveYDist / 100;

    // Reflect the change in data we have just made in the map.
    // ('d' parameter is taken from the closure here).
    d3.select(element).attr('cy', (d) => { return this.getRoomYPos(d); });

    // Update adjacend exit lines.
    this.updateRoomExits(d);
  }

  private onRoomMouseDown(d, element)
  {
    // Remember original state in data bound to element.
    this.roomDragData.origZ = d.coords.z,
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
  }
}