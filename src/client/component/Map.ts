/*
  Part of BrutusNEXT

  Implements mapper window.
*/

'use strict';

import {Window} from '../component/Window';
import {Connection} from '../connection/Connection';

import $ = require('jquery');
import d3 = require('d3');

let world =
{
  '3-imt2xk99':
  {
    'name': 'Tutorial Room',
    'exits':
    {
      'north': '6-imt2xk99'
    }
  },
  '6-imt2xk99':
  {
    'name': 'System Room',
    'exits':
    {
      'south': '3-imt2xk99'
    }
  }
};

export class Map extends Window
{
  constructor(private connection: Connection)
  {
    super();

    this.connection.map = this;
  }

  public static get CSS_CLASS() { return 'Mapper'; }
  public static get CONTENT_CSS_CLASS() { return 'MapperContent'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'mapwidnow';

  //------------------ Private data ---------------------

  // --- d3 elements ---

  private d3Map = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create();

    // ScrollView window uses css class .ScrollView along with .Window.
    this.$window.addClass(Map.CSS_CLASS);

    this.setTitle('Dragonhelm Mountains');

    this.createMap();

    return this.$window;
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
    $content.addClass(Map.CONTENT_CSS_CLASS);

    /*
    // Create html element 'input'.
    let $input = this.input.create(this.getInputId());
    // Put it in the 'content' element.
    $content.append($input);
    */

    return $content;
  }

  // ---------------- Private methods -------------------

  private createMap()
  {
    /// TODO:
    this.d3Map = d3.select('#' + this.getContentId());
  }

  // ---------------- Event handlers --------------------

}