/*
  Part of BrutusNEXT

  Class that can instantiate even its non-primitive properties.
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';

export class InstantiableClass
{
  public instantiateProperties()
  {
    // Recursively instantiate non-primitive
    // properties of this instance.
    this.instantiate(this);
  }

  private instantiate(object: any)
  {
    // Instantiate all properties, including those on prototype.
    for (let property in object)
      this.instantiateProperty(object, property); 
  }

  private instantiateProperty(object: any, property: string)
  {
    if (object[property] === undefined)
    {
      ERROR("Unable to instantiate property " + property
        + " because it is not present on object that is"
        + " being instantiated");
      return;
    }

    // Object.create() will create a new {}, which will have
    // object[property] as it's prototype. We then assign this
    // new empty object instead of original property of object.
    object[property] = Object.create(object[property]);

    // Property we have just instantiated may have it's own
    // non-primitive properties that also need to be instantiated.
    this.instantiate(object[property]);
  }
}
