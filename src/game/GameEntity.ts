/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ERROR} from '../shared/error/ERROR';
import {Server} from '../server/Server';
import {SaveableObject} from '../shared/fs/SaveableObject';
import {Script} from '../shared/prototype/Script';
import {Connection} from '../server/connection/Connection';
import {Game} from '../game/Game';
import {ContainerEntity} from '../game/ContainerEntity';
import {EntityList} from '../shared/entity/EntityList'

export class GameEntity extends ContainerEntity
{
  /*
  /// TEST

  protected testVariable = "Hello World!";
  protected static testVariable = { isSaved: false };
  protected static testStaticVariable = "GameEntityStaticVariable";
  //public test() { console.log("GameEntity::" + this.className); }
  public test()
  {
    console.log("GameEntity::" + GameEntity['testStaticVariable']);
  }
  */

  /*
  // If you were wondering why 'name' isn't passed to constructor,
  // it's because of dynamic instantiation while loading from file.
  // While it's possible to pass arguments to dynamically called
  // constructor, it would be difficult to pass it a name before
  // anything was actually loaded yet.
  constructor(prototypeId: EntityId)
  {
    super();

    if (prototypeId !== undefined)
    {
      this.prototypeId = prototypeId;

      if (prototypeId === null)
        this.initializePrototypeData();
    }
  }
  */

  // ---------------- Public class data -----------------

  public name = "Unnamed Entity";
  public isNameUnique = false;
  public aliases: Array<String> = [];

  // --------------- Public accessors -------------------

  /*
  public get connection(): Connection
  {
    // We need to return null if connectionId is null, because
    // if accessing connection when connectionId is null
    // was considered an error, saving game entity with null id would crash
    // (even if id is not actually saved, crash would occur on attempt
    // to find out if connection property is SaveableObject).
    //    It's proabably better to be able to check connection to
    // be null anyways, because it's intuitive way to do it (instead of
    // having to check if connectionId is null).
    if (this.connectionId === null)
      return null;

    return this.connectionId.getEntity({ typeCast: Connection });
  }
  */

  public setLocation(location: ContainerEntity) { this.location = location; }
  public getLocation() { return this.location; }

  // -------------- Protected accessors -----------------


  // ---------------- Public methods --------------------

  // Overrides Entity.getSaveSubDirectory().
  protected static getSaveSubDirectory()
  {
    // Note:
    //   Because we are in a static method, 'this' is actualy the class
    // constructor and it's properties are static properties of the
    // class.

    let className = this['className'];
    let errorPath = "_SAVE_PATH_CREATION_ERROR/";

    if (className === undefined)
    {
      ERROR("Unable to compose entity save path because"
        + " property 'className' doesn't exist on any class"
        + " in the prototype chain. Save path will contain"
        + " " + errorPath + " instead");
      return errorPath;
    }

    /// Jaky prototyp ma muj prototyp - jinak receno, jakeho mam predka.
    let ancestor = Object.getPrototypeOf(this.prototype);

    // Staticka property ancestora.
    let getAncestorSubDirectory =
      ancestor.constructor['getSaveSubDirectory'];

    errorPath = "_SAVE_PATH_CREATION_ERROR_" + className + "/";

    if (getAncestorSubDirectory === undefined)
    {
      ERROR("Unable to compose correct save path for class"
        + " '" + className + "' because static method"
        + " 'getSaveSubDirectory' doesn't exist on it's"
        + " ancestor. Save path will contain " + errorPath
        + " instead");
      return errorPath;
    }

    // Call getAncestorSubDirectory() with 'ancestor.constructor' as 'this'.
    // ('ancestor.constructor' and not just 'ancestor', it is a static method
    //  so 'this' must be the class constructor, not an instance).
    let ancestorPath = getAncestorSubDirectory.call(ancestor.constructor);
    
    return ancestorPath + className + "/";
  }

  /*
  // Dynamically creates a new instance of requested class (param.prototype)
  // and inserts it to specified idList (param.idList).
  public createEntity<T>
  (
    param:
    {
      name: string,
      prototype: string,
      idList: EntityList
    }
  )
  : EntityId
  {
    // Dynamic creation of a new instance.
    let entity = SaveableObject.createInstance
    (
      {
        className: param.prototype,
        typeCast: GameEntity
      }
    );

    entity.name = param.name;

    let id = Server.idProvider.createId(entity);

    param.idList.add(entity);

    return id;
  }
  */

  public generatePrompt(): string
  {
    /// TODO: Generovat nejaky smysluplny prompt.
    return "&gDummy_ingame_prompt >";
  }

  public atachConnection(connection: Connection)
  {
    if (this.connection !== null)
    {
      ERROR("Attempt to attach player connection"
        + " to '" + this.getErrorIdString() + "'"
        + " which already has a connection attached."
        + " If you want to change which connection is"
        + " attached to this entity, use detachConnection()"
        + " first and then attach a new one");
    }

    this.connection = connection;
  }

  public detachConnection()
  {
    // TODO
    this.connection = null;
  }

  // Player connected to this entity is entering game.
  //   Needs to be overriden if something is going to happen (like message
  // that a player character has just entered game).
  public announcePlayerEnteringGame() { }

  // Player connected to this entity is entering game.
  //   Needs to be overriden if something is going to happen (like message
  // that a player character has just entered game).
  public announcePlayerLeavingGame() { }

  // Player connected to this entity has reconnected.
  //   Needs to be overriden if something is going to happen (like message
  // that a player character has just entered game).
  public announcePlayerReconnecting() { }

  protected getSaveDirectory(): string
  {
    let SAVE_DIRECTORY = super.getSaveDirectory();

    if (this.isNameUnique)
      return SAVE_DIRECTORY + "unique/";
    else
      return SAVE_DIRECTORY;
  }

  /*
  protected getSaveFileName(): string
  {
    if (this.isNameUnique)
      return this.name + ".json";
    else
      return this.getIdStringValue() + ".json";
  }
  */

  // -------------- Private class data ----------------

  // null if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  public connection: Connection = null;
  // Flag saying that connectionId is not to be saved to JSON.
  private static playerConnectionId = { isSaved: false };

  /// Tohle je z?ejm? poz?statek star��ho p?�stupu k prototyp?m.
  /*
  // EntityId of prototype entity. If it's null, this entity is a prototype.
  protected prototype: EntityId = null;
  */

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.connection)
      this.connection.sendAsBlock("&gHuh?!?");
  }

  // Creates a formatted string describing entity contents.
  protected printContents(): string
  {
    ERROR("GameEntity.printContents() is not supposed"
      + " to becalled, it needs to be overriden");
    return "";
  }

  // This is called when a new prototype is created.
  // (all ancestors that use prototyping should override this function)
  protected initializePrototypeData()
  {
  }

  // -------------- Protected class data ---------------

  // Entity this entity is contained in.
  // (Rooms are contained in Areas, characters may be in rooms or object,
  // objects may be in room or object, etc.)
  protected location = null;

  // ---------------- Command handlers ------------------

  protected doLook(argument: string)
  {
    if (this.connection)
    {
      // No arguments - show contents of container this entity is inside of.
      // (Usualy a room the player is in).
      if (argument === "")
        this.showContainerContents();
    }
  }

  // Prevents accidental quitting without typing full 'quit' commmand.s
  protected doQui(argument: string)
  {
    if (this.connection)
    {
      this.connection
        .sendAsBlock("&gYou have to type quit--no less, to quit!");
    }
  }

  protected doQuit(argument: string)
  {
    if (this.connection)
    {
      this.announcePlayerLeavingGame();
      this.connection.enterLobby();
      this.connection
        .sendAsBlock("\n&gGoodbye, friend.. Come back soon!");
      this.connection.detachFromGameEntity();
    }
  }

  // ---------------- Command handler processors ------------------

  /// TEST:
  public description: String;

  // Sends a text describing room contents to the player connection.
  protected showContainerContents()
  {
    if (this.connection === null)
    {
      ERROR("Attempt to show room contents to an entity"
        + " that has no player connection attached");
      return;
    }

    if (this.location === null)
    {
      ERROR("Attempt to show contents of container of entity"
        + " '" + this.name + "' which isn't placed in any container");
      return;
    }
    
    // TODO: Check na slepotu.
    // neco jako:
    //  if (this.isBlind())
    //    output = "You are blind, you can't see anything.";
    // pripadne:
    //   output = "It's completely dark, you can't see anything.";


    /* --- TEST --- */
    /*
    //let script = "return 'Changed function!'";
    //let script = "'use strict'; class Point extends GameEntity { print() {return 'Class method'} }; return Point;";
    let script = "'use strict'; let Room = global['Room']; class Point extends Room { print() {return 'Class method'} }; global['Point'] = Point;";

    let vmScript = null;
    try
    {
      vmScript = new vm.Script(script, { displayErrors: true });
    }
    catch (e)
    {
      ASSERT(false, "Script compile error: " + e.message);
    }

    vmScript.runInThisContext();
    let Point = global['Point'];
    */
    /*
    let fce = new Function('GameEntity', script);
    // Funkce fce vrati novou classu Point.
    // Aby mohl classu Point zdedit z GameEntity, tak musim GameEntity predat
    // jako parametr - dynamicky vytvorene funkce nevidi zadny kontext krome
    // predanych parametru (mozna global uvidi, coz se asi bude hodit, abych
    // mohl classu dynamicky instanciovat pri loadovani z disku).
    let Point = fce(GameEntity);
    */

    /*
    // Kterou nasledne muzu instanciovat.
    let instanceOfPoint = new Point();

    GameEntity.prototype.description = "GameEntity prototype description";

    //let output = instanceOfPoint.print();
    let output = instanceOfPoint.description;
    */

    /* --- TEST --- */



    let output = this.location.printContents();

    if (output !== "")
      this.connection.sendAsBlock(output);
  }
}