/*
  Part of BrutusNEXT

  Extends SaveableContainer with the ability to remember id and to save
  and load to the file.
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {SaveableContainer} from '../shared/SaveableContainer';

export abstract class IdableSaveableContainer extends SaveableContainer
{
  public static get ID_PROPERTY() { return 'id'; }

  // ----------------- Public data ----------------------

  public get id() { return this.myId; }
  public set id(value: Id)
  {
    this.myId = value;

    // Id's remembered by IdableSaveableContainer are saved by default.
    // (In order for them to be persistant.)
    this.myId.isSaved = true;
  }

  // ---------------- Public methods --------------------

  public async save()
  {
    await this.saveToFile(this.myGetSavePath());
  }

  public async load()
  {
    await this.loadFromFile(this.myGetSavePath());
  }

  // -------------- Protected class data ----------------

  // Null Ids in saveable container need to be saved, but all Ids are now
  // saved be default, so Id.NULL is ok.
  protected myId = Id.NULL;
  ///protected myId = Id.SAVED_NULL;

  // --------------- Protected methods ------------------

  protected myGetSavePath(): string { return ""; }
}