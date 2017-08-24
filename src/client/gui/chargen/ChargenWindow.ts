/*
  Part of BrutusNEXT

  Chargen window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {FormWindow} from '../../../client/gui/window/FormWindow';
import {ChargenForm} from '../../../client/gui/chargen/ChargenForm';

export class ChargenWindow extends FormWindow
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

  // ~ Overrides FormWindow.form.
  public form: ChargenForm = null;

  // ---------------- Private methods -------------------

  private createChargenForm()
  {
    this.form = new ChargenForm(this, { $parent: this.$content });
  }
}