/*
  Part of BrutusNEXT

  Enables saving and loading.
*/

'use strict';

///import {ERROR} from '../../../shared/lib/error/ERROR';
///import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {App} from '../../../shared/lib/App';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {Serializable} from '../../../shared/lib/class/Serializable';

export class Saveable extends Serializable
{
  //----------------- Protected data --------------------

  // ------------- Public static methods ----------------

  // ------------ Protected static methods --------------

  // ---------------- Public methods --------------------

  public async save()
  {
    App.save(this);
  }

  public async load()
  {
    App.load(this);
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------
}