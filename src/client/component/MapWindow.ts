/*
  Part of BrutusNEXT

  Implements mapper window.
*/

'use strict';

import {Window} from '../component/Window';
import {Connection} from '../connection/Connection';

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

let world =
{
  '3-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'north': '4-imt2xk99'
    },
    coords:
    {
      x: 0,
      y: 0,
      z: 0
    }
  },
  '4-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'south': '3-imt2xk99'
    },
    coords:
    {
      x: 1,
      y: 0,
      z: 0
    }
  }
};

export class MapWindow extends Window
{
  constructor(private connection: Connection)
  {
    super();

    this.connection.mapWindow = this;

    /// TEST:
    this.rooms.set('3-imt2xk99', world['3-imt2xk99']);
    this.rooms.set('6-imt2xk99', world['6-imt2xk99']);

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

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'mapwindow';

  //------------------ Private data ---------------------

  private rooms = new Map();
  private exits = new Map();

  ///private roomData = null;

  // --- d3 elements ---

  private d3MapSvg = null;
  private d3RoomsSvg = null;

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

    this.setTitle('Dragonhelm Mountains');

    return this.$window;
  }

  // 
  public updateMap()
  {
    this.updateRooms();
    this.updateExits();
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

    console.log('d3WindowContent: ' + d3WindowContent);

    // Append a svg element that will be used to draw map in.
    this.d3MapSvg = d3WindowContent.append('svg');
    this.d3MapSvg.attr('class', MapWindow.SVG_MAP_CSS_CLASS);

    /// Mozna neni potreba, pokud funguje css.
    /*
    this.d3MapSvg.attr('width', width);
		this.d3MapSvg.attr('height', height);   
    */

    // Container for room svg elements.
    this.d3RoomsSvg = this.d3MapSvg.append('g');

    ///this.d3LinesSvg = this.d3MapSvg.append('g');
    ///this.d3TagsSvg = this.d3MapSvg.append('g');


    /// TEST:
    this.updateMap();
  }

  private initNewRoomElements(d3NewRooms)
  {
    /// barEnter.style("width", function(d) { return d * 10 + "px"; });

    d3NewRooms.attr('class', MapWindow.SVG_ROOM_CSS_CLASS);
    d3NewRooms.attr("cx", 30);
    d3NewRooms.attr("cy", 30);
    d3NewRooms.attr("r", 5);
    d3NewRooms.attr("stroke", 'yellow');
    d3NewRooms.attr("stroke-width", 1.5);
    d3NewRooms.attr("fill", 'none');
  }

  private updateRooms()
  {
    // Use 'keys' array of 'this.rooms' hashmap as a guiding data
    // for d3 to build respective elements.
    ///let data = this.roomData;

    // This piece of black magic obtains array of hashmap values
    // (Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    let data = [...this.rooms.values()];

    // We are going to manupulate elements inside a this.d3RoomsSvg
    // element that have a css class 'room'.
    let d3RoomElements = this.d3RoomsSvg.selectAll('.room');

    // Bind 'data' to the selection.
    // (so when the data changes, the next updateRooms() will create
    //  create a new svg elements for added values and remove svg elements
    //  bound to removed values).
    let d3Rooms = d3RoomElements.data(data);

    // Create a new <circle> elements for newly added rooms.
    let d3NewRooms = d3Rooms.enter().append('circle');

    // Init attributes (position, color, etc.) of newly created
    // circles.
    this.initNewRoomElements(d3NewRooms);

    // Remove <g> elements of deleted rooms.
    d3Rooms.exit().remove();
  }

  private updateExits()
  {
    /*
    // Use 'keys' array of 'this.exits' hashmap as a guiding data
    // for d3 to build respective elements.
    let data = this.exits.keys;
    */
  }

  // ---------------- Event handlers --------------------

}