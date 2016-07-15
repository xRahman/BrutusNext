/*
  Part of BrutusNEXT

  Unique identifier.

  Use 'null' as a 'not pointing anywhere' id value. Id can be invalid
  even if it's not null, for example when it's pointing to an object
  which has already been deleted.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {SaveableObject} from '../shared/SaveableObject';
import {IdableSaveableObject} from '../shared/IdableSaveableObject';

export class Id extends SaveableObject
{
  // Direct reference to object attached to this id.
  // It's used for faster performance - you should always hold ids instead of
  // direct references, but you can use id.getObject() to get your reference
  // directly without the need to search for string value of id in your
  // object container.
  protected directReference: IdableSaveableObject = null;
  // Do not save variable 'directReference'.
  protected static directReference = { isSaved: false };

  // stringId is a unique string.
  // type is the name of the class this id points to.
  constructor
  (
    protected stringId: string,
    // Type of object referenced by this id.
    protected type: string,
    // Direct reference to object attached to this id.
    // It's used for faster performance - you should always hold ids instead of
    // direct references, but you can use id.getObject() to get your reference
    // directly without the need to search for string value of id in your
    // object container.
    object: IdableSaveableObject
  )
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    // Parameter 'object' will be undefined if constructor is called
    // dynamically (that happens when loading from file). In that case
    // we will leave it at default value (which is 'null').
    if (object !== undefined)
      this.directReference = object;
  }

  // Sets referencedObject to null. This must be called when you delete
  // object referenced by this id.
  public invalidate()
  {
    ASSERT(this.directReference !== null,
      "Attempt to invalidate id which is already invalid.");

    this.directReference = null;
  }

  /*
  // Returns direct reference to object identified by this id.
  // If this reference is null (for example if referenced object
  // hasn't been created yet or if it has already been deleted),
  // fatal assert is triggered (so you know that you have referenced
  // something invalid).
  public getObject()
  {
    ASSERT_FATAL(this.referencedObject !== null,
      "Attempt to reference a SaveableObject of type '"
      + this.type + "', which is not available.");

    return this.referencedObject;
  }
  */

  public getStringId() { return this.stringId; }
  public getType() { return this.type; }

  public equals(operand: Id)
  {
    ASSERT(operand.stringId !== "", "Attempt to compare to an invalid id");
    ASSERT(this.stringId !== "", "Attempt to compare an invalid id");

    if (this.stringId !== operand.stringId)
      return false;

    return true;
  }

  // -------------- Protected class data ----------------

}