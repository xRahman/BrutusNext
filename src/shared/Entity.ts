/*
  Part of BrutusNEXT

  Extends SaveableObject with the ability to remember id and to save
  and load to the file.
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {EntityId} from '../shared/EntityId';
import {SaveableObject} from '../shared/SaveableObject';
import {AutoSaveableObject} from '../shared/AutoSaveableObject';

export class Entity extends AutoSaveableObject
{
  public static get ID_PROPERTY() { return 'id'; }

  // ----------------- Private data ----------------------

  private id: EntityId = null;

  // ---------------- Static methods --------------------

  // Creates a new instance of game entity of type saved in id.
  static createInstanceFromId(id: EntityId, ...args: any[]): Entity
  {
    ASSERT_FATAL(id !== null,
      "Invalid (null) id passed to GameEntity::createInstance()");

    let newEntity = SaveableObject
      .createInstance({ className: id.getType(), typeCast: Entity }, args);

    newEntity.setId(id);

    return newEntity;
  }

  // --------------- Public accessors -------------------

  public getId() { return this.id; }
  public setId(id: EntityId) { this.id = id; }

  // ---------------- Public methods --------------------

  // Returns something like "Connection (id: d-imt2xk99)"
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
  protected getIdStringValue(): string { return this.id.getStringId(); }
}