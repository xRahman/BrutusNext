/*
  Part of BrutusNEXT

  Scrollable text console.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {ScrollWindowInput} from '../../../client/gui/scroll/ScrollWindowInput';
import {ScrollWindowOutput} from
  '../../../client/gui/scroll/ScrollWindowOutput';
import {MudColorComponent} from '../../../client/gui/MudColorComponent';
import {GameWindow} from '../../../client/gui/GameWindow';
import {Connection} from '../../../client/lib/connection/Connection';

import $ = require('jquery');

export class ScrollWindow extends GameWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.IN_GAME);
  }

  protected static get S_CSS_CLASS()
    { return 'S_ScrollWindow'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private input = new ScrollWindowInput(this);
  public output = new ScrollWindowOutput();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides GameWindow.create().
  public create()
  {
    super.create(ScrollWindow.S_CSS_CLASS);

    /// TEST
    this.setTitle('Rahman@BrutusNext');

    this.output.create(this.$content);
    this.input.create(this.$content);

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