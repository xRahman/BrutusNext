/*
  Part of BrutusNEXT

  Chargen window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneFormWindow} from
  '../../../client/gui/window/StandaloneFormWindow';
import {ChargenForm} from '../../../client/gui/chargen/ChargenForm';

export class ChargenWindow extends StandaloneFormWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARGEN);
  }

  // ----------------- Public data ----------------------

  public form = new ChargenForm();

  // ---------------- Public methods --------------------

  // ~ Overrides StandaloneWindow.create().
  public create()
  {
    super.create({ windowParam: { name: 'chargen_window' }});

    this.setTitle("Character Creation");

    this.createChargenForm();
  }

  // ---------------- Private methods -------------------

  private createChargenForm()
  {
    this.form.create({ $parent: this.$content });
  }
}