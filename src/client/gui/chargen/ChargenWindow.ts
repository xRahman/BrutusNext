/*
  Part of BrutusNEXT

  Chargen window.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {StandaloneWindow} from '../../../client/gui/StandaloneWindow';
import {Form} from '../../../client/gui/Form';
import {ChargenForm} from '../../../client/gui/chargen/ChargenForm';

import $ = require('jquery');

export class ChargenWindow extends StandaloneWindow
{
  constructor()
  {
    super();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.CHARGEN);
  }

  // protected static get CHARLIST_S_CSS_CLASS()
  //   { return 'S_CharlistWindow_Charlist'; }
  // protected static get CHARACTER_PLATE_CONTAINER_S_CSS_CLASS()
  //   { return 'S_CharlistWindow_CharacterPlateContainer'; }
  // protected static get CHARACTER_PLATE_S_CSS_CLASS()
  //   { return 'S_CharlistWindow_CharacterPlate'; }

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
    super.create();

    this.setTitle("Character Creation");

    // Create chargen form.
    this.form.create({ $container: this.$content });

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}