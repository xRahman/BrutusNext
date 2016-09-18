/*
  Part of BrutusNEXT

  Allows instantiation of classes in runtime.
*/

'use strict';

import {initDynamicClasses} from '../shared/DynamicClasses.ts';
import {ERROR} from '../shared/error/ERROR.ts';
import {FATAL_ERROR} from '../shared/error/FATAL_ERROR.ts';

export class ClassFactory
{
  // Hashmap<[ string, Class ]>
  //   Key: class name
  //   Value: constructor of the class
  private dynamicClasses = new Map();

  constructor()
  {
    initDynamicClasses(this.dynamicClasses);
  }

  // ---------------- Public methods --------------------

  public classExists(className: string): boolean
  {
    return this.dynamicClasses.has(className);
  }

  public registerClass(className: string, Class)
  {
    let isClassNameValid = className !== ""
                   && className !== null
                   && className !== undefined;
    
    if (!isClassNameValid)
    {
      ERROR("Attemt to register Class with invalid className");
      return;
    }

    if (Class === null || Class === undefined)
    {
      ERROR("Attemt to register invalid Class '" + className + "'");
      return;
    }

    if (this.dynamicClasses.has(className))
    {
      ERROR("Attempt to register class '" + className + "'"
        + " that is already registered in ClassFactory");
      return;
    }

    // Add Class to hashmap under the key 'className'.
    this.dynamicClasses.set(className, Class);
  }

  public getClass(className: string)
  {
    let Class = this.dynamicClasses.get(className);

    if (Class === undefined)
    {
      FATAL_ERROR("Attempt to request a nonexistent dynamic"
      + " class '" + className + ". Maybe you forgot to add"
      + " your new class to DynamicClasses.ts?");
    }

    return Class;
  }

  // Creates a new instance of type className.
  // Usage example:
  //   let instance = classFactory.createInstance('Account', Acount);
  public createInstance<T>
  (
    param:
    {
      className: string,
      // This hieroglyph stands for constructor of a class, which in
      // in javascript represent the class itself (so this way you can
      // pass type as a parameter).
      typeCast: { new (...args: any[]): T }
    },
    // Any extra arguments will be passed to the class constructor.
    ...args: any[]
  )
  {
    let isClassNameValid = param.className !== undefined
                        && param.className !== null
                        && param.className != "";

    if (!isClassNameValid)
    {
      ERROR("Invalid class name. Instance is not created");
      return null;
    }

    let Class = this.getClass(param.className);

    if (Class === undefined)
      // Error is already reported by getClas().
      return null;

    let instance = new Class(...args);

    // Dynamic type check - we make sure that our newly created instance
    // is inherited from requested class or is an instance of that class.
    if (instance instanceof param.typeCast)
      // Here we typecast to <any> in order to pass newObject
      // as type T (you can't typecast directly to template type but you can
      // typecast to <any> which is then automatically cast to template type).
      return <any>instance;

    ERROR("Type cast error: Newly created instance of"
      + " class '" + param.className + "' is not an instance"
      + " of requested type (" + param.typeCast.name + ")");

    return null;
  }
}
