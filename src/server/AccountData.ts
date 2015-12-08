/*
  Part of BrutusNEXT

  Holds saveable data members for Account class.
*/

import {SaveableObject} from '../shared/SaveableObject';

export class AccountData extends SaveableObject
{
  public blah = "BLAH";
  public x = 0;
  public struct = { kafe: "Kafe", teplota: 13 };
  public pole = [1, 2, 3, 4];
}