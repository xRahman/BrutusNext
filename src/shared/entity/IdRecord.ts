/*
  Part of BrutusNEXT

  Auxiliary class that saves and loads files that
  translate unique entity names to respective ids.
  (for example /data/names/accounts/Rahman.json)
*/

'use strict';

import {SaveableObject} from '../../shared/fs/SaveableObject';

export class IdRecord extends SaveableObject
{
  // Note: Unlike Entity classes, we want and id property to be saved.
  public id: string = null;

  /*
  public cathegory: string = null;
  // But we don't need to save cathegory - in order to load IdRecord,
  // cathegory must by known (so the proper directory is accessed),
  // so it doesn't make sense to save it.
  private static cathegory = { isSaved: false };
  */
}
