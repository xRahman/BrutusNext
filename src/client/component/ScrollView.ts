/*
  Part of BrutusNEXT

  Implements scrollable text window.
*/

'use strict';

import ScrollViewInput = require('../component/ScrollViewInput');
import ScrollViewOutput = require('../component/ScrollViewOutput');
import MudColorComponent = require('../component/MudColorComponent');
import Window = require('../component/Window');
import Connection = require('../connection/Connection');

import $ = require('jquery');

class ScrollView extends Window
{
  constructor(private connection: Connection)
  {
    super();

    this.connection.scrollView = this;
  }

  public static get CSS_CLASS() { return 'ScrollView'; }
  public static get CONTENT_CSS_CLASS() { return 'ScrollViewContent'; }

  // -------------- Static class data -------------------

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

    this.output.scrollToBottom();

    // Send the command to the connection.
    this.connection.send(command);
  }

  // Outputs a client system message.
  public clientMessage(message: string)
  {
    if (!message)
      return;    

    let html = this.htmlizeMudColors
    (
      message,
      MudColorComponent.CLIENT_MESSAGE_COLOR
    );

    // Append the message to the output element.
    this.output.appendHtml(html, { forceScroll: true });
  }
  
  public receiveData(data: string)
  {
    this.output.appendMessage(data);
  }

  public triggerOutputEvent(event: JQueryKeyEventObject)
  {
    this.output.triggerKeyboardEvent(event);
  }

  /*
  public keyboardScroll(key: number)
  {
    // PgUp(33), PgDn(34), End(35), Home(36),
    // Left(37), Up(38), Right(39), Down(40)

    switch(key)
    {
      case 33:  // 'PgUp'
        this.output.scrollOnePageUp();
        break;
        
      case 34:  // 'PgDn'
      this.output.scrollOnePageDown();
        break;

      case 35:  // 'End'
        this.output.scrollToTop();
        break;

      case 36:  // 'Home'
        this.output.scrollToBottom();
        break;

      //case 37:  // 'Left'
      
      case 38:  // 'Up'
        this.output.scrollOneLineUp();
        break;

      //case 39:  // 'Right'

      case 40:  // 'Down'
        this.output.scrollOneLineDown();
        break;
    }
  }
  */

  // Sets focus to the 'input' element.
  public focusInput()
  {
    this.input.focus();
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

  /*
  // Encloses each line in <span> tag followed by <br> tag.
  private htmlizeLinesOfCommand(lines: Array<string>)
  {
    let html = '';

    // Add each line as a separate <span> followed by <br>.
    for (let line of lines)
    {
      html += '<span style="color:' + ScrollView.COMMAND_ECHO_COLOR + ';';
      html +=  'font-family:' + ScrollView.COMMAND_ECHO_FONT + ';">';
      html +=    line;
      html += '</span><br />';
    }

    return html;
  }
  */

  // Adds the 'command' string to the 'output' element.
  private echoCommand(command: string)
  {
    // Echoing empty command (just hitting enter) would add
    // an empty line to the output, which wouldn't be very
    // informative and it wouldn't look good.
    if (command === "")
      return;

    /*
    // Because output element is not a text area, all lines would be
    // merged into one. To prevent that, we need to parse the command
    // and format the output using <br> tags.
    let lines = command.split('\n');

    // Whole command will be contained in a <div>
    let html = '<div>'
      +           this.htmlizeLinesOfCommand(lines);
      +        '</div>';
    */
    let html = this.htmlizeMudColors
    (
      command,
      MudColorComponent.COMMAND_ECHO_COLOR
    );

    // Local echo (append the command to the output element).
    this.output.appendHtml(html, { forceScroll: true });
  }

  // ---------------- Event handlers --------------------

}

export = ScrollView;