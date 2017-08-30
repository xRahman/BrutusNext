/*
  Part of BrutusNEXT

  Chargen window.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
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

  // ---------------- Public methods --------------------

  public backToCharselect()
  {
    ClientApp.setState(ClientApp.State.CHARSELECT);
  }

  // ---------------- Private methods -------------------

  private createChargenForm()
  {
    if (this.form !== null)
      ERROR("Chargen form already exists");

    this.form = new ChargenForm(this, { $parent: this.$content });
  }

  // ---------------- Event handlers --------------------

  // ~ Overrides FormWindow.onEscapePressed().
  protected onEscapePressed()
  {
    this.backToCharselect();
  }
}