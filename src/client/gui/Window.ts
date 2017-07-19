/*
  Part of BrutusNEXT

  Window element.
*/

'use strict';

import {Flags} from '../../shared/lib/utils/Flags';
import {ClientApp} from '../../client/lib/app/ClientApp';
import {Component} from '../../client/gui/Component';
import {Document} from '../../client/gui/Document';

export class Window extends Component
{
  protected static get S_CSS_CLASS()
    { return 'S_Window'; }

  // ---------------- Protected data --------------------

  // Prevents this window to show when app state is changed
  // (for example if player is disconnected, all game windows
  //  are hidden and login window is shown. When player logs
  //  back in, login window is hidden and all game windows are
  //  shown again - except those with 'closed' set to 'true').
  protected closed = false;

  // Determines app states at which this window is shown.
  protected flags = new Flags<ClientApp.State>();

  protected $window: JQuery = null;

  // ----------------- Private data ---------------------

  // Internal flag to prevent calling onHide() if window
  // is already hidden.
  private hidden = true;

  // --------------- Public accessors -------------------

  public getFlags() { return this.flags; }

  // ---------------- Public methods --------------------

  public create
  (
    { windowParam }: { windowParam?: Component.DivParam } = {}
  )
  {
    this.applyDefaults
    (
      windowParam,
      {
        name: 'window',
        $parent: Document.$body,
        gCssClass: Component.WINDOW_G_CSS_CLASS,
        sCssClass: Window.S_CSS_CLASS
      }
    );

    this.$window = this.createDiv(windowParam);

    // Windows are created hidden.
    this.$window.hide();
  }

  public showByState(state: ClientApp.State)
  {
    if (this.flags.isSet(state))
      this.show();
    else
      this.hide();
  }

  // Executes when html document is fully loaded.
  public onDocumentReady() {}

  // Executes when html document is resized.
  public onDocumentResize() {}

  // --------------- Protected methods ------------------

  protected onShow() {}
  protected onHide() {}

  // ---------------- Private methods -------------------

  private hide()
  {
    if (this.hidden)
      return;

    this.onHide();
    this.$window.hide();
    this.hidden = true;
  }

  private show()
  {
    if (this.closed)
      return;

    if (!this.hidden)
      return;

    this.onShow();
    this.$window.show();
    this.hidden = false;
  }
}