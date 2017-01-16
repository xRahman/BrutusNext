/*
  Part of BrutusNEXT

  Implements input element of scrollable text window.
*/

'use strict';

import Component = require('../components/Component');

import $ = require('jquery');

class ScrollViewInput extends Component
{
  public static get CSS_CLASS() { return 'ScrollViewInput'; }

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
  public create()
  {
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

    // Set focus to the input element.
    this.$input.focus();

    this.$input.keypress
    (
      (event) => { this.onInputKeyPress(event); }
    );

    return this.$input;
  }

  // --------------- Protected methods ------------------

  /// Zatim ciste experimentalne
  // -> Returns html that creates the element.
  protected createMessageHtml(message: string)
  {
    let messageHtml =
      '<span style="color:green;font-family:CourrierNewBold;">'
        + message;
    + '</span>';

    return messageHtml;
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  private sendCommand()
  {
    /// TODO:
    /*
    let input = $('#' + this.getInputId());

    // Send the contents of 'textarea' to the connection.
    this.webSocketDescriptor.send(input.val());
    */
    
    // Empty the textarea.
    this.$input.val('');
  }

  private onInputKeyPress(event: KeyboardEvent)
  {
    // This changes default behaviour of textarea (a new line
    // is added to the text on enter by default) to send the
    // value to the socket instead.
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