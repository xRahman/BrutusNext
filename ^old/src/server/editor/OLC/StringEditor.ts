/*
  Part of BrutusNEXT

  Allows to edit text in terminal mode.
*/

/*
'use strict';

import {Connection} from '../../../server/lib/connection/Connection';

export class StringEditor
{
  constructor
  (
    private connection: Connection,
    initialText: string
  )
  {
    this.text = initialText;
    this.origText = initialText;
  }

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // Text that is being edited.
  private text = "";
  private origText = "";

  // -------------- Public methods -------------------

  public processCommand(command: string)
  {
    switch (command)
    {
      case '/s':  // Save the result and exit the editor.
        this.connection.returnFromStringEditor();
      break;

      case '/a':  // Discard all changes and exit the editor.
        this.text = this.origText;
        this.connection.abortStringEditor();
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
*/