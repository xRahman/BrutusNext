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

  public id: Id = null;

  // ---------------- Public methods --------------------

  public async save()
  {
    await this.saveToFile(this.getSaveDirectory(), this.getSaveFileName());
  }

  public async load()
  {
    await this.loadFromFile(this.getFullSavePath());
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  protected getSaveDirectory(): string
  {
    ASSERT_FATAL(false,
      "Attempt to call getSaveDirectory() of abstract"
      + " IdableSaveableObject class");

    return "";
  }

  protected getSaveFileName(): string
  {
    ASSERT_FATAL(false,
      "Attempt to call getSaveFileName() of abstract"
      + " IdableSaveableObject class");

    return "";
  }

  protected getFullSavePath(): string
  {
    let directory = this.getSaveDirectory();
    let fileName = this.getSaveFileName();
    let fullPath = directory + fileName;

    ASSERT_FATAL(directory.substr(directory.length - 1) === '/',
      "Directory path '" + directory + "' doesn't end with '/'");

    return this.getSaveDirectory() + this.getSaveFileName();
  }

  // This is used for creating save file names.
  protected getIdStringValue(): string { return this.id.getStringId(); }
}