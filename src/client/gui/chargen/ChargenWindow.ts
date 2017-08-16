/*
  Part of BrutusNEXT

  Chargen window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';
import {ChargenForm} from '../../../client/gui/chargen/ChargenForm';

export class ChargenWindow extends StandaloneWindow
{
  constructor()
  {
    super({ windowParam: { name: 'chargen_window' }});

    this.setTitle("Character Creation");
    this.createChargenForm();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARGEN);
  }

  // ----------------- Public data ---------------------- 

  public form: ChargenForm = null;

  // ---------------- Public methods --------------------

  // // ~ Overrides StandaloneWindow.create().
  // public create()
  // {
  //   super.create({ windowParam: { name: 'chargen_window' }});

  //   this.setTitle("Character Creation");

  //   this.createChargenForm();
  // }

  // ---------------- Private methods -------------------

  private createChargenForm()
  {
    this.form = new ChargenForm(this, { $parent: this.$content });
  }
}