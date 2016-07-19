/*
  Part of BrutusNEXT

  Enables using static attributes for class properties.
*/

/*
  Static property attributes are created by declaring static property of the
  same name and assigning an object containing required attributes to it.

  Example:

  class MyClass
  {
    protected counter = 0;
    protected static counter = { isSaved: false };
  }
*/


'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';

export class AttributableClass extends NamedClass
{
  // This is a hack allowing descendants of AttributableClass to search for
  // static properties of their ancestors.
  protected getThis() { return this; }

  protected getPropertyAttributes(instance: any, property: string)
  {
    // This trick dynamically accesses static class property without
    // the need to use something like NamedClass.property;
    // (instance.constructor[property] is the same as if you could
    //  write (typeof(istance)).property)
    if (instance.constructor[property] !== undefined)
      return instance.constructor[property];

    // If our static property is not found on instance, it can still
    // exist on some of it's ancestors.
    if
    (
      instance !== undefined
      && instance !== null
      && instance.getPropertyAttributes !== undefined
      && super.getThis() !== null
    )
    {
      // We need to pass super.getThis() as a parameter, because our ancestor's
      // method would see our static properties on this.constructor[property]
      // otherwise.
      return instance.getPropertyAttributes(super.getThis(), property);
    }
    else
    {
      return undefined;
    }
  }
}

/*
/// Nakonec asi takhle ne.

Pujde to jinak - staticka promenna s atributama vedle obyc prommene, napr:

class Room
{
  protected exits = new Exits();
  protected static exits = { isEditable: true };
}

Zneuziju na to trik, jak se dynamicky dostat na statickou promennou tridy:
this.constructor['exits'].isEditable;

Problem je, jak se dostat ke statickym properties predku. Asi nejak takhle:

protected getPropertyAttributes(instance: any, property: string)
{
  if (instance.constructor[property] !== undefined)
    return instance.constructor[property];

  // We need to pas super as a parameter, because our ancestor's method
  // would see our static properties on this.constructor[property], not
  // his.

  if (super !== undefined)
    return super.getPropertyAttributes(super, property);
  else
    return undefined;
}

// Cycle through all properties in this object.
for (let property in this)
{
  let attributes = this.getPropertyAttributes(this, property);

  if (attributes !== undefined)
  {
    // muzeme vesele cist atributy a editovat podle nich this[property]
  }
}

*/

/*
'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {NamedClass} from '../shared/NamedClass';

export class ClassAttributes extends NamedClass
{
  public static set(className: string, attributes: Object)
  {
    ClassAttributes.data[className] = attributes;
  }

  // Returns undefined if requested attribute doesn't exist.
  public static getAttribute
  (
    className: string,
    property: string,
    attribute: string
  )
  {

    ///// Asi budu radsi vracet undefined, aby se daly vyhazovat chybove hlasky,
    ///// ze kterych pujde poznat, kde nastala chyba (treba ze jsi zapomnel
    ///// definovat rozsah povolenych hodnot). Kdyby byly asserty tady,
    ///// tak by nic nerikaly.

    //ASSERT_FATAL(classAttributes !== undefined,
    //  "Attempt to access nonexisting property attributes of"
    //  + " class '" + this.className + "'");

    //ASSERT_FATAL
    //(
    //  classAttributes[property] !== undefined,
    //  "Attempt to access nonexisting attributes of property"
    //  + " '" + property + "' of class '" + this.className + "'"
    //);

    //ASSERT_FATAL
    //(
    //  classAttributes[property][attribute] !== undefined,
    //  "Attempt to access nonexisting attribute '" + attribute + "' of property"
    //  + " '" + property + "' of class '" + this.className + "'"
    //);


    
    //// this.constructor[property] is a trick to access static property
    //// of this class named property ( e. g. the same as ThisClass.property)
    //let propertyAttributes = this.constructor[property];

    //if (propertyAttributes === undefined)
    //  return undefined;
    

    let classAttributes = ClassAttributes.data[className];

    if (classAttributes === undefined)
      return undefined;

    let propertyAttributes = classAttributes[property];

    if (propertyAttributes === undefined)
      return undefined;

    return propertyAttributes[attribute];
  }

  public static setAttribute
  (
    className: string,
    property: string,
    attribute: string,
    value: any
  )
  {
    ASSERT_FATAL
    (
      property !== null && property !== undefined && property !== "",
      "Attempt to set attribute '" + attribute + "' for invalid"
      + " proprerty in class '" + className + "'"
    );

    ClassAttributes.data[className][property][attribute] = value;
  }

  private static data = {};

  
  ///// Nejspis nebude potreba
  //protected getAttributes(property: string)
  //{
  //  let classAttributes = AttributableClass.propertyAttributes[this.className];

  //  ASSERT_FATAL(classAttributes !== undefined,
  //    "Attempt to access nonexisting property attributes of"
  //    + " class '" + this.className + "'");

  //  ASSERT_FATAL(classAttributes[property] !== undefined,
  //    "Attempt to access nonexisting attributes of property"
  //    + " '" + property + "' of class '" + this.className + "'");

  //  return classAttributes[property];
  //}
  


  ///// Nejspis nebude potreba
  //protected getPropertyAttributes()
  //{
  //  let classAttributes = AttributableClass.propertyAttributes[this.className];

  //  ASSERT_FATAL(classAttributes !== undefined,
  //    "Attempt to access nonexisting property attributes of"
  //    + " class '" + this.className + "'");

  //  return classAttributes;
  //}

}
*/
