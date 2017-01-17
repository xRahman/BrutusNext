/*
  Part of BrutusNEXT

  Implements scrollable text window.
*/

'use strict';

import ScrollViewInput = require('../components/ScrollViewInput');
import ScrollViewOutput = require('../components/ScrollViewOutput');
import Window = require('../components/Window');

import $ = require('jquery');

class ScrollView extends Window
{
  // If you send a command, it will be printed to output using this color.
  public static get COMMAND_ECHO_COLOR() { return 'rgb(128,64,64)'; }
  // If you send a command, it will be printed to output using this font.
  public static get COMMAND_ECHO_FONT() { return 'CourrierNewBold'; }

  public static get CSS_CLASS() { return 'ScrollView'; }
  public static get CONTENT_CSS_CLASS() { return 'ScrollViewContent'; }
  ///public static get OUTPUT_CSS_CLASS() { return 'ScrollViewOutput'; }
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

  private input = new ScrollViewInput(this);
  ///private output = new ScrollViewOutput();
  public output = new ScrollViewOutput();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getOutputId() { return this.id + '_output'; }
  public getInputId() { return this.id + '_input'; }

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create();

    // ScrollView window uses css class .ScrollView along with .Window.
    this.$window.addClass(ScrollView.CSS_CLASS);

    return this.$window;
  }

  // Writes the command to the output and sends it to the connection.
  public sendCommand(command: string)
  {
    // Local echo (append the command to the output element).
    this.echoCommand(command);

    // Send the command to the connection.
    /// TODO:
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

  /*
  // -> Returns created html element.
  protected createOutput()
  {
    // Create a DOM element.
    let output = this.createDivElement
    (
      this.getOutputId(),
      ScrollView.OUTPUT_CSS_CLASS
    );

    // Create a jquery element from the DOM element.
    return $(output);
  }
  */

  /*
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
    return input;
  }
  */

  // Overrides Window.createContentElement().
  // -> Returns created html element.
  protected createContent()
  {
    let $content = super.createContent();

    // ScrollView content uses css class .ScrollViewContent along with
    // .WindowContent.
    $content.addClass(ScrollView.CONTENT_CSS_CLASS);

    // Create jquery element 'output'.
    let $output = this.output.create(this.getOutputId());
    // Put it in the 'content' element.
    $content.append($output);

    // Create html element 'input'.
    let $input = this.input.create(this.getInputId());
    // Put it in the 'content' element.
    $content.append($input);

    return $content;
  }

  // ---------------- Private methods -------------------

  private echoCommand(command: string)
  {
    // Echoing empty command (just hitting enter) would add
    // an empty line to the output, which wouldn't be very
    // informative and it wouldn't look good.
    if (command === "")
      return;

    let html =
      '<span style="color:' + ScrollView.COMMAND_ECHO_COLOR + ';' +
        ' font-family:' +  + ScrollView.COMMAND_ECHO_FONT + ';">'
        + command
    + '</span><br />';

    // Local echo (append the command to the output element).
    this.output.appendHtml(html, { forceScroll: true });
  }

  // ---------------- Event handlers --------------------

  /*
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
  */

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