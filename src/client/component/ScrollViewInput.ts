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
  public static get FRAME_CSS_CLASS() { return 'ScrollViewFrame'; }

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

  public getInputFrameId()
  {
    return this.id + '_frame';
  }

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create(id: string)
  {
    // TODO: rozdelit to do podfunkci.

    this.id = id;

    // Create a DOM element.
    let inputFrame = this.createDivElement
    (
      this.getInputFrameId(),
      ScrollViewInput.FRAME_CSS_CLASS
    );

    // Create jquery element from the DOM element.
    let $inputFrame = $(inputFrame);

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

    // Put 'input' in the 'inputFrame' element.
    $inputFrame.append(this.$input);

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

    return $inputFrame;
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

  // 'offset' represents direction
  // (-1 for recalling previous command, +1 for next command).
  // -> Returns 'true' if player is currently editing a multiline
  //    command so cursor keys should navigate inside the current
  //    value instead of recalling next or previous command.
  private isEditingMultilineCommand(offset: number): boolean
  {
    let currentValue = this.$input.val();

    // Is there a multi-line command in the input box?
    if (currentValue.indexOf('\n') !== -1)
    {
      let selectionStart = this.$input.prop('selectionStart');
      var selectionEnd = this.$input.prop('selectionEnd');
      // Note: When there is no selection, start is equal to end.

      // Position at the end of the input text.
      let end = currentValue.length;

      // If the cursor (or the start of the selection) isn't at the
      // start, we can't recall previous command.
      if (offset < 0 && selectionStart > 0)
        return true;

      // If the cursor (or the end of the selection) isn't at the
      // end, we can't recall previous command.
      if (offset > 0 && selectionEnd < end)
        return true;

      // If the cursor isn't at the start or at the end, or the selection
      // doesn't end at the end, we can't recall neither previous nor next
      // command.
      if (selectionEnd > 0 && selectionEnd < end)
        return true;

      // If the cursor isn't at the start or at the end, or the selection
      // doesn't start at the start, we can't recall neither previous nor
      // next command.
      if (selectionStart > 0 && selectionStart < end)
        return true;
    }

    return false;
  }

  private updateCursorPosition
  (
    offset: number,
    isMultiline: boolean,
    endpos: number
  )
  {
    let position = endpos;

    if (isMultiline && offset < 0)
      position = 0;
      
    this.$input.prop('selectionStart', position);
    this.$input.prop('selectionEnd', position);

    if (isMultiline && offset > 0)
    {
      // Scroll the textarea to the bottom.
      this.$input.scrollTop(this.$input.prop('scrollHeight') - 3);
    }
    else
    {
      // Scroll the textarea to the top.
      this.$input.scrollTop(0 + 3);
    }
  }

  private recallCommand(event: KeyboardEvent, offset: number)
  {
    if (this.isEditingMultilineCommand(offset))
      return true;  // Continue processing the event.

    let index = this.commands.active + offset;
    let recalledCommand = this.commands.buffer[index];

    if (index >= 0 && index < this.commands.buffer.length)
    {
      event.preventDefault();

      this.$input.val(recalledCommand);
      this.commands.active = index;

      let isMultiline = recalledCommand.indexOf('\n') !== -1;

      this.updateCursorPosition
      (
        offset,
        isMultiline,
        recalledCommand.length
      );

      return false;
    }

    return true; // Continue processing the event.
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

    return true;  // Continue processing the event.
  }

  private onKeyDown(event: KeyboardEvent)
  {
    switch (event.keyCode)
    {
      case 38:  // 'Up'
        return this.recallCommand(event, -1);

      case 40:  // 'Down'
        return this.recallCommand(event, +1);
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