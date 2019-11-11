/*
  Part of BrutusNEXT

  Standalone window containing a form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';
import {Form} from '../../../client/gui/form/Form';

export class FormWindow extends StandaloneWindow
{
  // ---------------- Protected data --------------------

  protected form: (Form | null) = null;

  // ---------------- Event handlers --------------------

  protected onEnterPressed()
  {
    if (this.form === null)
    {
      ERROR("Unexpected 'null' value");
      return false;
    }

    this.form.submit();
  }

  protected onEscapePressed()
  {
    // Nothing here (method can be overriden).    
  }

  // ~ Overrides StandaloneWindow.onKeyDown().
  // Handles 'keydown' event fired on html document
  // (it means that this handler runs even if this
  //  window desn't have focus).
  public onKeyDown(event: JQueryEventObject)
  {
    let key = event.which;

    switch (key)
    {
      case 13:  // 'Enter'
        this.onEnterPressed();
        break;

      case 27:  // 'Escape'
        this.onEscapePressed();
        break;
    }
  }
}