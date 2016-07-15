/*
  Part of BrutusNEXT

  Data from which script methods are created.
*/

import {SaveableObject} from '../shared/SaveableObject';

export class ScriptData extends SaveableObject
{
  // Name of method that will be created on prototype.
  public methodName: string = "";

  // Code that will be inserted to method created on prototype.
  public code: string = "";
}