/*
  Part of BrutusNEXT

  Implements mapper window.
*/

'use strict';

///import ScrollViewOutput = require('../component/ScrollViewOutput');
///import MudColorComponent = require('../component/MudColorComponent');
import Window = require('../component/Window');
import Connection = require('../connection/Connection');

import $ = require('jquery');

class Mapper extends Window
{
  constructor(private connection: Connection)
  {
    super();

    this.connection.mapper = this;
  }

  public static get CSS_CLASS() { return 'Mapper'; }
  public static get CONTENT_CSS_CLASS() { return 'MapperContent'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'mapper';

  //------------------ Private data ---------------------

  ///private input = new ScrollViewInput(this);

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  ///public getInputId() { return this.id + '_input'; }

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create();

    // ScrollView window uses css class .ScrollView along with .Window.
    this.$window.addClass(Mapper.CSS_CLASS);

    this.setTitle('Dragonhelm Mountains');

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
    $content.addClass(Mapper.CONTENT_CSS_CLASS);

    /*
    // Create html element 'input'.
    let $input = this.input.create(this.getInputId());
    // Put it in the 'content' element.
    $content.append($input);
    */

    return $content;
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}

export = Mapper;