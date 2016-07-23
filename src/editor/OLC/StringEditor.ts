/*
  Part of BrutusNEXT

  Allows to edit text in terminal mode.
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT';
import {ASSERT_FATAL} from '../../shared/ASSERT_FATAL';
import {PlayerConnection} from '../../server/PlayerConnection';

export class StringEditor
{
  constructor
  (
    private playerConnection: PlayerConnection,
    initialText: string
  )
  {
    this.text = initialText;
    this.origText = initialText;
  }

  // -------------- Protected class data ----------------

  // -------------- Private class data ----------------

  // Text that is being edited.
  private text = "";
  private origText = "";

  // -------------- Public methods -------------------

  public processCommand(command: string)
  {
    switch (command)
    {
      case '/s':  // Save the result and exit the editor.
        this.playerConnection.returnFromStringEditor();
      break;

      case '/a':  // Discard all changes and exit the editor.
        this.text = this.origText;
        this.playerConnection.abortStringEditor();
      break;

      case '/c':  // Clear the contents.
        this.text = "";
      break;

      default:    // Append the text.
        this.text += command;
      break;
    }
  }

  // -------------- Protected methods -------------------


  // --------------- Private methods --------------------


}