/*
  Part of BrutusNEXT

  Implements functionality that enables inherited classes to save and load
  data in JSON format.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {EntityId} from '../shared/EntityId';
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
  // a FATAL_ASSERT when versions don't match. You can override it
  // by overriding a checkVersion() method;
  protected version = 0;

  // Buffer to stack save requests issued while already saving ourselves.
  // Also serves as lock - if it's not null, it means we are already saving
  // ourselves.
  // (note: This property is not saved)
  protected saveRequests: Array<string> = [];
  protected static saveRequests = { isSaved: false };

  // ---------------- Public methods --------------------

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
    let classNameIsValid =
      param.className !== undefined
      && param.className !== null
      && param.className != "";

    if (!ASSERT(classNameIsValid,
        "Invalid class name passed to SaveableObject::createInstance()."
        + " Instance is not created"))
      return null;

    // We will use global object to acces respective class constructor.
    let dynamicClasses = global[SaveableObject.DYNAMIC_CLASSES_PROPERTY];

    if (!ASSERT(dynamicClasses[param.className] !== undefined,
        "Attempt to createInstance() of unknown type"
        + " '" + param.className + "'. You probably forgot to create"
        + " or assign a prototype to your game entity or add a new"
        + " class to DynamicClasses.ts."
        + " Instance is not created"))
      return null;

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

    ASSERT(false,
      "Type cast error: Newly created object "
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

    let filenameIsValid = fileName !== undefined
      && fileName !== null
      && fileName !== "";

    if (!ASSERT(directoryIsValid,
      "Invalid 'directory' parameter when saving class "
      + this.className + "." + " Object is not saved"))
      return;

    if (!ASSERT(filenameIsValid,
      "Invalid 'fileName' parameter when saving class "
      + this.className + "." + " Object is not saved"))
      return;

    if (!ASSERT(directory.substr(directory.length - 1) === '/',
      "Error when saving class " + this.className + ":"
      + " Directory path '" + directory + "' doesn't end with '/ '."
      + " Object is not saved"))
      return;

    // Directory might not yet exist, so we better make sure it does.
    await FileSystem.ensureDirectoryExists(directory);
    await this.saveContentsToFile(directory + fileName);
  }

  // -------------- Protected methods -------------------

  protected checkVersion(jsonObject: Object, filePath: string)
  {
    ASSERT_FATAL('version' in jsonObject,
      "There is no 'version' property in JSON data in file " + filePath);

    ASSERT_FATAL(jsonObject['version'] === this.version,
      "Version of JSON data (" + jsonObject['version'] + ")"
      + " in file " + filePath + " doesn't match required"
      + " version (" + this.version + ")");
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
      ASSERT_FATAL(false, "Syntax error in JSON string: "
        + e.message + " in file " + filePath);
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
    this.checkVersion(jsonObject, filePath);

    // 'className' must be the same as it's saved value.
    this.checkClassName(jsonObject, filePath);

    // Using 'in' operator on object with null value would cause crash.
    ASSERT_FATAL(jsonObject !== null,
      "Invalid json object loaded from file " + filePath);

    // Now copy the data.
    for (let propertyName in jsonObject)
    {
      // Property 'className' will not be assigned (it's read-only
      // and static so it wouldn't make sense anyways), but we will
      // check that we are loading ourselves into a class with matching
      // className.
      if (propertyName === NamedClass.CLASS_NAME_PROPERTY)
      {
        ASSERT_FATAL(this.className !== undefined,
          "Loading object with saved '" + NamedClass.CLASS_NAME_PROPERTY + "'"
          + " property into an instance that doesn't have"
          + " a '" + NamedClass.CLASS_NAME_PROPERTY + "' property."
          + " This should never happen");

        ASSERT_FATAL(jsonObject[propertyName] === this.className,
          "Loading object with '" + NamedClass.CLASS_NAME_PROPERTY + "'"
          + " property saved as '" + jsonObject[propertyName] + "' into an"
          + " instance with '" + NamedClass.CLASS_NAME_PROPERTY + "'"
          + this.className + ". This should never happen, types must match");
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

    ASSERT_FATAL(className !== undefined,
      "Attempt to save a SaveableObject that doesn't have"
      + " a " + NamedClass.CLASS_NAME_PROPERTY + " property."
      + " I don't know how did you manage to do it - SaveableObject"
      + " is inherited from NamedClass which does have it");

    jsonObject[NamedClass.CLASS_NAME_PROPERTY] = className;

    // Cycle through all properties in this object.
    for (let property in this)
    {
      // Skip 'name' property because it's already saved thanks to
      // previous hack.
      // (isSaved() checks static attribute property.isSaved)
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
    ASSERT_FATAL(NamedClass.CLASS_NAME_PROPERTY in jsonObject,
      "There is no '" + NamedClass.CLASS_NAME_PROPERTY + "' property"
      + "in JSON data in file " + filePath);

    ASSERT_FATAL(jsonObject[NamedClass.CLASS_NAME_PROPERTY] === this.className,
      "Attempt to load JSON data of class"
      + " (" + jsonObject[NamedClass.CLASS_NAME_PROPERTY] + ")"
      + " in file " + filePath + " into instance of incompatible"
      + " class (" + this.className + ")");
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
    let newArray = [];

    for (let i = 0; i < jsonArray.length; i++)
    {
      // newProperty needs to be set to null prior to calling loadVariable(),
      // so an instance of the correct type will be created.
      let newProperty = null;

      newProperty = this.loadVariable
      (
        "Array Item",
        newProperty,
        jsonArray[i],
        filePath
      );

      newArray.push(newProperty);
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

    if (this.isId(jsonVariable, filePath))
    {
      // EntityId's are loaded in a special way because then need to be
      // registered by IdManager.
      this.loadIdPropertyFromJsonObject
      (
        variableName,
        variable,
        filePath
      );
    }
    else if
    (
      Array.isArray(jsonVariable)
      // Hashmaps (class Map) are saved as array but we need them
      // to load as non-array variable.
      && !this.isMap(variable)
    )
    {
      ASSERT_FATAL(variable === null || Array.isArray(variable),
        "Attempt to load array property '" + variableName + "' to"
        + " a non-array property.");

      return this.loadArray(variableName, jsonVariable, filePath);
    }
    else
    {
      return this.loadNonArrayVariable
      (
        variableName,
        variable,
        jsonVariable,
        filePath
      );
    }
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

  private loadNonArrayVariable
  (
    propertyName: string,
    myProperty: any,
    jsonObject: any,
    filePath: string
  )
  {
    // If we are loading property of primitive type (Number or String),
    // we just assign the value.
    if (typeof jsonObject !== 'object')
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
      else
      {
        return jsonObject;
      }
    }

    // Here we are sure that jsonObject is an Object.

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
    else if ('loadFromJsonObject' in myProperty)
    {
      // If we are loading into a saveable object, do it using it's
      // loadFromJsonObject() method.
      myProperty.loadFromJsonObject(jsonObject, filePath);

      return myProperty;
    }
    else // We are loading object that is neither Date, Map nor SaveableObject.
    {
      return this.loadPrimitiveObjectFromJson
      (
        myProperty,
        jsonObject,
        filePath
      );
    }
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
    {
      return this.saveArray(variable, description, className);
    }
    else if (typeof variable === 'object')
    {
      // myProperty is a saveableObject
      if ('saveToJsonObject' in variable)
        return variable.saveToJsonObject();

      if (this.isDate(variable))
        return variable;

      // When we are saving a Map object, we request it's contents
      // formated as array of [key, value] pairs by calling it's
      // .entries() method and then save this array as any regular
      // array (values can be another objects or arrays, so we need to
      // save it recursively).
      if (this.isMap(variable))
      {
        let mapContents = this.extractMapContents(variable);

        return this.saveArray(mapContents, description, className);
      }

      if (this.isPrimitiveJavascriptObject(variable))
        return this.savePrimitiveObjectToJson(variable);

      ASSERT_FATAL(false,
        "Variable '" + description + "' in class '" + className + "'"
        + " (or inherited from some of it's ancestors) is a class but"
        + " is not inherited from SaveableObject. Make sure that you"
        + " only use primitive types (numbers, strings), Arrays, basic"
        + " javascript Objects, Dates, Maps or classes inherited from"
        + " SaveableObject as properties of classes inherited from"
        + " SaveableObject");
    }
    else  // Variable is of primitive type (number or string).
    {
      return variable;
    }
  }

  // Check if there is a static property named the same as property,
  // an if it's value contains: { isSaved = false; }
  private isSaved(propertyName: string, className: string): boolean
  {
    // Access static variable named the same as property.
    let propertyAttributes = this.getPropertyAttributes(this, propertyName);

    // If attributes for our property exist.
    if (propertyAttributes !== undefined)
    {
      ASSERT_FATAL(propertyAttributes !== null,
        "'null' propertyAtributes for property '" + propertyName + "'"
        + "Make sure that 'static " + propertyName + "' declared in class"
        + className + " (or in some of it's ancestors) is not null");

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

  private isPrimitiveJavascriptObject(variable: any): boolean
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

  private isId(jsonObject: Object, filePath: string): boolean
  {
    // Technically there can be an id saved with a 'null' value,
    // but in that case we don't have to load it as an EntityId,
    // because it will be null anyways.
    if (jsonObject === null)
      return false;

    if (!ASSERT(jsonObject !== undefined,
      "Invalid jsonObject"))
      return false;

    if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] !== undefined)
    {
      if (jsonObject[NamedClass.CLASS_NAME_PROPERTY] === "EntityId")
        return true;

      return false;
    }

    // Json objects don't have a type (they are plain javascript Objects),
    // so we can't use instanceOf. We could test className, but that wouldn't
    // work for ancestors of EntityId class (anyone who would inherit from
    // class EntityId would have to add a special case here), so instead we
    // check 'stringId' property which all ancestors of EntityId inherit.
    ASSERT(jsonObject[EntityId.STRING_ID_PROPERTY] === undefined,
      "There is a " + EntityId.STRING_ID_PROPERTY + " property in"
      + " Json object loaded from file " + filePath + " but a "
      + NamedClass.CLASS_NAME_PROPERTY + " is missing. That"
      + " probably means that you have either inherited from"
      + " EntityId class or you have declared a property named "
      + EntityId.STRING_ID_PROPERTY + " in some random class."
      + " If it's the first case, you will have to change code"
      + " here where this ASSERT have been triggered. If it's the"
      + " second case, you should name the property otherwise. If "
      + " it's neither, good luck figuring out what's going on.");

    return true;
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

  private loadIdPropertyFromJsonObject
    (
    propertyName: string,
    jsonObject: any,
    filePath: string
    )
  {
    let stringId = jsonObject[EntityId.STRING_ID_PROPERTY];

    if (!ASSERT(stringId !== undefined && stringId !== null,
      "Errow while loading id from file " + filePath + ": Unable"
      + " to load id, because passed 'jsonObject' doesn't contain"
      + "property '" + EntityId.STRING_ID_PROPERTY + "'"))
      return null;

    let id = Server.idProvider.get(stringId);

    if (id !== undefined)
    {
      // Check that all properties of loaded id match existing id.
      id.checkAgainstJsonObject(jsonObject, filePath);

      // We are going to use existing id iven if loaded id doesn't
      // match perfecly (if there were errors, they have been
      // reported by id.checkAgainstJsonObject()).
      this[propertyName] = id;
    }
    else
    {
      // Id doesn't exist in idProvider yet, so we need to
      // create a new instance of EntityId.
      // (This will create an EntityId with internal state ID_NOT_LOADED,
      //  and it won't be registered in idProvider.)
      id = SaveableObject.createInstance
        (
        {
          className: jsonObject[NamedClass.CLASS_NAME_PROPERTY],
          typeCast: EntityId
        }
        );

      // We need to set id to our property so we can use
      // this.loadPropertyFromJsonObject().
      this[propertyName] = id;

      // Load it from it from json object.
      this.loadPropertyFromJsonObject
        (
        jsonObject,
        propertyName,
        filePath
        );

      // Update internal status from ID_NOT_LOADED to ENTITY_NOT_LOADED.
      id.status = EntityId.state.ENTITY_NOT_LOADED;

      // Register loaded id in idProvider.
      Server.idProvider.register(this[propertyName]);
    }
  }
}