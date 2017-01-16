/*
  Part of BrutusNEXT

  Implements scrollable text window.
*/

'use strict';

import Client = require('../Client');
import Window = require('../components/Window');

import $ = require('jquery');

class ScrollView extends Window
{
  public static get CSS_CLASS() { return 'ScrollView'; }
  public static get CONTENT_CSS_CLASS() { return 'ScrollViewContent'; }
  public static get OUTPUT_CSS_CLASS() { return 'ScrollViewOutput'; }
  public static get INPUT_CSS_CLASS() { return 'ScrollViewInput'; }

  // -------------- Static class data -------------------

  public webSocketDescriptor = null;

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  /// TODO: Kdyz bych chtel mit vic scrollView oken (jako ze jo,
  //    budu chtit logovat imma a mortala najednou), tak Tohle
  //  budu muset setovat zvenku (nebo nejak automaticky inkrementovat).
  protected id = 'scrollview';

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getOutputId() { return this.id + '_output'; }
  public getInputId() { return this.id + '_input'; }

  // ---------------- Public methods --------------------

  // Creates respective html element in the document
  // (does not insert it into it's container element).
  // (Overrides Window.createElement()).
  // -> Returns created jquery element.
  public create()
  {
    super.create();

    // ScrollView window uses css class .ScrollView along with .Window.
    this.$element.addClass(ScrollView.CSS_CLASS);
  }

  public appendMessage(message: string)
  {
    let output = $('#' + this.getOutputId());

    // Size of the scrollable range (in pixels).
    let range = output.prop('scrollHeight') - output.prop('clientHeight');

    /// DEBUG
    /*
    console.log('--------------------------------------');
    console.log('range: ' + range);
    console.log('output.scrollTop(): ' + output.scrollTop());
    */

    // 'true' if user has scrolled up manually
    // (-1 to account for rounding errors. If use scolled up by
    //  less than one pixel, we can safely scoll back down anyways).
    let userScrolled = (output.scrollTop()) < (range - 1);

    /// DEBUG
    ///console.log('userScrolled: ' + userScrolled);

    let messageHtml = this.createMessageHtml(message);

    output.append(messageHtml);

    // If user scolls up manually, we don't want to scroll
    // the output down to the bottom on each output, that
    // would be very inconvinient.
    if (!userScrolled)
      this.scrollToBottom();

  }

  // --------------- Protected methods ------------------

  /// Tohle je blbost, na setovani titlu je setTitle().
  /*
  // Returns html containing window title.
  protected getTitle()
  {
    /// TODO
    return "Rahman@BrutusNext";
  }
  */

  // --- Element-generating methods ---

  // -> Returns created html element.
  protected createOutput()
  {
    let output = document.createElement('div');

    output.id = this.getOutputId();
    output.className = ScrollView.OUTPUT_CSS_CLASS;

    /*
    /// TEST
    let  text, br;
    for (let i = 0; i < 100; i++)
    {
      text = document.createElement('span');
      text.textContent = 'line ' + i;
      text.style.color = 'green';
      text.style.fontFamily = 'CourrierNewBold';
      text.style.padding = 0;
      text.style.border = 0;
      output.appendChild(text);

      br = document.createElement('br');
      output.appendChild(br);
    }
    /// /TEST
    */

    return output;
  }

  // -> Returns created html element.
  protected createInput()
  {
    // 'textarea' is a html multi-line input box.
    let input = document.createElement('textarea');

    input.id = this.getInputId();
    input.className = ScrollView.INPUT_CSS_CLASS;

    input.autofocus = true;
    input.rows = 1;
    /// Tohle by byl pocet znaku.
    //input.cols = 1;

    input.addEventListener
    (
      'keypress',
      (event) => { this.onInputKeyPress(event); }
    );

    /*
    input.addEventListener
    (
      'keydown',
      (event) => { this.onInputKeyDown(event); }
    );
    */

    /*
    input.addEventListener
    (
      'keyup',
      (event) => { this.onInputKeyUp(event); }
    );
    */

    return input;
  }

  // Overrides Window.createContentElement().
  // -> Returns created html element.
  protected createContent()
  {
    // Create html element 'content'.
    let content = super.createContent();

    // Class names are divided by ' '.
    content.className = content.className + ' ' + ScrollView.CONTENT_CSS_CLASS;

    // Create html element 'output'.
    let output = this.createOutput();
    // Put it in the 'content' element.
    content.appendChild(output);

    // Create html element 'input'.
    let input = this.createInput();
    // Put it in the 'content' element.
    content.appendChild(input);

    return content;
  }

  /// Zatim ciste experimentalne
  // -> Returns html that creates the element.
  protected createMessageHtml(message: string)
  {
    let messageHtml =
      '<span style="color:green;font-family:CourrierNewBold;">'
        + message;
    + '</span>';

    return messageHtml;
    /*
    br = document.createElement('br');
    output.appendChild(br);
    */
  }

  // ---------------- Private methods -------------------

  /// TODO: Bud private, nebo presunout do public sekce.
  private scrollToBottom()
  {

    ///$('#' + this.getOutputId()).scrollTop(10000);
    let output = document.getElementById(this.getOutputId());

    // Scroll to bottom.
    output.scrollTop = output.scrollHeight;

    /*
    ///output.scrollTop = output.scrollHeight - output.clientHeight;
    console.log('scrollHeight: ' + output.scrollHeight);
    console.log('clientHeight: ' + output.clientHeight);
    console.log('scrollTop: ' + output.scrollTop);
    */
  }

  // ---------------- Event handlers --------------------

  private sendCommand()
  {
    let input = $('#' + this.getInputId());

    // Send the contents of 'textarea' to the connection.
    this.webSocketDescriptor.send(input.val());
    
    // Empty the textarea.
    input.val('');
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

export = ScrollView;