/*
  Part of BrutusNEXT

  Defines immortal levels, which determine ingame admin rights.
*/

export class AdminLevels
{
  public static get MORTAL()      { return 0; }
  public static get IMMORTAL()    { return 1; }
  public static get GOD()         { return 2; }
  public static get GREATER_GOD() { return 3; }
  public static get CREATOR()     { return 4; }
  public static get IMPLEMENTOR() { return 5; }
}