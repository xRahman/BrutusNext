/*
  Part of BrutusNEXT

  Chargen window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {ChargenForm} from '../../../client/gui/chargen/ChargenForm';

export class ChargenWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARGEN);
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private form = new ChargenForm();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ name: 'chargen_window' });

    this.setTitle("Character Creation");

    // Create chargen form.
    this.form.create({ $parent: this.$content });

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}