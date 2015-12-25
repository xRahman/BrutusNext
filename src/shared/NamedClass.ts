/*
  Part of BrutusNEXT

  Class that let's you know it's class name.
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';

export class NamedClass
{
  constructor()
  {
      this.className = this.getClassName();
  }

  public static get CLASS_NAME_PROPERTY() { return 'className'; }

  public className = "NamedClass";

  // Returns name of the class which inherited this method.
  private getClassName()
  {
    // (.*) matches any number of any characters.
    let classNameRegex = /class (.*) extends (.*)/;

    // this.constructor.toString() is something like:
    // 'class GameEntity extends something'
    // We want to grab 'GameEntity part of it.
    //   Note: It will probably only work for classes that extend something,
    // but this functionality is only available to classes that extend
    // NamedClass so it will always by true.

    // results[0] will be whole matched string,
    // results[1] will be first string matched by (.*) - that's our class
    // name.
    let results = classNameRegex.exec(this.constructor.toString());

    ASSERT_FATAL(results !== null && results.length > 1,
      "Unable to extract class name");

    return (results && results.length > 1) ? results[1] : "";
  }
}
