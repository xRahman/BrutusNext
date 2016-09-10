/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

'use strict';

import {ERROR} from '../shared/ERROR';
import {FATAL_ERROR} from '../shared/FATAL_ERROR';
import {Entity} from '../shared/Entity';
import {NamedClass} from '../shared/NamedClass';
import {AttributableClass} from '../shared/AttributableClass';
import {FileSystem} from '../shared/fs/FileSystem';
import {Mudlog} from '../server/Mudlog';
import {Server} from '../server/Server';

let beautify = require('js-beautify').js_beautify;

export class SaveableObject extends AttributableClass
{
  public static get DYNAMIC_CLASSES_PROPERTY() { return 'dynamicClasses'; }

  // -------------- Protected class data ----------------

  // Version will be checked for. Default behaviour is to trigger
  // an ERROR when versions don't match. You can override it
  // by overriding a checkVersion() method;
  protected version = 0;

  // Buffer to stack save requests issued while already saving ourselves.
  // Also serves as lock - if it's not null, it means we are already saving
  // ourselves.
  // (note: This property is not saved)
  protected saveRequests: Array<string> = [];
  protected static saveRequests = { isSaved: false };

  // ---------------- Public methods --------------------

  /// TODO: P?esunout tohle do DynamicClassFactory
  // Creates a new instance of type className.
  public static createInstance<T>
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
    let classNameIsValid = param.className !== undefined
                        && param.className !== null
                        && param.className != "";

    if (!classNameIsValid)
    {
      ERROR("Invalid class name passed to SaveableObject.createInstance()."
        + " Instance is not created");
      return null;
    }

    // We will use global object to acces respective class constructor.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];

    if (dynamicClasses[param.className] === undefined)
    {
      ERROR("Attempt to createInstance() of unknown type"
        + " '" + param.className + "'. You probably forgot"
        + " to create or assign a prototype to your game"
        + " entity or add a new class to DynamicClasses.ts."
        + " Instance is not created");
      return null;
    }

    // This accesses a class constructor by it's name. Consctructor of
    // each class that is supposed to be dynamically loaded here needs
    // to be added to global.dynamicClasses - this is done when prototype
    // class is dynamically created.
    let newObject = new dynamicClasses[param.className](...args);

    // Dynamic type check - we make sure that our newly created object
    // is inherited from requested class (or an instance of the class itself).
    if (newObject instanceof param.typeCast)
      // Here we typecast to <any> in order to pass newObject
      // as type T (you can't typecast directly to template type but you can
      // typecast to <any> which is then automatically cast to template type).
      return <any>newObject;

    ERROR("Type cast error: Newly created object "
      + "of type '" + param.className + "' is not an instance"
      + " of requested type (" + param.typeCast.name + ")");
    return null;
  }

  public async loadFromFile(filePath: string)
  {
    //  Unlike writing the same file while it is saving, loading from
    //  the same file while it is loading is not a problem (according
    //  to node.js filestream documentation). So we don't need to bother
    //  with loading locks.

    // Asynchronous reading from the file.
    // (the rest of the code will execute only after the reading is done)
    //jsonString = await promisifiedFS.readFile(filePath, 'utf8');
    let jsonString = await FileSystem.readFile(filePath);

    // filePath is passed just so it can be printed to error messages.
    this.loadFromJsonString(jsonString, filePath);
  }

  public async saveToFile(directory: string, fileName: string)
  {
    let directoryIsValid = directory !== undefined
                        && directory !== null
                        && directory !== "";

    if (!directoryIsValid)
    {
      ERROR("Invalid 'directory' parameter when saving"
        + " class " + this.className + "." + " Object is"
        + " not saved");
      return;
    }

    let filenameIsValid = fileName !== undefined
                       && fileName !== null
                       && fileName !== "";

    if (filenameIsValid)
    {
      ERROR("Invalid 'fileName' parameter when saving"
        + " class " + this.className + ". Object is not"
        + " saved");
      return;
    }

    if (directory.substr(directory.length - 1) !== '/')
    {
      ERROR("Error when saving class " + this.className + ":"
        + " Directory path '" + directory + "' doesn't end with"
        + "  '/ '. Object is not saved");
      return;
    }

    // Directory might not yet exist, so we better make sure it does.
    await FileSystem.ensureDirectoryExists(directory);
    await this.saveContentsToFile(directory + fileName);
  }

  // -------------- Protected methods -------------------

  protected checkVersion(jsonObject: Object, filePath: string): boolean
  {
    if (!('version' in jsonObject))
    {
      ERROR("Missing 'version' property in JSON data"
        + " in file " + filePath);
      return false;
    }

    if (jsonObject['version'] !== this.version)
    {
      ERROR("Version of JSON data (" + jsonObject['version'] + ")"
        + " in file " + filePath + " doesn't match required"
        + " version (" + this.version + ")");
      return false;
    }

    return true;
  }

  // Override this method if you need to load property of nonstandard type.
  // (see class Flags for example)
  protected loadPropertyFromJsonObject
  (
    jsonObject: Object,
    propertyName: string,
    filePath: string
  )
  {
    this[propertyName] = this.loadVariable
    (
      propertyName,
      this[propertyName],
      jsonObject[propertyName],
      filePath
    );
  }

  // Override this method if you need to save property of nonstandard type.
  // (see class Flags for example)
  protected savePropertyToJsonObject(jsonObject: Object, propertyName: string)
  {
    jsonObject[propertyName] =
      this.saveVariable(this[propertyName], propertyName, this.className);
  }

  // --------------- Private methods --------------------

  private async saveContentsToFile(filePath: string)
  {
    // If we are already saving ourselves, the request will be added
    // to the buffer and processed after ongoing saving ends.
    if (this.bufferSaveRequest(filePath))
      return;
    
    // If we are not saving ourselves right now, process buffered requests.

    // Asynchronous saving to file.
    // (the rest of the code will execute only after the saving is done)
    await this.processBufferedSavingRequests();

    // All save requests are processed, mark the buffer as empty.
    // (if will also hopefully flag allocated data for freeing from memory)
    this.saveRequests = [];
  }

  private loadFromJsonString(jsonString: string, filePath: string)
  {
    let jsonObject = {};

    try
    {
      jsonObject = JSON.parse(jsonString);
    }
    catch (e)
    {
      // Here we need fatal error, because data might already
      // be partialy loaded so we could end up with broken entity.
      FATAL_ERROR("Syntax error in JSON string: "
        + e.message + " in file " + filePath);
      return;
    }

    // filePath is passed just so it can be printed to error messages.
    this.loadFromJsonObject(jsonObject, filePath);
  }

  private saveToJsonString(): string
  {
    let jsonString = JSON.stringify(this.saveToJsonObject());

    jsonString = beautify
    (
      jsonString,
      {
        "indent_size": 2,
        "indent_char": " ",
        "eol": "\n",
        "brace_style": "expand",
        "keep_array_indentation": true,
        "end_with_newline": false
      }
    );

    return jsonString;
  }

  private loadFromJsonObject(jsonObject: Object, filePath: string)
  {
    // 'filePath' is passed just so it can be printed to error messages.
    if (!this.checkVersion(jsonObject, filePath))
      return;

    // 'className' must be the same as it's saved value.
    this.checkClassName(jsonObject, filePath);

    // Using 'in' operator on object with null value would cause crash.
    if (jsonObject === null)
    {
      // Here we need fatal error, because data might already
      // be partialy loaded so we could end up with broken entity.
      FATAL_ERROR("Invalid json object loaded from file " + filePath);
    }

    // Now copy the data.
    for (let propertyName in jsonObject)
    {
      // Property 'className' will not be assigned (it's read-only
      // and static so it wouldn't make sense anyways), but we will
      // check that we are loading ourselves into a class with matching
      // className.
      if (propertyName === NamedClass.CLASS_NAME_PROPERTY)
      {
        if (this.className === undefined)
        {
          FATAL_ERROR("Loading object with saved"
            + " '" + NamedClass.CLASS_NAME_PROPERTY + "'"
            + " property into an instance that doesn't have"
            + " a '" + NamedClass.CLASS_NAME_PROPERTY + "'"
            + " property. This should never happen");
        }

        if (jsonObject[propertyName] === this.className)
        {
          FATAL_ERROR("Loading object with"
            + " '" + NamedClass.CLASS_NAME_PROPERTY + "'"
            + " property saved as '" + jsonObject[propertyName] + "'"
            + " into an instance with '" + NamedClass.CLASS_NAME_PROPERTY + "'"
            + " " + this.className + ". This should never happen, types must"
            + " match");
        }
      }
      else
      {
        this.loadPropertyFromJsonObject(jsonObject, propertyName, filePath);
      }
    }
  }

  private saveToJsonObject(): Object
  {
    let jsonObject: Object = {};

    // A little hack - save 'name' property first (out of order)
    // to make saved JSON files more readable.
    if ('name' in this)
    {
      jsonObject['name'] = this['name'];
    }

    // Anoter hack - save 'className' property.
    // (We need to save 'className' maually, because it is an accessor,
    // so it's not enumerable - which means that it won't get iterated
    // over in following cycle that iterates properties.)
    let className = this.className;

    if (className === undefined)
    {
      FATAL_ERROR("Attempt to save a SaveableObject that doesn't"
        + " have a " + NamedClass.CLASS_NAME_PROPERTY + " property."
        + " I'd like to know how did you manage to do it - SaveableObject"
        + " is inherited from NamedClass which does have it");
    }

    jsonObject[NamedClass.CLASS_NAME_PROPERTY] = className;

    // Cycle through all properties in this object.
    for (let property in this)
    {
      // Skip 'name' property because it's already saved thanks to
      // previous hack.
      // (this.isSaved() checks static attribute property.isSaved)
      // (className is passed only for more specific error messages)
      if (property !== 'name' && this.isSaved(property, className))
      {
        this.savePropertyToJsonObject(jsonObject, property);
      }
    }

    return jsonObject;
  }

  private checkClassName (jsonObject: Object, filePath: string)
  {
    if (!(NamedClass.CLASS_NAME_PROPERTY in jsonObject))
    {
      FATAL_ERROR("There is no '" + NamedClass.CLASS_NAME_PROPERTY + "'"
        + " property in JSON data in file " + filePath);
    }

    if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] !== this.className)
    {
      FATAL_ERROR("Attempt to load JSON data of class"
        + " (" + jsonObject[NamedClass.CLASS_NAME_PROPERTY] + ")"
        + " in file " + filePath + " into instance of incompatible"
        + " class (" + this.className + ")");
    }
  }

  private async processBufferedSavingRequests()
  {
    for (let i = 0; i < this.saveRequests.length; i++)
    {
      // Save ourselves to json string each time we are saving ourselves,
      // because our current stat might change while we were saving (remember
      // this is an async function so next step in this for cycle will be
      // processed only after the previous saving ended).
      let jsonString = this.saveToJsonString();

      // Asynchronous saving to file.
      // (the rest of the code will execute only after the saving is done)
      await FileSystem.writeFile(this.saveRequests[i], jsonString);
    }
  }

  // Returns true when request is buffered and there is no need to process
  // it right now.
  private bufferSaveRequest(filePath: string): boolean
  {
    // saveRequests serves both as buffer for request and as lock indicating
    // that we are already saving something (it it contains something).
    if (this.saveRequests.length !== 0)
    {
      // Saving to the same file while it is still being saved is not safe
      // (according to node.js filestream documentation). So if this occurs,
      // we won't initiate another save at once, just remember that a request
      // has been issued (and where are we supposed to save ourselves).

      // Only push requests to save to different path.
      // (there is no point in future resaving to the same file multiple times)
      if (this.saveRequests.indexOf(filePath) !== -1)
        this.saveRequests.push(filePath);

      return true;
    }

    // If saving is not going on right now, push the request to the
    // buffer,
    this.saveRequests.push(filePath);

    // and return false to indicate, that it needs to be processed right away.
    return false;
  }

  // Loads a property of type Array from a JSON Array object.
  private loadArray
  (
    propertyName: string,
    jsonArray: Array<any>,
    filePath: string
  )
  {
    // We know the length of the array we are going to populate.
    let newArray = new Array(jsonArray.length);

    for (let i = 0; i < jsonArray.length; i++)
    {
      // 'item' needs to be set to null prior to calling loadVariable(),
      // so an instance of the correct type will be created.
      let item = null;

      item = this.loadVariable
      (
        "Array Item",
        item,
        jsonArray[i],
        filePath
      );

      newArray.push(item);
    }

    return newArray;
  }

  // Loads a single variable from JSON object.
  private loadVariable
  (
    variableName: string,
    variable: any,
    jsonVariable: any,
    filePath: string
  )
  : any
  {
    // First handle the case that property in JSON has null value. In that
    // case our property also needs to be null, no matter what type it is.
    if (jsonVariable === null)
      return null;

    if (this.isEntityReference(jsonVariable))
    {
      // Entity reference is loaded by EntityManager,
      // because we need to check if such entity already
      // exists. An existing entity proxy is returned in
      // such case. An an 'invalid entity' proxy is created
      // and returned otherwise.
      return this.loadReferenceFromJsonObject
      (
        variableName,
        variable,
        filePath
      );
    }

    if
    (
      Array.isArray(jsonVariable)
      // Hashmaps (class Map) are saved as array but we need them
      // to load as non-array variable.
      && !this.isMap(variable)
    )
    {
      if (variable !== null && !Array.isArray(variable))
      {
        ERROR("Attempt to load array property '" + variableName + "'"
          + " to a non-array property");
      }

      return this.loadArray(variableName, jsonVariable, filePath);
    }
    
    return this.loadNonArrayVariable
    (
      variableName,
      variable,
      jsonVariable,
      filePath
    );
  }

  // If myProperty is null, a new instance of correct type will be
  // created and returned (type is read from jsonObject.className).
  private createNewIfNull
  (
    propertyName: string,
    myProperty: any,
    jsonObject: Object,
    filePath: string
  )
  {
    if (myProperty === null)
    {
      if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] === undefined)
      {
        // If there isn't a 'className' property in jsonObject,
        // property is a basic javascript object.
        // Note:
        //   This doesn't always have to be true and it will lead to
        // errors if someone creates a new class not inherited
        // from SaveableObject and puts it in saveable class - it will
        // get loaded, but it won't have correct type (it will be just
        // a basic javascript object).
        myProperty = {};
      }
      else
      {
        // If there is a 'className' property, create a new instance
        // of such type.
        myProperty = SaveableObject.createInstance
        (
          {
            className: jsonObject[NamedClass.CLASS_NAME_PROPERTY],
            typeCast: SaveableObject
          }
        );
      }
    }

    return myProperty;
  }

  private loadObjectVariable
  (
    propertyName: string,
    myProperty: any,
    jsonObject: any,
    filePath: string
  )
  : any
  {
    // If our corresponding property is null, it wouldn't be able to
    // load itself from JSON, because you can't call methods on null
    // object. So we first need to assign a new instance of correct
    // type to it - the type is saved in JSON in 'className' property.
    myProperty = this.createNewIfNull
    (
      propertyName,
      myProperty,
      jsonObject,
      filePath
    );

    // Now we are sure that myProperty isn't null (either it wasn't
    // null or we have just assigned a new instance of correct type in
    // it). So we can safely load it from corresponding JSON.

    if (this.isMap(myProperty))
    {
      // When we are loading instance of class Map, data are actually
      // saved as array of [key, value] pairs and we need to recreate
      // our Map object from it.

      // But first we need to properly load items within this array,
      // because they may be SaveableObjects and simple assigning
      // wouldn't be enough.
      let tmpArray = this.loadArray(propertyName, jsonObject, filePath);

      return new Map(tmpArray);
    }

    if ('loadFromJsonObject' in myProperty)
    {
      // If we are loading into a saveable object, do it using it's
      // loadFromJsonObject() method.
      myProperty.loadFromJsonObject(jsonObject, filePath);

      return myProperty;
    }

    // We are loading object that is neither Date, Map nor SaveableObject.
    return this.loadPrimitiveObjectFromJson
    (
      myProperty,
      jsonObject,
      filePath
    );
  }

  private loadPrimitiveVariable
  (
    propertyName: string,
    myProperty: any,
    jsonObject: any,
    filePath: string
  )
  : any
  {
    // Note: Date object is actually saved as value of primitive type
    // (string), not as an object.
    // In order to recognize that we are loading a date, we will check
    // the type of property we are loading the date to.
    // (This wouldn't work if value of Date property we are loading the
    //  date to would be <null> - which is why it's not allowed to assign
    //  <null> to Date properties or initialize them with <null>)
    if (this.isDate(myProperty))
    {
      // Date object is not automatically created by JSON.parse(),
      // only it's string representation. So we need to pass the JSON
      // string representing value of date to a constructor of Date
      // object to convert it to Date object.
      return new Date(jsonObject);
    }

    // Actual primitive values are just directly assigned.
    return jsonObject;
  }

  private loadNonArrayVariable
  (
    propertyName: string,
    myProperty: any,
    jsonObject: any,
    filePath: string
  )
  : any
  {
    if (typeof jsonObject === 'object')
    {
      return this.loadObjectVariable
      (
        propertyName,
        myProperty,
        jsonObject,
        filePath
      );
    }
    else
    {
      return this.loadPrimitiveVariable
      (
        propertyName,
        myProperty,
        jsonObject,
        filePath
      );
    }
  }

  private saveMap(variable: any, description: string, className: string)
  {
    // When we are saving a Map object, we request it's contents
    // formated as array of [key, value] pairs by calling it's
    // .entries() method and then save this array as any regular
    // array (values can be another objects or arrays, so we need
    // to save it recursively).
    let mapContents = this.extractMapContents(variable);

    return this.saveArray(mapContents, description, className);
  }

  // Saves a property of type Array to a corresponding JSON Array object.
  private saveArray(array: Array<any>, arrayName: string, className: string)
  {
    let jsonArray = [];

    // Note: isSaved static attribute is not tested for members of an array.
    // Either the whole array is saved, or it's not saved at all. Having
    // 'holes' in an array after loading (probably with <null> values) would
    // certainly be confusing after all.
    for (let i = 0; i < array.length; i++)
    {
      let itemDescription = "an item of an array '" + arrayName + "'"
        + " at position " + i;
      jsonArray.push(this.saveVariable(array[i], itemDescription, className));
    }

    return jsonArray;
  }

  // Saves a single variable to a corresponding JSON object.
  // (description is a string used for error message. It should describe
  //  the property as well as possible - what's it's name, what it's in, etc.)
  private saveVariable(variable: any, description: string, className: string)
  {
    if (variable === null)
      return null;

    if (Array.isArray(variable))
      return this.saveArray(variable, description, className);

    if (typeof variable !== 'object')
      // Variable is of primitive type (number or string).
      return variable;
    
    // 'variable' is an entity (it's an instance of or is inherited
    // from class Entity).
    //   Entities are saved to a separate files. Only a string id
    // of an entity is saved here.
    if ('saveIdToJsonObject' in variable)
      return variable.saveIdToJsonObject();

    // 'variable' is a saveableObject (but not an entity).
    if ('saveToJsonObject' in variable)
      return variable.saveToJsonObject();

    if (this.isDate(variable))
      return variable;

    if (this.isMap(variable))
      return this.saveMap(variable, description, className);

    if (this.isPrimitiveObject(variable))
      return this.savePrimitiveObjectToJson(variable);

    FATAL_ERROR("Variable '" + description + "' in class '" + className + "'"
      + " (or inherited from some of it's ancestors) is a class but"
      + " is neither inherited from SaveableObject nor has a type that"
      + " we know how to save. Make sure that you only use primitive"
      + " types (numbers, strings), Arrays, primitive javascript Objects,"
      + " Dates, Maps or classes inherited from SaveableObject as properties"
      + " of classes inherited from SaveableObject. Or, if you want a new"
      + " type to be saved, you need to add saving and loading functionality"
      + " for it to SaveableObject.ts");
  }

  // Check if there is a static property named the same as property,
  // an if it's value contains: { isSaved = false; }
  private isSaved(propertyName: string, className: string): boolean
  {
    // Access static variable named the same as property.
    let propertyAttributes = this.getPropertyAttributes(propertyName);

    // If attributes for our property exist.
    if (propertyAttributes !== undefined)
    {
      if (propertyAttributes === null)
      {
        FATAL_ERROR("'null' propertyAtributes for property"
          + " '" + propertyName + "'. Make sure that 'static"
          + " " + propertyName + "' declared in class"
          + " " + className + " (or in some of it's ancestors)"
          + " is not null");
      }

      // And if there is 'isSaved' property in atributes.
      // (so something like: static property = { issaved: false };
      //  has been declared).
      if (propertyAttributes.isSaved !== undefined)
      {
        // And it's set to false.
        if (propertyAttributes.isSaved === false)
          // Then property is not to be saved.
          return false;
      }
    }

    return true;
  }

  // The purpose of manual saving of properties of primitive Objects
  // is to determine if some of them are SaveableObjects so they need
  // to be saved using their saveToJsonObject() method.
  // (this check is done within this.saveVariable() call)
  private savePrimitiveObjectToJson(variable: any): Object
  {
    let jsonObject: Object = {};
    
    for (let property in variable)
    {
      jsonObject[property] =
        this.saveVariable(variable[property], property, 'Object');
    }

    return jsonObject;
  }

  // The purpose of manual loading of properties of primitive Objects
  // is to determine if some of them are SaveableObjects so they need
  // to be loaded using their loadFromJsonObject() method.
  // (this check is done within this.loadVariable() call)
  private loadPrimitiveObjectFromJson
  (
    primitiveObject: any,
    jsonObject: any,
    filePath: string
  )
  {
    // Now copy the data.
    for (let propertyName in jsonObject)
    {
      // This will create property 'property' if it doesn't exist.
      primitiveObject[propertyName] = this.loadVariable
      (
        propertyName,
        primitiveObject[propertyName],
        jsonObject[propertyName],
        filePath
      );
    }

    return primitiveObject;
  }

  private isPrimitiveObject(variable: any): boolean
  {
    return variable.constructor.name === 'Object';
  }

  private isDate(variable: any): boolean
  {
    // Dirty hack to check if object is of type 'Date'.
    ///return Object.prototype.toString.call(variable) === '[object Date]';
    return variable.constructor.name === 'Date';
  }

  private isMap(variable: any): boolean
  {
    // Dirty hack to check if object is of type 'Map'.
    ///return Object.prototype.toString.call(variable) === '[object Map]';
    return variable.constructor.name === 'Map';
  }

  private isEntityReference(jsonObject: Object): boolean
  {
    // Technically there can be an entity reference saved with a 'null'
    // value, but in that case we don't have to load it as an entity
    // reference, because it will be null anyways.
    if (jsonObject === null)
      return false;

    if (jsonObject === undefined)
    {
      ERROR("Invalid jsonObject");
      return false;
    }

    // Is there a 'className' property in JSON object with value
    // 'EntityReference'?
    if (jsonObject[NamedClass.CLASS_NAME_PROPERTY]
        === Entity.ENTITY_REFERENCE_CLASS_NAME)
      return true;

    return false;
  }

  private extractMapContents(map: Map<any, any>): Array<any>
  {
    let result = [];

    // 'map.entries' is Iterable (whatever that means) so it needs to be
    // iterated using for ( of ).
    for (let entry of map.entries())
    {
      result.push(entry);
    }
    
    return result;
  }

  // If 'id' loaded from JSON already exists in EntityManager,
  // existing entity proxy will be returned. Otherwise an 'invalid'
  // entity proxy will be created and returned.
  // Note:
  //   This method doesn't actualy load an entity. If you want
  // to load an entity from file, call load() on what's returned
  // by this method.
  // -> Retuns an entity proxy object (possibly referencing an invalid entity).
  public loadReferenceFromJsonObject
  (
    propertyName: string,
    jsonObject: any,
    filePath: string
  )
  : Entity
  {
    if (jsonObject.className !== Entity.ENTITY_REFERENCE_CLASS_NAME)
      FATAL_ERROR("Attempt to load entity reference from invalid JSON object");

    let id = jsonObject.id;

    if (id === undefined || id === null)
    {
     ERROR("Invalid 'id' when loading entity reference"
        + " '" + propertyName + "' from JSON file "
        + filePath);
    }

    let type = jsonObject.type;

    if (type === undefined || type === null)
    {
      ERROR("Invalid 'type' when loading entity reference"
        + " '" + propertyName + "' from JSON file "
        + filePath);
    }

    // Return an existing entity proxy if entity exists in
    // entityManager, invalid entity proxy otherwise.
    return Server.entityManager.get(id, type);

    /*
    //let entityRecord = this.entityRecords.get(id);

    if (entity !== undefined)
      return entity;


    // If an entity with this 'id' already exists in hashmap,
    // just return it's proxy.
    if (entityRecord !== undefined)
    {
      let entityProxy = entityRecord.entityProxy;

      ASSERT(entityProxy !== undefined && entityProxy !== null,
        "Invalid entity proxy in entity record of entity with id "
        + id);

      ASSERT(entityProxy.className === type,
        "Error while loading entity reference"
        + " '" + propertyName + "' from file "
        + filePath + ": Property 'type' saved"
        + " in JSON doesn't match type of existing"
        + " entity " + entityProxy.getErrorStringId()
        + " that matches id saved in JSON");

      return entityProxy;
    }

    // If entity with this 'id' doesn't exist yet, a new proxy will
    // be created and it's handler's reference to entity will be set
    // to null.
    // (When this proxy is accessed, it will automatically ask
    //  EntityManager if the entity is already awailable.)
    return Server.entityManager.createInvalidEntityProxy
    (
      propertyName,
      jsonObject,
      filePath
    );
    */
  }
}