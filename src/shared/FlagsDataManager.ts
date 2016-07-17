/*
  Part of BrutusNEXT
*/

'use strict';

import {SaveableObject} from '../shared/SaveableObject';
import {FlagsData} from '../shared/FlagsData';

class FlagsDataManager extends SaveableObject
{
  // List of sets of flags.
  flagSets = new Array<FlagsData>();
}