/*
  Part of BrutusNEXT

  Implements input element of scrollable text window.
*/

'use strict';

import Component = require('../component/Component');
import ScrollView = require('../component/ScrollView');

import $ = require('jquery');

class ScrollViewInput extends Component
{
  public static get CSS_CLASS() { return 'ScrollViewInput'; }

  constructor(private scrollView: ScrollView)
  {
    super();
  }

  // -------------- Static class data -------------------

  ///public webSocketDescriptor = null;

  //----------------- Protected data --------------------

  protected $input = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(id: string)
  {
    this.id = id;

    // Create a DOM element.
    let input = this.createTextAreaElement
    (
      this.id,
      ScrollViewInput.CSS_CLASS
    );

    // Input element accepts multi-line text (its a 'textarea') but only
    // shows one line (because user commands are usualy single-line).
    input.rows = 1;

    // Create jquery element from the DOM element.
    this.$input = $(input);

    this.$input.attr({ 'autofocus': 'autofocus' });

    this.$input.keypress
    (
      (event) => { this.onKeyPress(event); }
    );

    /*
    /// Test
    this.$input.keypress
    (
      (event) =>
      {
        console.log('event sent to output');
        this.scrollView.output.$output.trigger(event);
        event.stopPropagation();
      }
    );

    // Test
    this.$input.keydown
    (
      (event) =>
      {
        console.log('event sent to output');
        this.scrollView.output.$output.trigger(event);
        event.stopPropagation();
      }
    );

    // Test
    this.$input.keyup
    (
      (event) =>
      {
        console.log('event sent to output');
        this.scrollView.output.$output.trigger(event);
        event.stopPropagation();
      }
    );
    */

    return this.$input;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  private sendCommand()
  {
    this.scrollView.sendCommand(this.$input.val());
    
    // Empty the textarea.
    this.$input.val('');
  }

  private onKeyPress(event: KeyboardEvent)
  {
    // Changes default behaviour of textarea (a new line
    // is added to the text on enter by default) to send
    // the value to the server instead.
    if (event.keyCode === 13) // 'enter'
    {
        event.preventDefault(); // Do not add a new line on 'eneter.

        console.log('submit');
        this.sendCommand();
        return;
    } 
  }

  /*
  private onInputKeyDown(event: KeyboardEvent)
  {
    if (event.keyCode === 13 && event.ctrlKey) {
        console.log("enterKeyDown+ctrl");
        $(this).val(function(i,val){
            return val + "\n";
        });
    }
  }
  */

  /*
  private onInputKeyUp(event: KeyboardEvent)
  {
    if (event.keyCode === 17)
    {
        console.log("ctrlKeyUp");
        ctrlKeyDown = false;   
    }
  }
  */

}

export = ScrollViewInput;