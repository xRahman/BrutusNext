/*
  Part of Kosmud

  Entity is an object that:
  - has a unique id
  - can be serialized and deserialized
  - can be inherited from another entity using
    true prototypal inheritance

  True prototypal inheritance means that an instance
  is created using Object.create() so it is just an
  empty {} with no own properties and that all it's
  nonprimitive properties are also instantiated using
  Obect.create() against the matching property on the
  prototype entity.
    This way all properties inicialized on prototype
  entity by it's constructor or direct inicialization
  in class body in typescript class will actually be
  set to prototype object, not the instance. Properties
  set to the instance will also never modify the prototype
  (unlinke in javascript prototypal inheritance where
  nonprimitive properties of the instance are references
  to the matching properties on the prototype so writing
  to them actually modifies the prototype object instead
  of creating own propety on the instance).
*/

import { Types } from "../../Shared/Utils/Types";
import { ID, PROTOTYPE_ID, Serializable } from
  "../../Shared/Class/Serializable";

const MISSING_ID = "<missing id>";
const MISSING_NAME = "<missing name>";
const MISSING_PROTOTYPE_ID = "<missing prototype id>";

export class Entity extends Serializable
{
  // All entities are valid until deleted from Entities.
  private valid = true;

  private id = MISSING_ID;
  private name = MISSING_NAME;
  private prototypeId = MISSING_PROTOTYPE_ID;

  // --------------- Public methods ---------------------

  // This method is called when the entity is instantiated.
  public onInstantiation(): void
  {
    // Nothing here be default, can be overriden.
  }

  // ~ Overrides Serializable.get debugId().
  public get debugId(): string
  {
    if (!this.isValid())
      return `{ Reference to invalid (deleted) entity, id: ${this.id}}`;

    return `{ class: ${this.className}, name: ${this.name}, id: ${this.id} }`;
  }

  // ! Throws exception on error.
  public getId(): string
  {
    const hasOwnValidId =
         this.hasOwnProperty(ID)
      && this.id !== MISSING_ID
      && this.id !== undefined
      && this.id !== null
      && this.id !== "";

    // If we don't have own 'id' property, this.id would return
    // id of our prototype object (thanks to inheritance), which
    // is not our id (id has to be unique for each entity instance).
    if (!hasOwnValidId)
    {
      throw Error(`Attempt to get ${ID} of an entity which`
        + ` doesn't have an ${ID}. This must never happen, each`
        + ` entity must have a valid ${ID}"`);
    }

    return this.id;
  }

  // ! Throws exception on error.
  // Note: Id can only be set once.
  public setId(id: string): void
  {
    // We need to check if we have own property 'id'
    // (not just the one inherited from our prototype)
    // because if we don't, value of 'this.id' would be
    // that of our prototype.
    if (this.hasOwnProperty(ID) && this.id !== MISSING_ID)
    {
      throw Error(`Failed to set ${ID} of entity ${this.debugId}`
        + ` because it already has an ${ID}`);
    }

    this.id = id;

    if (!this.hasOwnProperty(ID))
    {
      throw Error(`Something is terribly broken - property`
        + `'${ID}' has probably been set to prototype object`
        + ` rather than to the instance`);
    }
  }

  // ! Throws exception on error.
  // 'prototypeId' can only be set along with 'id' (which
  // can only be set once) to prevent changing it without
  // changing the prototype chain.
  public setIds(id: string, prototypeId: string): void
  {
    // ! Throws exception on error.
    this.setId(id);

    this.prototypeId = prototypeId;

    if (!this.hasOwnProperty(PROTOTYPE_ID))
    {
      throw Error(`Something is terribly broken - property`
        + `'${PROTOTYPE_ID}' has probably been set to prototype`
        + ` object rather than to the instance`);
    }
  }

  public getName(): string { return this.name; }
  public setName(name: string): void { this.name = name; }

  public isValid(): boolean { return this.valid; }

  // Invalidates all properties so any further access to this
  // entity will throw an exception.
  public invalidate(): void
  {
    invalidateProperties(this);
    this.valid = false;
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------
}

// ----------------- Auxiliary Functions ---------------------

function invalidateProperties(object: object): void
{
  // Objects can have property "_handlers" (which is of
  // type EventHandlers) that doesn't have 'hasOwnProperty()'
  // method. Trying to invalidate such object would cause
  // crash (and it's not needed anyways).
  if (object.hasOwnProperty === undefined)
    return;

  for (const propertyName in object)
  {
    if (object.hasOwnProperty(propertyName))
    {
      invalidateProperty((object as any)[propertyName]);

      // Yes, deleting dynamically computed properties really is
      // dangeours, but we are intentionally deleting all properties
      // of this entity here so they will be 'undefined' and any attempt
      // to access them will throw an error.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (object as any)[propertyName];
    }
  }

  // Set 'null' to the prototype of 'object'.
  // (Object.setPrototypeOf() slows down any code that accesses
  //  object with modified prototype but that's ok here because
  //  we are just making sure that any access to 'object' ends
  //  with an exception.)
  // tslint:disable-next-line:no-null-keyword
  Object.setPrototypeOf(object, null);

  // And finaly freeze the entity so it's impossible to
  // write to it's properties either (or change them in
  // any way for that matter).
  Object.freeze(object);
}

function invalidateProperty(property: any): void
{
  if (property !== null && property !== undefined)
    return;

  // Skip properties of primitive type because they don't
  // have any properties.
  if (Types.isPrimitiveType(property))
    return;

  // Also skip references to other entities
  // (we definitely don't want to invalidate their properities).
  if (property[ID] !== undefined)
    return;

  // If property is a native javascript array, clear it.
  if (Types.isArray(property))
  {
    property.length = 0;
    return;
  }

  // If property is a Map() or Set(), clear it.
  if (Types.isMap(property) || Types.isSet(property))
  {
    property.clear();
    return;
  }

  // Only invalidate properties of plain objects and Serializables
  // (this prevents attempts to invalidate properties of WebSocket
  //  and similar object which leads to crashes - not to mention
  //  that there is no real need to do it).
  if (!(Types.isSerializable(property) || Types.isPlainObject(property)))
    return;

  // Recursively invalidate property's properties.
  invalidateProperties(property);
}