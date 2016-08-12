/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember it's EntityId.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {EntityId} from '../shared/EntityId';
import {SaveableObject} from '../shared/SaveableObject';
import {AutoSaveableObject} from '../shared/AutoSaveableObject';

/*
/// TODO: Hmm, takhle asi ne. Bude se to savovat na disk, takze tu asi
/// muze byt jen informace VALID/DELETED, protoze idcko muze byt savnute
/// mnohokrat a pri loadu by se mohl loadnout nejakej divnej state.
/// - a vubec nejlepsi asi bude, kdyz to udelam proste jako bool.
enum State
{
  // Entity has been instantiated but neither loaded from file
  // nor initiated manually.
  NOT_LOADED,
  // Entity is loaded from disk and valid (not deleted).
  VALID,
  // Entity has been deleted from both memory and disk, you can't access
  // it anymore.
  DELETED
}
*/

export class Entity extends AutoSaveableObject
{
  /*
  // Enum cannot be declared inside a class in current version of Typescript,
  // but it can be assigned as static class variable. This allows using
  // Entity.State as if enum had been declared right here.
  // (Note that this enum is actually used in EntityId, not here in Entity.
  //  it's because id might still persist in save files even if entity itself
  //  had been deleted.)
  public static State = State;
  */

  public static get ID_PROPERTY() { return 'id'; }

  // ----------------- Private data ----------------------

  private id: EntityId = null;

  // --------------- Public accessors -------------------

  public getId() { return this.id; }
  public setId(id: EntityId) { this.id = id; }

  // ---------------- Public methods --------------------

  // Overrides AutoSaveableObject.save() to skip saving
  // if entity had been deleted.
  public async save()
  {
    // 'entityDeleted' flag is on id, not on entity (because id
    // may persist even after entity is deleted).
    if (!ASSERT(this.getId().isEntityDeleted() === false,
        "Attemp to save deleted entity " + this.getErrorIdString()))
      return;

    await this.saveToFile(this.getSaveDirectory(), this.getSaveFileName());
  }

  // Returns something like 'Connection (id: d-imt2xk99)'
  // (indended for use in error messages).
  public getErrorIdString()
  {
    return this.className + " (id: " + this.getId().getStringId() + ")";
  }

  // Entity adds itself to approptiate IdList
  // (so it can be searched by name, etc).
  // Note:
  //   This method is overriden by descendants which are inserted to IdList.
  public addToIdList() { }

  // --------------- Protected methods ------------------

  // This is used for creating save file names.
  protected getIdStringValue(): string
  {
    return this.id.getStringId();
  }
}