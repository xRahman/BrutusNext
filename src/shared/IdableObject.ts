/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember id and to save
  and load to the file.
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {AutoSaveableObject} from '../shared/AutoSaveableObject';

export abstract class IdableObject extends AutoSaveableObject
{
  public static get ID_PROPERTY() { return 'id'; }

  // ----------------- Private data ----------------------

  private id: Id = null;

  // ---------------- Public methods --------------------

  public getId() { return this.id; }
  public setId(id: Id) { this.id = id; }

  // --------------- Protected methods ------------------

  // This is used for creating save file names.
  protected getIdStringValue(): string { return this.id.getStringId(); }
}