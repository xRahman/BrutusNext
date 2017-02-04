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

/// To je možná blbost....
/// d3 pracuje vždycky s jednou classou svg elementů naráz,
/// tj. všechny roomy, všechny exity, atd.
/// Každá z nich se updatuje na základě příslušného pole.
///
/// Na druhou stranu mohl bych všechno bindovat na pole world[]
/// a v něm vždycky zaindexovat.
///
/// To bude ok pro roomy, ale exity nejsou spojite pole...
/// mohl bych je sice resit po roomech, ale problem je, ze kazdej
/// exit nalezi dvema roomum, tj. bych kreslil kazdou caru dvakrat.

/// Cili mozna bude nakonec fakt nejlepsi mit odelena pole rooms[], exits[]
/// a nabindovat je primo na prislusnou serii svg elementu.

/// Na druhou stranu nekde si musim drzet position data (kde room je v xyz)
/// a taky musim umet ty exity a roomy v prislusnem poli najit...

/// Asi by to slo udelat pres Map() - klicem by bylo id roomu.
/// Hodnoty by se pak vytáhly přes .values (nebo možná spíš .keys,
/// protože d3 potřebuje unikátní klíče k tomu, aby mohlo říct,
/// které elementy přibyly a které ubyly).
/// - asi furt dává smysl mapa, protože do value si můžu dát koordináty roomu.

// Tak ne, je to spis asi blbost.
/*
/// => Exity by asi taky měly mít vlastní idčka (což asi dává smysl i na
///    serveru).
/// Smer ma byt vlastnost roomu, nebo vlastnost exitu?
/// - asi spis roomu. 
*/
/*
  Ovsem uplna blbost to neni - nejak musim exity identifikovat v mapperu.
  OK, nechme zatim exity stranou. Zatim si budu hrat s kreslenim mistnosti.
*/

// Projection angle.
///let angle = Math.PI / 8;
let angle = Math.PI / 8;
///let angle = 3 * Math.PI / 16;

// Shortening factor of virtual 'y' axis.
let shorten = Math.cos(angle);
//let shorten = 0.6;

// Shortening factors projected to viewport cooordinates.
let dx = Math.sin(angle) * shorten;
let dy = Math.cos(angle) * shorten;

/*
let sin45 = Math.sin(Math.PI / 4);
let cos45 = Math.cos(Math.PI / 4);
*/

/*
let world =
{
  // First row.
  '100-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'east': '101-imt2xk99'
    },
    coords:
    {
      x: 0,
      y: 0,
      z: 0
    }
  },
  '101-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'west': '100-imt2xk99',
      'east': '102-imt2xk99'
    },
    coords:
    {
      x: 1,
      y: 0,
      z: 0.1
    }
  },
  '102-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '101-imt2xk99',
      'east': '103-imt2xk99'
    },
    coords:
    {
      x: 2,
      y: 0,
      z: 0.2
    }
  },
  '103-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '102-imt2xk99',
      'east': '104-imt2xk99'
    },
    coords:
    {
      x: 3,
      y: 0,
      z: 0.3
    }
  },
  '104-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '103-imt2xk99',
      'east': '105-imt2xk99'
    },
    coords:
    {
      x: 4,
      y: 0,
      z: 0.4
    }
  },
  '105-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '104-imt2xk99',
      'east': '106-imt2xk99'
    },
    coords:
    {
      x: 5,
      y: 0,
      z: 0.5
    }
  },
  '106-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '105-imt2xk99',
      'east': '107-imt2xk99'
    },
    coords:
    {
      x: 6,
      y: 0,
      z: 0.5
    }
  },
  '107-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '106-imt2xk99',
      'east': '108-imt2xk99'
    },
    coords:
    {
      x: 7,
      y: 0,
      z: 0.4
    }
  },
  '108-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '107-imt2xk99',
      'east': '108-imt2xk99'
    },
    coords:
    {
      x: 8,
      y: 0,
      z: 0.3
    }
  },
  '109-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '108-imt2xk99',
      'east': '110-imt2xk99'
    },
    coords:
    {
      x: 9,
      y: 0,
      z: 0.2
    }
  },
  '110-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '109-imt2xk99',
      'east': '111-imt2xk99'
    },
    coords:
    {
      x: 10,
      y: 0,
      z: 0.1
    }
  },
  '111-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '110-imt2xk99',
      'east': '112-imt2xk99'
    },
    coords:
    {
      x: 11,
      y: 0,
      z: 0
    }
  },
  '112-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '111-imt2xk99'
    },
    coords:
    {
      x: 12,
      y: 0,
      z: 0
    }
  },
  // Second row.
  '200-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'east': '201-imt2xk99'
    },
    coords:
    {
      x: 0,
      y: 1,
      z: 0
    }
  },
  '201-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'west': '200-imt2xk99',
      'east': '202-imt2xk99'
    },
    coords:
    {
      x: 1,
      y: 1,
      z: 0.1
    }
  },
  '202-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '201-imt2xk99',
      'east': '203-imt2xk99'
    },
    coords:
    {
      x: 2,
      y: 1,
      z: 0.2
    }
  },
  '203-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '202-imt2xk99',
      'east': '204-imt2xk99'
    },
    coords:
    {
      x: 3,
      y: 1,
      z: 0.3
    }
  },
  '204-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '203-imt2xk99',
      'east': '205-imt2xk99'
    },
    coords:
    {
      x: 4,
      y: 1,
      z: 0.3
    }
  },
  '205-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '204-imt2xk99',
      'east': '206-imt2xk99'
    },
    coords:
    {
      x: 5,
      y: 1,
      z: 0.3
    }
  },
  '206-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '205-imt2xk99',
      'east': '207-imt2xk99'
    },
    coords:
    {
      x: 6,
      y: 1,
      z: 0.2
    }
  },
  '207-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '206-imt2xk99',
      'east': '208-imt2xk99'
    },
    coords:
    {
      x: 7,
      y: 1,
      z: 0.1
    }
  },
  '208-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '207-imt2xk99',
      'east': '208-imt2xk99'
    },
    coords:
    {
      x: 8,
      y: 1,
      z: 0
    }
  },
  '209-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '208-imt2xk99',
      'east': '210-imt2xk99'
    },
    coords:
    {
      x: 9,
      y: 1,
      z: 0
    }
  },
  '210-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '209-imt2xk99',
      'east': '211-imt2xk99'
    },
    coords:
    {
      x: 10,
      y: 1,
      z: 0
    }
  },
  '211-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '210-imt2xk99',
      'east': '212-imt2xk99'
    },
    coords:
    {
      x: 11,
      y: 1,
      z: 0
    }
  },
  '212-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '211-imt2xk99'
    },
    coords:
    {
      x: 12,
      y: 1,
      z: 0
    }
  },
  // Third row.
  '300-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'east': '301-imt2xk99'
    },
    coords:
    {
      x: 0,
      y: 2,
      z: 0
    }
  },
  '301-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'west': '300-imt2xk99',
      'east': '302-imt2xk99'
    },
    coords:
    {
      x: 1,
      y: 2,
      z: 0
    }
  },
  '302-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '301-imt2xk99',
      'east': '303-imt2xk99'
    },
    coords:
    {
      x: 2,
      y: 2,
      z: 0
    }
  },
  '303-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '302-imt2xk99',
      'east': '304-imt2xk99'
    },
    coords:
    {
      x: 3,
      y: 2,
      z: 0
    }
  },
  '304-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '303-imt2xk99',
      'east': '305-imt2xk99'
    },
    coords:
    {
      x: 4,
      y: 2,
      z: 0
    }
  },
  '305-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '304-imt2xk99',
      'east': '306-imt2xk99'
    },
    coords:
    {
      x: 5,
      y: 2,
      z: 0
    }
  },
  '306-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '305-imt2xk99',
      'east': '307-imt2xk99'
    },
    coords:
    {
      x: 6,
      y: 2,
      z: 0
    }
  },
  '307-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '306-imt2xk99',
      'east': '308-imt2xk99'
    },
    coords:
    {
      x: 7,
      y: 2,
      z: 0
    }
  },
  '308-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '307-imt2xk99',
      'east': '308-imt2xk99'
    },
    coords:
    {
      x: 8,
      y: 2,
      z: 0
    }
  },
  '309-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '308-imt2xk99',
      'east': '310-imt2xk99'
    },
    coords:
    {
      x: 9,
      y: 2,
      z: 0
    }
  },
  '310-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '309-imt2xk99',
      'east': '311-imt2xk99'
    },
    coords:
    {
      x: 10,
      y: 2,
      z: 0
    }
  },
  '311-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '310-imt2xk99',
      'east': '312-imt2xk99'
    },
    coords:
    {
      x: 11,
      y: 2,
      z: 0
    }
  },
  '312-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'west': '311-imt2xk99'
    },
    coords:
    {
      x: 12,
      y: 2,
      z: 0
    }
  }
};
*/

export class MapWindow extends Window
{
  constructor(private connection: Connection)
  {
    super();

    this.connection.mapWindow = this;

    let zg = new ZoneGenerator();

    let world = zg.generateZone();

    /// TEST:
    for (let property in world)
    {
      // Build room data.
      this.rooms.set(property, world[property]);

      // Add exits of this room to this.exits.
      this.addRoomExits(property, world[property]);
    }
    ///console.log('Items in exits hashmap: ' + [...this.exits.values()].length);

    /*
    console.log('Items in hashmap: ' + [...this.rooms.values()].length);

    this.roomData = new Array();

    for (let room of this.rooms.values())
    {
      console.log('Adding room to roomData: ' + room);

      this.roomData.push[room];
      ///this.roomData.push('3');
    }

    console.log('roomData.length: ' + this.roomData.length);
    */
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
      exits.push({ id: room.exits['north'], opacity: 0.2 });
    if (room.exits['east'])
      exits.push({ id: room.exits['east'], opacity: 0.2 });
    if (room.exits['south'])
      exits.push({ id: room.exits['south'], opacity: 0.2 });
    if (room.exits['west'])
      exits.push({ id: room.exits['west'], opacity: 0.2 });
    if (room.exits['up'])
      exits.push({ id: room.exits['up'], opacity: 0.2 });
    if (room.exits['down'])
      exits.push({ id: room.exits['down'], opacity: 0.2 });

    /*
    if (room.exits['northeast'])
      exits.push({ id: room.exits['northeast'], opacity: 0.03 });
    if (room.exits['northwest'])
      exits.push({ id: room.exits['northwest'], opacity: 0.03 });
    if (room.exits['southeast'])
      exits.push({ id: room.exits['southeast'], opacity: 0.03 });
    if (room.exits['southwest'])
      exits.push({ id: room.exits['southwest'], opacity: 0.03 });
    */

    // 'exit' is an id of destination room.
    for (let exit of exits)
    {
      if (exit)
      {
        let exitId = roomId + ':' + exit.id;

        this.exits.set
        (
          exitId,
          { from: roomId, to: exit.id, opacity: exit.opacity }
        );

        /// Zatím kašlu na deduplikaci obousměrných exitů
        /// (navíc to nebylo dobře, this.rooms.get(exit)
        /// není idčko ale data roomy).
        /*
        let destRoomId = this.rooms.get(exit);

        // If destination room exists.
        if (destRoomId)
        {
          let exitId = null;

          // Create the exitId by concatenating ids
          // of connected rooms in alphabetical order.
          if (roomId < destRoomId)
            exitId = roomId + ':' + destRoomId;
          else
            exitId = destRoomId + ':' + roomId;

          /// Do dat asi časem dám info o tom, co je to za exit
          /// (jednosměrný, obousměrný, atd.).
          this.exits.set(exitId, {});
        }
        */
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
    d3Rooms.attr('cx', (d, i) => { return this.getRoomX(d, i); });
    d3Rooms.attr('cy', (d, i) => { return this.getRoomY(d, i); });
    d3Rooms.attr('rx', 5);
    d3Rooms.attr('ry', 5 * shorten);
    d3Rooms.attr('stroke', 'yellow');
    d3Rooms.attr('stroke-width', 1.5);
    ///d3Rooms.attr('fill', 'none');
    // Note: 'fill' 'none' would mean that the center of the
    // ellipse doesn't accept mouse events. We use 'transparent'
    // so the whole ellipse is clickable/mouseoverable.
    d3Rooms.attr('fill', 'transparent');

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
  }

  private initNewExitElements(d3Exits)
  {
    d3Exits.style('stroke', 'yellow');
    ///d3NewExits.style('stroke-opacity', '0.5');
    d3Exits.style('stroke-opacity',(d) => { return this.getExitOpacity(d); });

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
    d3Rooms.attr("cx", (d, i) => { return this.getRoomX(d, i); });
    d3Rooms.attr("cy", (d, i) => { return this.getRoomY(d, i); });
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

  private getRoomX(d: any, i: number)
  {
    ///console.log('d: ' + d);

    // 'd.coords' contains relative room coordinates.
    // (Room directly north of the room at [0, 0, 0] has
    //  cooords [0, 1, 0]).
    // 'x' and 'y' coords are always ordinary numbers
    //  (so the rooms always 'stick' to [x, y] grid),
    // 'z' coord can be a floating point number.
    ///let mudX = d.coords.x;
    let mudX = d.coords[0];
    ///let mudY = d.coords.y;
    let mudY = d.coords[1];

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

  private getRoomY(d: any, i: number)
  {
    ///let mudY = d.coords.y;
    let mudY = d.coords[1];
    ///let mudZ = d.coords.z;
    let mudZ = d.coords[2];

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

    return this.getRoomX(fromRoom, 0);
  }

  private getExitFromY(d: any)
  {
    let fromRoomId = d.from;
    ///let toRoomId = d.to;

    let fromRoom = this.rooms.get(fromRoomId);

    return this.getRoomY(fromRoom, 0);
  }

  private getExitToX(d: any)
  {
    let toRoomId = d.to;

    let toRoom = this.rooms.get(toRoomId);

    return this.getRoomX(toRoom, 0);
  }

  private getExitToY(d: any)
  {
    let toRoomId = d.to;

    let toRoom = this.rooms.get(toRoomId);

    return this.getRoomY(toRoom, 0);
  }

  // ---------------- Event handlers --------------------

  private onResize(event: Event)
  {
    ///console.log('onResize()');
    this.updateMap();
  }
}