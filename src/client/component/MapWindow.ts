/*
  Part of BrutusNEXT

  Implements mapper window.
*/

'use strict';

import {Window} from '../component/Window';
import {Connection} from '../connection/Connection';

import {ZoneGenerator} from '../mapper/ZoneGenerator';

import $ = require('jquery');
import d3 = require('d3');

// Projection angle (deviation from 'y' axis).
const angle = Math.PI / 8;
///let angle = 3 * Math.PI / 16;

// Shortening factor of virtual 'y' axis.
const shorten = Math.cos(angle);
//let shorten = 0.6;

// Shortening factors projected to viewport cooordinates.
const dx = Math.sin(angle) * shorten;
const dy = Math.cos(angle) * shorten;

export class MapWindow extends Window
{
  constructor(private connection: Connection)
  {
    super();

    this.connection.mapWindow = this;

    /// TEST:
    let zg = new ZoneGenerator();
    let world = zg.generateZone();

    for (let property in world)
    {
      // Build room data.
      this.rooms.set(property, world[property]);

      // Add exits of this room to this.exits.
      this.addRoomExits(property, world[property]);
    }
  }

  public static get CSS_CLASS() { return 'MapWindow'; }
  public static get CONTENT_CSS_CLASS() { return 'MapWindowContent'; }
  public static get SVG_MAP_CSS_CLASS() { return 'SvgMap'; }
  public static get SVG_ROOM_CSS_CLASS() { return 'SvgRoom'; }

  // Distance between two rooms on X axis in pixels.
  private static get ROOM_SPACING() { return 30; }

  // Map is updated only after 'resize' event doesn't fire
  // for this period (in miliseconds).
  private static get RESIZE_UPDATE_DELAY() { return 10; }

  private static get 

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'mapwindow';

  //------------------ Private data ---------------------

  private rooms = new Map();
  private exits = new Map();

  // Coordinates of currently centered room
  // (in mud world coords - distance between
  //  adjacent rooms is 1).
  private coords =
  {
    x: 0,
    y: 0,
    z: 0
  }

  // Stores room 'z' position and mouse 'y' position
  // when dragging of a room starts.
  private roomDragData =
  {
    origZ: null,
    origMouseY: null
  }

  ///private roomData = null;

  // ----- timers ------

  // Prevents map updating until MapWindow.RESIZE_UPDATE_DELAY
  // miliseconds after last 'window.resize' event.
  private resizeTimeout = null;

  // --- d3 elements ---

  private d3MapSvg = null;
  private d3RoomsSvg = null;
  private d3ExitsSvg = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create();

    // ScrollView window uses css class .ScrollView along with .Window.
    this.$window.addClass(MapWindow.CSS_CLASS);

    this.$window.resize
    (
      (event) => { this.onResize(event); }
    );

    this.setTitle('Dragonhelm Mountains');

    return this.$window;
  }

  // Adds or removes svg elements in the map to match
  // changes in respective data.
  /// TODO: Specifikovat, co jsou 'respective data'.
  public updateMap()
  {
    this.updateRooms();
    this.updateExits();
  }

  // Executes when html document is fully loaded.
  // (Overrides Window.onDocumentReady()).
  public onDocumentReady()
  {
    this.updateMap();
  }

  // Executes when html document is resized
  // (Overrides Window.onDocumentResize()).
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

  // --------------- Protected methods ------------------

  // --- Element-generating methods ---

  // Overrides Window.createContentElement().
  // -> Returns created html element.
  protected createContent()
  {
    let $content = super.createContent();

    // ScrollView content uses css class .ScrollViewContent along with
    // .WindowContent.
    $content.addClass(MapWindow.CONTENT_CSS_CLASS);

    /*
    // Create html element 'input'.
    let $input = this.input.create(this.getInputId());
    // Put it in the 'content' element.
    $content.append($input);
    */

    this.createMap($content);

    return $content;
  }

  // ---------------- Private methods -------------------

  // Adds exits of given room to 'this.exits' array.
  private addRoomExits(roomId: string, room: any)
  {
    let exits = [];

    if (room.exits['north'])
      exits.push({ id: room.exits['north'], opacity: 0.3 });
    if (room.exits['east'])
      exits.push({ id: room.exits['east'], opacity: 0.3 });
    if (room.exits['south'])
      exits.push({ id: room.exits['south'], opacity: 0.3 });
    if (room.exits['west'])
      exits.push({ id: room.exits['west'], opacity: 0.3 });
    if (room.exits['up'])
      exits.push({ id: room.exits['up'], opacity: 0.3 });
    if (room.exits['down'])
      exits.push({ id: room.exits['down'], opacity: 0.3 });

    /*
    if (room.exits['northeast'])
      exits.push({ id: room.exits['northeast'], opacity: 0.1 });
    if (room.exits['northwest'])
      exits.push({ id: room.exits['northwest'], opacity: 0.1 });
    if (room.exits['southeast'])
      exits.push({ id: room.exits['southeast'], opacity: 0.1 });
    if (room.exits['southwest'])
      exits.push({ id: room.exits['southwest'], opacity: 0.1 });
    */

    for (let exit of exits)
    {
      if (exit)
      {
        let exitId = this.composeExitId(roomId, exit.id);

        if (this.exits.get(exitId) === undefined)
        {
          this.exits.set
          (
            exitId,
            /// TODO: Casem sem pridat info o tom, co je to za exit
            /// (jednosmerny, obousmerny, atd.).
            /// TODO: opacita by se primo predavat nemela, ta by se mela
            /// priradit az pri vykreslovani podle prislusne vlastnosti.
            {
              id: exitId,
              from: roomId,
              to: exit.id,
              opacity: exit.opacity
            }
          );
        }
      }
    }
  }

  private createMap($ancestor: JQuery)
  {
    // Select ancestor element using d3 library.
    // (Doing [0] on a jquery element accesses the DOM element.
    //  We do it instead of selecting ancetor element by it's
    //  id because ancestor element is not yet appended to the
    //  document at this time - so we need to use direct reference.)
    let d3WindowContent = d3.select($ancestor[0]);

    /// Mozna neni potreba, pokud funguje css.
    /// - jo, funguje
    /*
    // Read map dimensions from '#mapwindow_content' element.
    let width = d3WindowContent.attr('width');
    let height = d3WindowContent.attr('height');
    */

    ///console.log('d3WindowContent: ' + d3WindowContent);

    // Append a svg element that will be used to draw map in.
    this.d3MapSvg = d3WindowContent.append('svg');
    this.d3MapSvg.attr('class', MapWindow.SVG_MAP_CSS_CLASS);

    /*
    this.d3MapSvg.attr('viewBox', '0 0 10000 10000');
    this.d3MapSvg.attr('preserveAspectRatio', 'xMidYMid');
    this.d3MapSvg.attr('meetOrSlice', 'slice');
    */

    /// Mozna neni potreba, pokud funguje css.
    /*
    this.d3MapSvg.attr('width', width);
		this.d3MapSvg.attr('height', height);   
    */


    // Note:
    //   Order of creating of following elements is
    // important!
    //   Mouse events will prioritize the last inserted
    // one, so 'this.d3RoomsSvg' must come last or the
    // lines (representing exits) won't steal mouse transform
    // the ellipses (representing rooms).

    // Container for exit svg elements.
    this.d3ExitsSvg = this.d3MapSvg.append('g');

    // Container for room svg elements.
    this.d3RoomsSvg = this.d3MapSvg.append('g');

    ///this.d3TagsSvg = this.d3MapSvg.append('g');
  }

  private initNewRoomElements(d3Rooms)
  {
    d3Rooms.attr('class', MapWindow.SVG_ROOM_CSS_CLASS);
    d3Rooms.attr('cx', (d, i) => { return this.getRoomX(d); });
    d3Rooms.attr('cy', (d, i) => { return this.getRoomY(d); });
    d3Rooms.attr('rx', 5);
    d3Rooms.attr('ry', 5 * shorten);
    d3Rooms.attr('stroke', 'yellow');
    d3Rooms.attr('stroke-width', 1.5);
    ///d3Rooms.attr('fill', 'none');
    // Note: 'fill' 'none' would mean that the center of the
    // ellipse doesn't accept mouse events. We use 'transparent'
    // so the whole ellipse is clickable/mouseoverable.
    d3Rooms.attr('fill', 'transparent');

    // ---- Enable highlight on mouseover.
    /// TODO: Dělat to přes css class '.active'.
    /// (d3Rooms.classed('active', true);
    /// (d3Rooms.classed('active', false);
    d3Rooms.on
    (
      'mouseover',
      function(d) { d3.select(this).attr('stroke-width', 3); }
    );

    d3Rooms.on
    (
      'mouseout',
      function(d) { d3.select(this).attr('stroke-width', 1.5); }
    );

    // ---- Enable dragging ----
    // To handle 'mousedown' event, we have to pass both
    // javascript 'this' (which is the element on which
    // the event fired) and typesctipt 'this' (which is
    // the instance of MapWindow class). To do that, we
    // must remember 'this' in a variable so we can pass
    // it through closure.
    let mapWindow = this;

    d3Rooms.on
    (
      'mousedown',
      function(d)
      {
        // 'this' is the room SVG element.
        // 'mapWindow' is the local variable we remembered
        // earlier. It is available thanks to closure.
        mapWindow.onRoomMouseDown(d, this);
      }
    );

    /*
    var w = d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);

    d3.event.preventDefault(); // disable text dragging

    function mousemove() {
      div.text(d3.mouse(div.node()));
    }

    function mouseup() {
      div.classed("active", false);
      w.on("mousemove", null).on("mouseup", null);
    }
    */
  }

  private initNewExitElements(d3Exits)
  {
    d3Exits.style('stroke', 'yellow');
    ///d3NewExits.style('stroke-opacity', '0.5');
    d3Exits.style('stroke-opacity',(d) => { return this.getExitOpacity(d); });
    // Exit id is also used as respective svg element id.
    d3Exits.attr('id', function(d) { return d.id; });
    d3Exits.attr('x1', (d) => { return this.getExitFromX(d); });
    d3Exits.attr('y1', (d) => { return this.getExitFromY(d); });
    d3Exits.attr('x2', (d) => { return this.getExitToX(d); });
    d3Exits.attr('y2', (d) => { return this.getExitToY(d); });

    /*
    // 'd' attribute dwars the line.
    d3NewExits.attr('d', (d, i) => { return this.getExitDAttrib(d); });
    */
  }

  private updateRoomElements(d3Rooms)
  {
    ///console.log('updateRoomElements()');
    d3Rooms.attr("cx", (d, i) => { return this.getRoomX(d); });
    d3Rooms.attr("cy", (d, i) => { return this.getRoomY(d); });
  }

  private updateExitElements(d3Exits)
  {
    d3Exits.attr('x1', (d) => { return this.getExitFromX(d); });
    d3Exits.attr('y1', (d) => { return this.getExitFromY(d); });
    d3Exits.attr('x2', (d) => { return this.getExitToX(d); });
    d3Exits.attr('y2', (d) => { return this.getExitToY(d); });
  }

  private updateRooms()
  {
    // Bind values of this.rooms hashmap directly to the respective
    // svg elements.
    // (This piece of black magic obtains array of hashmap values.
    //  Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    let data = [...this.rooms.values()];

    // We are going to manupulate all <circle> elements inside
    // this.d3RoomsSvg.
    let d3RoomElements = this.d3RoomsSvg.selectAll('ellipse');

    // Bind 'data' to the selection.
    // (so when the data changes, the next updateRooms() will create
    //  create a new svg elements for added values and remove svg elements
    //  bound to removed values).
    let d3Rooms = d3RoomElements.data(data);

    // 'd3Rooms' now contain elements that already existed
    // and need an update. Let's update them.
    this.updateRoomElements(d3Rooms);

    // Create a new <circle> elements for newly added rooms.
    let d3NewRooms = d3Rooms.enter().append('ellipse');
    // Init attributes (position, color, etc.) of newly created
    // circles.
    this.initNewRoomElements(d3NewRooms);

    // Remove <circle> elements for deleted rooms.
    d3Rooms.exit().remove();
  }

  private updateExits()
  {
    // Bind values of this.exits hashmap directly to the respective
    // svg elements.
    // (This piece of black magic obtains array of hashmap values.
    //  Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    let data = [...this.exits.values()];

    // We are going to manupulate all <path> elements inside
    // this.d3ExitsSvg.
    let d3ExitElements = this.d3ExitsSvg.selectAll('line');

    // Bind 'data' to the selection.
    // (so when the data changes, the next updateExits() will create
    //  create a new svg elements for added values and remove svg elements
    //  bound to removed values).
    let d3Exits = d3ExitElements.data(data);

    // 'd3Exits' now contain elements that already existed
    // and need an update. Let's update them.
    this.updateExitElements(d3Exits);

    // Create a new <circle> elements for newly added rooms.
    let d3NewExits = d3Exits.enter().append('line');
    // Init attributes (position, color, etc.) of newly created
    // path elements.
    this.initNewExitElements(d3NewExits);

    // Remove <path> elements for deleted exits.
    d3Exits.exit().remove();
  }

  // Creates the exitId by concatenating ids
  // of connected rooms in alphabetical order
  // (this deduplicates bidirectional exits).
  private composeExitId(fromId: string, toId: string)
  {
    // Note: Id must not begin with number because
    // it's also used as an element id. So we prefix
    // it with 'exit_'.
    if (fromId < toId)
      return 'exit_' + fromId + '_' + toId;
    else
      return 'exit_' + toId + '_' + fromId;
  }

  // Updates position of svg elements corresponding to exits
  // leading from the room ('d' is data attached to that room).
  /// TODO: Nějak pořešit taky incomming jednosměrné exity.
  private updateRoomExits(d)
  {
    let roomId = d.id;

    // 'exit' is an id of destination room.
    for (let exit in d.exits)
    {
      let destId = d.exits[exit];
      let exitId = this.composeExitId(roomId, destId);

      this.updateExitElements(this.d3ExitsSvg.select('#' + exitId));
    }
  }

  // ------- plotting methods --------

  // -> Returns 'x' of origin of coordinate system within
  //    the map drawing area.
  private originX()
  {
    /// console.log('Map width: ' + this.$content.width());

    // Obtaining dimensions of svg element is complicated as hell,
    // so we 'cheat' a little bit and use the with of window content
    // element instead.
    return this.$content.width() / 2;
  }

  // -> Returns 'y' of origin of coordinate system within
  //    the map drawing area.
  private originY()
  {
    // Obtaining dimensions of svg element is complicated as hell,
    // so we 'cheat' a little bit and use the with of window content
    // element instead.
    return this.$content.height() / 2;
  }

  private getRoomX(d: any)
  {
    ///console.log('d: ' + d);

    // 'd.coords' contains relative room coordinates.
    // (Room directly north of the room at [0, 0, 0] has
    //  cooords [0, 1, 0]).
    // 'x' and 'y' coords are always ordinary numbers
    //  (so the rooms always 'stick' to [x, y] grid),
    // 'z' coord can be a floating point number.
    let mudX = d.coords.x;
    let mudY = d.coords.y;

    // Transformation to currently centered room.
    let centeredMudX = mudX - this.coords.x;
    let centeredMudY = mudY - this.coords.y;

    let xPos = centeredMudX * MapWindow.ROOM_SPACING;
    xPos += centeredMudY * MapWindow.ROOM_SPACING * dx;

    ///if (i === 0)
    ///  console.log('xPos before transform: ' + xPos);

    // Transformation of origin from top left
    // (which is an origin point in svg elements)
    // to the middle of map area).
    xPos += this.originX();

    ///if (i === 0)
    ///  console.log('xPos after transform: ' + xPos);

    ///console.log('OriginX: ' + this.originX());

    ///console.log('xPos: ' + xPos);

    return xPos + "px";
  }

  private getRoomY(d: any)
  {
    let mudY = d.coords.y;
    let mudZ = d.coords.z;

    // Transformation to currently centered room.
    let centeredMudY = mudY - this.coords.y;
    let centeredMudZ = mudZ - this.coords.z;

    // Projection of mud 'Y' axis to viewport 'y' axis.
    let yPos = centeredMudY * MapWindow.ROOM_SPACING * dy;

    // Projection of mud 'Z' axis to viewport 'y' axis
    // (Mud 'z' coordinate is projected 1:1).
    //yPos += centeredMudZ * MapWindow.ROOM_SPACING;
    yPos += centeredMudZ * MapWindow.ROOM_SPACING * 0.5;

    ///if (i === 0)
    ///  console.log('yPos before transform: ' + yPos);

    // Transformation of origin from top left
    // (which is an origin point in svg elements)
    //  to the middle of map area).
    // (We are also inverting 'y' axis).
    yPos = this.originY() - yPos;

    ///if (i === 0)
    ///{
    ///  console.log('origin y: ' + this.originY());
    ///  console.log('yPos after transform: ' + yPos);
    ///}

    ///console.log('OriginY: ' + this.originY());

    return yPos + "px";
  }

  /*
  private getExitDAttrib(d: any)
  {
    let fromX = this.getExitFromX(d);
    let fromY = this.getExitFromY(d);
    let toX = this.getExitToX(d);
    let toY = this.getExitToY(d);

    let line = d3.line();
    line.x();

    // This black magic creates of 'd' attribute like this:
    // <path d="M150 0 L75 200" />
    // ('M' means 'move to', 'L' means 'line to',
    //  and absolute coordinates are used because
    //  both 'M' and 'L' are capital letters).
    return 'M' + fromX + ',' + fromY + 'L' + toX + ',' + toY;
  }
  */

  private getExitOpacity(d: any)
  {
    return d.opacity;
  }

  private getExitFromX(d: any)
  {
    let fromRoomId = d.from;
    ///let toRoomId = d.to;

    ///console.log('d.from: ' + d.from + ' d.to: ' + d.to + ' d.opacity: ' + d.opacity);

    let fromRoom = this.rooms.get(fromRoomId);

    return this.getRoomX(fromRoom);
  }

  private getExitFromY(d: any)
  {
    let fromRoomId = d.from;
    ///let toRoomId = d.to;

    let fromRoom = this.rooms.get(fromRoomId);

    return this.getRoomY(fromRoom);
  }

  private getExitToX(d: any)
  {
    let toRoomId = d.to;

    let toRoom = this.rooms.get(toRoomId);

    return this.getRoomX(toRoom);
  }

  private getExitToY(d: any)
  {
    let toRoomId = d.to;

    let toRoom = this.rooms.get(toRoomId);

    return this.getRoomY(toRoom);
  }

  // ---------------- Event handlers --------------------

  private onResize(event: Event)
  {
    ///console.log('onResize()');
    this.updateMap();
  }

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
    d3.select(element).attr('cy', (d) => { return this.getRoomY(d); });

    // Update adjacend exit lines.
    this.updateRoomExits(d);
  }

  private onRoomMouseDown(d, element)
  {
    // Remember original state in data bound to element.
    this.roomDragData.origZ = d.coords.z,
    this.roomDragData.origMouseY = d3.mouse(element)[1];

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