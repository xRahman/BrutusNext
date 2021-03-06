/*
  Part of BrutusNEXT

  Defines immortal levels, which determine ingame admin rights.
*/

'use strict';

export enum AdminLevel
{
  MORTAL,
  IMMORTAL,
  GOD,
  GREATER_GOD,
  ELDER_GOD,
  CREATOR
}

/*
export class AdminLevel
{ 
  public static get MORTAL()      { return 0; }
  public static get IMMORTAL()    { return 1; }
  public static get GOD()         { return 2; }
  public static get GREATER_GOD() { return 3; }
  public static get ELDER_GOD()   { return 4; }
  public static get CREATOR()     { return 5; }
}
*/