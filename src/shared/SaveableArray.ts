/*
  Part of BrutusNEXT

  Array of saveable objects that saves and loads them correctly.
*/

/*
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

  // This needs to be set in order to actualy get saved.
  public isSaved = true;

  protected saveToJsonObject(): Array<any>
  {
    let jsonObject: Array<any> = [];

    for (let i = 0; i < this.length; i++)
    {
      if (this[i] === null)
      {
        jsonObject.push(null);
      }
      else  // Property is not null.
      {
        ASSERT_FATAL
        (
          typeof this[i] === 'object' && 'saveToJsonObject' in this[i],
          "There is an item in SaveableArray that is not a SaveableObject."
          + " That's not allowed."
        );

        if (this[i].isSaved === true)
        {
          jsonObject.push(this[i].saveToJsonObject());
        }
        else
        {
          // This means that members of SaveableArray which with 'isSaved'
          // set to false will be saved (and also loaded) as 'null'.
          jsonObject.push(null);
        }
      }
    }

    return jsonObject;
  }

  protected loadFromJsonObject(jsonObject: Array<any>, filePath: string)
  {
    // Using 'in' operator on object with null value would crash the game.
    ASSERT_FATAL(jsonObject !== null,
      "Invalid json object loaded from file " + filePath);

    for (let i = 0; i < jsonObject.length; i++)
    {
      if (jsonObject[i] === null)
      {
        this.push(null);
      }
      else
      {
        let item = new this.myItemConstructor();

        // Access by property name is used to call item.loadFromJsonObject(),
        // because loadFromJsonObject is protected and we are not extended from
        // SaveableObject, because we need to extend type Array. The other
        // option would be to make it public, which would be quite strange. So
        // this hack is probably the lesser of two evils.
        item['loadFromJsonObject'](jsonObject[i], filePath);

        this.push(item);
      }
    }
  }
}