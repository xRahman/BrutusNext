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
  // ----------------- Public data ----------------------

  public set id(value: Id) { this.myId = value; }
  public get id() { return this.myId; }

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

  protected myId = Id.NULL;

  // --------------- Protected methods ------------------

  protected abstract myGetSavePath(): string;

  /*
  protected saveToJsonObject(): Object
  {
    let jsonObject = super.saveToJsonObject();

    // Manually add 'myId' property.
    jsonObject['myId'] = this.myId;

    return jsonObject;
  }

  protected loadFromJsonObject(jsonObject: Object)
  {
    ASSERT_FATAL(jsonObject !== null, "Invalid jsonObject");
    ASSERT_FATAL('myId' in jsonObject, "Missing 'myId' property in json");

    // Manually load 'myId' property.
    // (This needs to be done before super.loadFromJsonObject(), in order
    // to eliminate null value, which would prevent loading.)
    this.myId = jsonObject['myId'];

    super.loadFromJsonObject(jsonObject);
  }
  */
}