/*
  Part of BrutusNEXT

  Auxiliary class that stores information about
  hardcoded prototype class.
*/

'use strict';

import {SaveableObject} from '../shared/fs/SaveableObject';

export class PrototypeRecord extends SaveableObject
{
  public descendantIds = [];

  // Note: This property can't be named 'prototype' because
  // 'static prototype' property would refer to the javascript
  // prototype property so we wouldn't be able to set this property
  // as non-saveable. 
  public prototypeObject = null;
  // Do not save property 'prototypeObject'.
  private static prototypeObject = { isSaved: false };
}
