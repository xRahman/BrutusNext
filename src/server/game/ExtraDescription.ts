/*
  Part of BrutusNEXT

  An extra description of a game entity, it is revealed only if
  accessed by correct keyword (like 'look table').
*/

'use strict';

import {SaveableObject} from '../../server/lib/fs/SaveableObject';

export class ExtraDescription extends SaveableObject
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  public keywords: Array<String> = [];
  public description = "Unfinished description.";
}