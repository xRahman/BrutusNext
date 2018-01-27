/*
  Part of BrutusNEXT

  Standalone window containing a form.
*/

'use strict';

import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';
import {Form} from '../../../client/gui/form/Form';

export class FormWindow extends StandaloneWindow
{
  // ----------------- Public data ---------------------- 

  public form: Form | null = null;

  // ---------------- Event handlers --------------------

  protected onEnterPressed()
  {
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
  public onKeyDown(event: JQueryKeyEventObject)
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