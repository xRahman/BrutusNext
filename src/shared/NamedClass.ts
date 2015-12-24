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

  public className = "NamedClass";

  // Returns name of the class which inherited this method.
  private getClassName()
  {
    ///let funcNameRegex = /function (.{1,})\(/;
    let classNameRegex = /class (.*) extends (.*)/;
///    let results = (funcNameRegex).exec((<any>this).constructor.toString());

    let results = classNameRegex.exec(this.constructor.toString());

    ASSERT_FATAL(results !== null && results.length > 1,
      "Unable to extract class name");

    return (results && results.length > 1) ? results[1] : "";
  }
}
