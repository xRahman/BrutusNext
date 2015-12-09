/*
  Part of BrutusNEXT

  Holds saveable data members for Account class.
*/

import {SaveableObject} from '../shared/SaveableObject';

export class AccountData extends SaveableObject
{
  constructor()
  {
    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    super({ version: 0 });
  }
  
  /*
  public blah = "";
  public x = -1;
  public struct = { kafe: "Kafe", teplota: 13 };
  public pole = [0, 0, 0, 0];
  */
  
  /*
  public blah = "BLAH";
  public x = 0;
  public struct = { kafe: "Kafe", teplota: 13 };
  public pole = [1, 2, 3, 4];
  */
}