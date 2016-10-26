/*
  Part of BrutusNEXT

  Allows instantiation of classes in runtime.
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';
import {FATAL_ERROR} from '../shared/error/FATAL_ERROR';
import {DynamicClasses} from '../shared/DynamicClasses';
import {NamedClass} from '../shared/NamedClass';
import {DateRecord} from '../shared/fs/DateRecord';
import {Hashmap} from '../shared/fs/Hashmap';

export class ClassFactory
{
  // Hashmap<[ string, Class ]>
  //   Key: class name
  //   Value: constructor of the class
  private dynamicClasses = new Map();

  constructor()
  {
    DynamicClasses.init(this.dynamicClasses);
  }

  // ---------------- Public methods --------------------

  // Declares a new class named 'className' and inherited from
  // 'ancestorName' and set it's ['className'] property to
  // 'className'. Also registers the new class in classFactory.
  // -> Returns newly declared class (it's constructor) or null
  //    if creation failed.
  public createClass(className: string, ancestorName: string)
  {
    if (!this.isNameValid(className))
    {
      ERROR("Attempt to create class with invalid"
        + " class name. Class is not created");
      return null;
    }

    if (!this.isNameValid(ancestorName))
    {
      ERROR("Attempt to create class with invalid"
        + " ancestor name. Class is not created");
      return null;
    } 

    // Class that we want to create must not yet exist.
    if (this.classExists(className))
    {
      ERROR("Attempt to create class '" + className + "'"
        + " (with ancestor '" + ancestorName + "') that"
        + " already exists. Class is not created");
      return null;
    }

    // Dynamicaly create a new class using a script run on virtual machine.
    let NewClass = this.declareClass(className, ancestorName);

    return NewClass;
  }

  public classExists(className: string): boolean
  {
    return this.dynamicClasses.has(className);
  }

  public registerClass(className: string, Class)
  {
    if (!this.isNameValid(className))
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
      + " class '" + className + ". If it's a prototype class,"
      + " it needs to have a .json file in ./data/prototypes."
      + " If it's declared in source code, it needs to be listed"
      + " in DynamicClasses.ts");
    }

    return Class;
  }

  // Creates a new instance of type className.
  // Usage example:
  //   let instance = classFactory.createInstance('Account', Acount);
  public createInstance<T>
  (
    className: string,
    // This hieroglyph stands for constructor of a class, which in
    // in javascript represent the class itself (so this way you can
    // pass type as a parameter).
    typeCast: { new (...args: any[]): T },
    // Any extra arguments will be passed to the class constructor.
    ...args: any[]
  )
  {
    if (!this.isNameValid(className))
    {
      ERROR("Invalid class name. Instance is not created");
      return null;
    }

    let Class = this.getClass(className);

    if (Class === undefined)
      // Error is already reported by getClas().
      return null;

    let instance = new Class(...args);

    // Dynamic type check - we make sure that our newly created instance
    // is inherited from requested class or is an instance of that class.
    if (instance instanceof typeCast)
      // Here we typecast to <any> in order to pass newObject
      // as type T (you can't typecast directly to template type but you can
      // typecast to <any> which is then automatically cast to template type).
      return <any>instance;

    /// TODO: Typecast.name nemusi existovat (u dynamicky vytvorenych class, coz
    ///   jsou vsechny prototypy).
    /// - nebo mozna jo? Zkontrolovat
    ERROR("Type cast error: Newly created instance of"
      + " class '" + className + "' is not an instance"
      + " of requested type (" + typeCast.name + ")");

    return null;
  }

  // Creates a new DateRecord object.
  // (this method only exists to prevent circular importing
  //   of SaveableObject and DateRecord modules)
  public createDateRecord(date: Date)
  {
    return new DateRecord(date);
  }

  // Creates a new MapRecord object.
  // (this method only exists to prevent circular importing
  //   of SaveableObject and MapRecord modules)
  public createHashmap(map: Map<any, any>)
  {
    return new Hashmap(map);
  }

  // ---------------- Private methods -------------------

  private isNameValid(name: string): boolean
  {
    return name !== "" && name !== null && name !== undefined;
  }

  private declareClass(className: string, ancestorName: string)
  {
    // If the type of Ancestor variable doesn't make sense to you,
    // it's because it really doesn't make sense. It's type is
    // a constructor of that class, but we don't have no way to know
    // what class that is here, so we use NamedClass as return Value
    // which is a class so it satistfied Typescript's type checking.
    // (This little hack is needed so Typescript will let us dynamically
    // declare a new class extended from Ancestor).  
    let Ancestor: { new (...args: any[]): NamedClass } =
      this.getClass(ancestorName); 

    // Ancestor class must exist.
    if (Ancestor === undefined)
    {
      ERROR("Attempt to create class '" + className + "' inherited"
        + " from nonexisting ancestor class '" + ancestorName + "'."
        + " Class is not created");
      return null;
    }

    /// DEBUG:
    console.log("Declaring class '" + className + "'");

    // Note that dynamically declared class can't have a name
    // (that's why we are not using constructor.name but rather our own
    //  property 'className'. See NamedClass::className for details).
    let NewClass = class extends Ancestor { };

    if (NewClass === undefined)
    {
      ERROR("Failed to declare new class (" + className + ")");
      return null;
    }

    // This overrides static accessor 'className' inherited from
    // NamedClass, which is necessary, because that accessor returns
    // constructor.name, which is undefined for dynamically declared
    // class (and the property is locked against changing so it cannot
    // be set by any means).
    NewClass[NamedClass.CLASS_NAME_PROPERTY] = className;

    // Registers newly created class in classFactory.
    // Prints error message if we failed to create the class.
    this.registerClass(className, NewClass);

    return NewClass;
  }
}
