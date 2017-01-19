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

  // Command history.
  private commands =
  {
    active: 0,  // Which command is the user viewing/editing.
    buffer: new Array<string>()
  }

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

    this.$input.keydown
    (
      (event) => { this.onKeyDown(event); }
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

  public focus()
  {
    this.$input.focus();
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private sendCommand()
  {
    let command = this.$input.val();

    this.bufferCommand(command);
    this.scrollView.sendCommand(command);
    
    // Empty the textarea.
    this.$input.val('');
  }

  private bufferCommand(command: string)
  {
    this.commands.buffer.push(command);

    // Let the active command index point beyond the last one
    // (in other words, sending the command resets the pointer
    //  so the next 'Up' key will recall the command that has
    //  just been sent).
    this.commands.active = this.commands.buffer.length;
  }

  private recallCommand(index: number)
  {
    if (index >= 0 && index < this.commands.buffer.length)
    {
      this.$input.val(this.commands.buffer[index]);
      this.commands.active = index;
    }
  }


  // ---------------- Event handlers --------------------

  private onKeyPress(event: KeyboardEvent)
  {
    switch (event.keyCode)
    {
      // Changes default behaviour of textarea (a new line
      // is added to the text on enter by default) to send
      // the value to the server instead.
      case 13:  // 'Enter'
        event.preventDefault(); // Do not add a new line on 'enter'.
        this.sendCommand();
        return false;
    }

    return true;  // Continue processing this event.
  }

  private onKeyDown(event: KeyboardEvent)
  {
    switch (event.keyCode)
    {
      case 38:  // 'Up'
        this.recallCommand(this.commands.active - 1);
        return false;

      case 40:  // 'Down'
        this.recallCommand(this.commands.active + 1);
        return false;
    }

    return true;  // Continue processing this event.
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