/*
  Part of BrutusNEXT

  Lonely window at the center of the screen containing a form.
*/

'use strict';

import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/form/Form';
import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';

export class StandaloneFormWindow extends StandaloneWindow
{
  // ----------------- Public data ----------------------

  public form: Form = null;

  // --------------- Protected methods ------------------

  // // ~ Overrides Window.onShow().
  // protected onShow()
  // {
  //   if (this.form)
  //     this.form.onShow();
  // }

  // // ~ Overrides Window.onHide().
  // protected onHide()
  // {
  //   if (this.form)
  //     this.form.onHide();
  // }
}