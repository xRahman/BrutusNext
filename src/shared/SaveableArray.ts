/*
  Part of BrutusNEXT

  Array of saveable objects that saves and loads them correctly.
*/

/*
  Usage: See usage of SaveableContainer.

  Note:
    You only need SaveableArray if you want to save Objects that
    are not of primitive types. Array<number> will save and load
    perfectly well. If you need Array<Id>, however, you have to
    use myArray: SaveableArray<Id> = new SaveableArray<Id>(Id);
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';

export class SaveableArray<T extends SaveableObject> extends Array
{
  constructor(private myItemConstructor)
  {
    super();
  }

  // Overrides SaveableObject::saveToJsonObject() because we need different
  // functionality here (only save properties that are SaveableObjects).
  protected saveToJsonObject(): Array<any>
  {
    let jsonObject: Array<any> = [];

    for (let i = 0; i < this.length; i++)
    {
      if (this.isToBeSaved(this[i]))
      {
        jsonObject.push(this[i].saveToJsonObject());
      }
      else
      {
        jsonObject.push(this[i]);
      }
    }

    return jsonObject;
  }

  protected isToBeSaved(property: any): boolean
  {
    if
    (
      property !== null
      && typeof property === 'object'
      && 'saveToJsonObject' in property
    )
    {
      return true;
    }

    return false;
  }

  protected loadFromJsonObject(jsonObject: Array<any>, filePath: string)
  {
    // Using 'in' operator on object with null value would crash the game.
    ASSERT_FATAL(jsonObject !== null,
      "Invalid json object loaded from file " + filePath);

    for (let i = 0; i < jsonObject.length; i++)
    {
      let item: SaveableObject = new this.myItemConstructor();

      // Access by property name is used, because loadFromJsonObject
      // is protected and we are not extended from SaveableObject, because
      // we need to extend Array. The other option would be to make it
      // public, which would be quite strange. So this hack is probably the
      // lesser of two evils.
      this.push(item['loadFromJsonObject'](jsonObject[i], filePath))
    }
  }
}