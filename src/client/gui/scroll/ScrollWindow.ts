/*
  Part of BrutusNEXT

  Scrollable text window with input console.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
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

    this.createOutput();
    this.createInput();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.IN_GAME);
  }

  protected static get S_CSS_CLASS()
    { return 'S_ScrollWindow'; }

  // ----------------- Public data ----------------------

  public output: (ScrollWindowOutput | null) = null;

  // ----------------- Private data ---------------------

  private input: (ScrollWindowInput | null) = null;

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

  // ---------------- Private methods -------------------

  // Sets focus to the 'input' element.
  private focusInput()
  {
    this.input.focus();
  }

  private createOutput()
  {
    if (this.output !== null)
      ERROR("Scroll window output already exists");

    this.output = new ScrollWindowOutput
    (
      this,
      { $parent: this.$content }
    );
  }

  private createInput()
  {
    if (this.input !== null)
      ERROR("Scroll window input already exists");

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

  private redirectKeyDownEvent
  (
    key: number,
    alt: boolean,
    ctrl: boolean,
    shift: boolean
  )
  {
    /*
      Notes on shortcuts:
    
      'Ctrl + C' or 'Ctrl + Ins' -- copies the text into the clipboard.
        We don't want to give focus to the input element on these combinations,
        because focusing input would prevent copying the selected text.

      'Ctrl + X' or 'Shift + Del' cuts the text into the clipboard.
        We don't want to give focus to the input element on these combinations,
        because  the selection or cursor isn't actully in the input element
        so user doesn't expect the text to be deleted from the input element.
          Selected text actually won't be deleted from the output element
        (because it's disabled), but that's intended and intuitive behaviour.

      'Ctrl + V' or 'Shift + Ins' inserts the text from the clipboard.
        We do want to give focus to the input element, because it's the only
        element where it makes sense to put the text. It also saves the
        user one operation (clicking to input with the mouse to give it
        focus) when she wants to copy something from the output to the
        input. She only needs to select the text and pres 'Ctrl + C'
        followed by 'Ctrl + V' (or 'Ctrl + Ins' followed by 'Shift + Ins'). 

      'Del' deletes the selected text or the character at cursor position.
      'Backspace' deletes selected text or the character before cursor.
        We do not give focus to the input element, because user can't see
        the cursor so it would delete a seemingly random character from
        the input text. It won't do anything because deleting is disabled
        in output element.

      'Ctrl + Z' -- undo
      'Ctrl + Y' -- redo
        We give focus to the input elemet, because it's the only place where
        undoing or redoing makes sense.

      'Ctrl + A' -- select all
        We don't focus the input element, because user wants to select
        all text wherever she currecly is.

      'Tab' -- cycle to the next field
      'Shift + Tab' -- cycle to previous field
        We don't focus the input element, because 'Tab' is supposed to cycle
        between field which would be prevented by focusing the input (and
        tabbing doesn't work in the input element anyways).

      'Home' -- to beginning of line or far left of field or screen.
      'End' -- to end of line, or far right of field or screen.
        We give focus to the input elemet, because this doesn't make
        sense in the output.

      'Ctrl + Home' -- to the top
      'Ctrl + End' -- to the bottom
        We don't focus the input element, because user may want to
        scroll the output all the way up or down.

      'PageUp' -- moves you up by one page
      'PageDown' -- moves you down by one page
        These keys are always redirected to the output element so the user
        can scroll the output up or down even when typing commands to the
        input (or doing anything else). Paging the input element doesn't
        makes sense, because it works as a command buffer where cursor keys
        (Up or Down) recall previous or next command.

      Cursor keys ('Left', 'Right', 'Up', 'Down')
        We give focus to the input elemet, because cursor keys don't make
        any sense in the output.
        /// TODO: Asi je ale budu potřebovat v mapperu.

      'Shift + Ctrl + Right' -- select the whole word
        We give focus to the input elemet, because there is not
        cursor in the output element so it wouldn't do anything.

      'Esc'
        We don't focus the input element, because whatever escape
        does (if anything), it should do it where the focus is.
    */

    switch (key)
    {
      // These keys are never redirected.
      case 8:  // 'Backspace'
        // Use can't see what she would delete (because cursor is not
        // in the input element), so we won't redirect.
      case 9:  // 'Tab'
        // Focusing input would prevent correct cycling between fields.
      case 16:  // 'Shift'
      case 17:  // 'Ctrl'
      case 18:  // 'Alt'
        // Control keys do not give focus to the input
        // element because it would prevent copying and
        // pasting of text.
      case 27:  // 'Esc'
        // Whatever escape does (if anything), it should do it
        // where the focus is.
      case 46:  // 'Del'
        break;

      // These keys are redirected to the output element
      // (so the user can scroll output element while typing
      //  to the input element).
      case 33:  // 'PgUp'
      case 34:  // 'PgDn'
        this.output.focus();
        break;    

      // Following keys are redirected only when a specific key
      // combination is pressed.
      case 36:  // 'Home'
      case 35:  // 'End'
        if (ctrl)
          // 'Ctrl + Home' or 'Ctrl + End' scroll to the top
          // or to the bottom, which should work at the selected
          // element.
          break;
        // 'Home' or 'End' without ctrl is redirected to input element.
        this.focusInput();        
        break;
      case 45:  // 'Ins'
        if (shift)
        {
          // We want even 'Shift + Ins' (paste clipboard) to redirect
          // to the input element, because it's the only place where
          // it makes sense to insert contents of the clipboard.
          this.focusInput();
          break;
        }
        if (ctrl)
          // But we don't won't to redirect 'Ctrl + Ins' (copy to clipboard),
          // because giving focus to the input element would prevent it.
          break;
        // And there isn't really any point in redirecting 'Ins' or 'Alt+Ins'
        // so we won't bother.
        break;
      case 65:  // 'A'
        if (ctrl)
          // 'Ctrl + A' selects all, which should work in the output element.
          break;
        this.focusInput();        
        break;
      case 67:  // 'C'
        if (ctrl)
          // 'Ctrl + C' copies selected text into the clipboard.
          // Focusing the input element would prevent this.
          break;
        this.focusInput();        
        break;
      case 88:  // 'X'
      if (ctrl)
          // 'Ctrl + X' cuts selected text into the clipboard.
          // We don't want to do that in the input element if the
          // selection is elsewhere.
          break;
        this.focusInput();
        break; 

      // The rest of the key combinations are always redirected
      // to the input element.
      case 37:  // 'Left'
      case 38:  // 'Up'
      case 39:  // 'Right'
      case 40:  // 'Down'
      case 86:  // 'V'
        // We want even 'Ctrl + V' to redirect to input element,
        // because it's the only place where it makes sense to
        // insert contents of the clipboard.
      case 89:  // 'Y'
      case 90:  // 'Z'
        // We give focus to the input elemet even for 'Ctrl + Z' (undo)
        // and 'Ctrl + Y' (redo) because it's the only place where undoing
        // or redoing makes sense.
      default:
        this.focusInput();
        break;
    }
  }

  // ---------------- Event handlers --------------------

  // Handles 'keydown' event fired on html document
  // (it means that this handler runs even if this
  //  window desn't have focus).
  public onKeyDown(event: JQueryEventObject)
  {
    let key = event.which;
    let alt = event.altKey;
    let ctrl = event.ctrlKey;
    let shift = event.shiftKey;

    /*
      The event is not really processed here, it is just
      redirected by giving focus to another element.

      How it works:
        'keydown' event is first fired on element which has
      focus at the time. Then it bubbles (propagates) through
      DOM hierarchy up to html Document. At that time,
      Document.onKeyDown() is fired and from it this handler
      is called. Document is top level so event won't bubble
      anymore, but unless we call event.preventDefault(),
      default event handler will then be called by the browser.
        So if we give focus to another element here, default
      handler will be run on it instead on the element which
      originally fired the keydown event (in our case default
      handler will append the character to the scrollViewOutput
      text area).
    */
    this.redirectKeyDownEvent(key, alt, ctrl, shift);
  }
}