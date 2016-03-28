/*
  Part of BrutusNEXT

  Implements generator of unique ids.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

// 3rd party modules.
let promisifiedFS = require('fs-promise');

export class IdProvider extends SaveableObject
{
  // -------------- Public static data ------------------

  protected static get SAVE_DIRECTORY() { return "./data/"; }
  protected static get SAVE_FILE_NAME() { return "IdProvider.json" }
 

  // ---------------- Public methods --------------------

  public async save()
  {
    await this.saveToFile
    (
      IdProvider.SAVE_DIRECTORY,
      IdProvider.SAVE_FILE_NAME
    );
  }

  public async load()
  {
    await this.loadFromFile
    (
      IdProvider.SAVE_DIRECTORY + IdProvider.SAVE_FILE_NAME
    );

    // Remove the lock.
    this.tmpData.ready = true;
  }

  // Use 'null' as a 'not pointing anywhere' id value. Id can be invalid
  // even if it's not null, for example when it's pointing to an object
  // which has already been deleted.
  public generateId(typeOfId: string, type: string): Id
  {
    ASSERT_FATAL(this.tmpData.ready === true,
      "Attempt to generate an id before IdProvider has loaded"
      + "lastIssuedId from file");

    // This little gymnastics is probably not necessary, but I will
    // definitely sleep better knowing that there is no way we could
    // ever run out of ids (except if we run out of memory).
    // (Number.MAX_SAFE_INTEGER constant can't be used for some reason.
    // So let's just use it's value)
    if (this.lastIssuedId[this.lastIssuedId.length - 1]
        >= 9007199254740991)
    {
      // The idea is that when we run out of numbers in an integer,
      // we just add more.
      this.lastIssuedId.push(0);
    } else
    {
      this.lastIssuedId[this.lastIssuedId.length - 1]++;
    }

    let stringId = "";

    // And concatenate decimal string representations of all used
    // integer values.

    // Start with first integer.
    stringId = this.lastIssuedId[0].toString(10);

    // And concatenate the rest of them, deliminited by '-' character
    // (original array can be reconstructed this way if necessary and
    // it is better readable)
    for (let i = 1; i < this.lastIssuedId.length; i++)
    {
      stringId = this.lastIssuedId[i].toString(10) + '-' + stringId;
    }

    return new Id(stringId, type);
  }

  // -------------- Protected class data ----------------

  // [0] represents a start of the world - no ids have been isued yet.
  // This should never happen in real life, lastIssuedId should always
  // be loaded from disk before any ids are issued.
  protected lastIssuedId: Array<number> = [0];
  protected tmpData = new IdProviderTmpData();

  // -------------- Protected methods -------------------

  // Overrides SaveableObject::saveToFile() to not to save
  // idProvider (because it's done by this class so it would
  // lead to endless recursion and stack overflow.
  protected async saveToFile(directory: string, fileName: string)
  {
    ASSERT_FATAL(directory.substr(directory.length - 1) === '/',
      "Directory path '" + directory + "' doesn't end with '/'");

    // Directory might not yet exist, so we better make sure it does.
    await this.createDirectory(directory);

    await this.saveContentsToFile(directory + fileName);
  }
}

class IdProviderTmpData
{
  // This lock prevents us from issuing new ids before lastIssuedId is
  // loaded from file (from last boot).
  public ready = false;
}