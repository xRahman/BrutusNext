/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember id and to save
  and load to the file.
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';

export abstract class IdableSaveableObject extends SaveableObject
{
  public static get ID_PROPERTY() { return 'id'; }

  // ----------------- Public data ----------------------

  public get id() { return this.myId; }
  public set id(value: Id) { this.myId = value; }

  // ---------------- Public methods --------------------

  public async save()
  {
    await this.saveToFile(this.getSavePath());
  }

  public async load()
  {
    await this.loadFromFile(this.getSavePath());
  }

  // -------------- Protected class data ----------------

  protected myId = Id.NULL;

  // --------------- Protected methods ------------------

  protected getSavePath(): string { return ""; }

  // This is used for creating save file names.
  protected getIdStringValue(): string { return this.myId.stringId; }
}