/*
  Part of BrutusNEXT

  Implements scrollable text window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {ScrollWindowInput} from
  '../../../client/gui/component/ScrollWindowInput';
import {ScrollWindowOutput} from
  '../../../client/gui/component/ScrollWindowOutput';
import {MudColorComponent} from
  '../../../client/gui/component/MudColorComponent';
import {Window} from '../../../client/gui/component/Window';
import {Connection} from '../../../client/lib/connection/Connection';

import $ = require('jquery');

export class ScrollWindow extends Window
{
  constructor()
  {
    super();

    ///this.connection.scrollWindow = this;
  }

  protected static get CSS_CLASS() { return 'ScrollWindow'; }
  protected static get CONTENT_CSS_CLASS() { return 'ScrollWindowContent'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  /// TODO: Kdyz bych chtel mit vic scrollWindows (jako ze jo,
  //    budu chtit logovat imma a mortala najednou), tak Tohle
  //  budu muset setovat zvenku (nebo nejak automaticky inkrementovat).
  protected id = 'scrollwindow';

  //------------------ Private data ---------------------

  private input = new ScrollWindowInput(this);
  public output = new ScrollWindowOutput();

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

    // ScrollWindow uses css class .ScrollWindow along with .Window.
    this.$window.addClass(ScrollWindow.CSS_CLASS);

    /// TEST
    this.setTitle('Rahman@BrutusNext');

    return this.$window;
  }

  // Writes the command to the output and sends it to the connection.
  public sendCommand(command: string)
  {
    // Local echo (append the command to the output element).
    this.echoCommand(command);

    this.output.scrollToBottom();

    // Send the command to the connection.
    ClientApp.connection.sendCommand(command);
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
  
  public receiveMessage(message: string)
  {
    this.output.appendMessage(message);
  }

  public triggerOutputEvent(event: JQueryKeyEventObject)
  {
    this.output.triggerKeyboardEvent(event);
  }

  // Sets focus to the 'input' element.
  public focusInput()
  {
    this.input.focus();
  }

  // --------------- Protected methods ------------------

  // --- Element-generating methods ---

  // ~ Overrides Window.createContentElement().
  // -> Returns created html element.
  protected createContent()
  {
    let $content = super.createContent();

    // ScrollWindow content uses css class .ScrollWindowContent along with
    // .WindowContent.
    $content.addClass(ScrollWindow.CONTENT_CSS_CLASS);

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

  // Adds the 'command' string to the 'output' element.
  private echoCommand(command: string)
  {
    // Echoing empty command (just hitting enter) would add
    // an empty line to the output, which wouldn't be very
    // informative and it wouldn't look good.
    if (command === "")
      return;

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