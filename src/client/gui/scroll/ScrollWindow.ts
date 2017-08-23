/*
  Part of BrutusNEXT

  Scrollable text window with input console.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {ScrollWindowInput} from '../../../client/gui/scroll/ScrollWindowInput';
import {ScrollWindowOutput} from
  '../../../client/gui/scroll/ScrollWindowOutput';
import {MudColors} from '../../../client/gui/MudColors';
import {TitledWindow} from '../../../client/gui/window/TitledWindow';
import {Connection} from '../../../client/lib/connection/Connection';

export class ScrollWindow extends TitledWindow
{
  constructor()
  {
    super
    (
      {
        windowParam:
        {
          name: 'scroll_window',
          sCssClass: ScrollWindow.S_CSS_CLASS
        }
      }
    );

     /// TEST
    this.setTitle('Rahman@BrutusNext');

    this.createOutput();
    this.createInput();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.IN_GAME);
  }

  protected static get S_CSS_CLASS()
    { return 'S_ScrollWindow'; }

  // ----------------- Public data ----------------------

  public output: ScrollWindowOutput = null;

  // ----------------- Private data ---------------------

  private input: ScrollWindowInput = null;

  // ---------------- Public methods --------------------

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

    this.output.append
    (
      message,
      {
        baseTextColor: MudColors.CLIENT_MESSAGE_COLOR,
        forceScroll: true
      }
    );
  }
  
  public receiveMessage(message: string)
  {
    this.output.append(message);
  }

  public triggerOutputEvent(event)
  {
    this.output.triggerKeyboardEvent(event);
  }

  // Sets focus to the 'input' element.
  public focusInput()
  {
    this.input.focus();
  }

  // ---------------- Private methods -------------------

  private createOutput()
  {
    this.output = new ScrollWindowOutput
    (
      this,
      { $parent: this.$content }
    );
  }

  private createInput()
  {
    this.input = new ScrollWindowInput
    (
      this,
      { $parent: this.$content }
    );
  }

  // Adds the 'command' string to the 'output' element.
  private echoCommand(command: string)
  {
    // Echoing empty command (just hitting enter) would add
    // an empty line to the output, which wouldn't be very
    // informative and it wouldn't look good.
    if (command === "")
      return;

    this.output.append
    (
      command,
      {
        baseTextColor: MudColors.COMMAND_ECHO_COLOR,
        forceScroll: true
      }
    );
  }
}