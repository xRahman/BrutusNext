/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';
import {Game} from '../game/Game';
import {EntityId} from '../game/EntityId';
import {EntityContainer} from '../game/EntityContainer';
import {IdList} from '../game/IdList'

// TEST:
const vm = require('vm');

export class GameEntity extends EntityContainer
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

  // Creates a new instance of game entity of type saved in id.
  static createInstanceFromId(id: Id, ...args: any[])
  {
    ASSERT_FATAL(id !== null,
      "Invalid (null) id passed to GameEntity::createInstance()");

    let newEntity = SaveableObject
      .createInstance({ className: id.getType(), typeCast: GameEntity }, args);

    newEntity.setId(id);
    
    return <GameEntity>newEntity;
  }

  // ---------------- Public class data -----------------

  public name = "Unnamed Entity";
  public isNameUnique = false;
  public aliases: Array<String> = [];

  // --------------- Public accessors -------------------

  public get playerConnection()
  {
    // We need to return null if playerConnectionId is null, because
    // if accessing playerConnection when playerConnectionId is null
    // was considered an error, saving game entity with null id would crash
    // (even if id is not actually saved, crash would occur on attempt
    // to find out if playerConnection property is SaveableObject).
    //    It's proabably better to be able to check playerConnection to
    // be null anyways, because it's intuitive way to do it (instead of
    // having to check if playerConnectionId is null).
    if (this.playerConnectionId === null)
      return null;

    return Server.playerConnectionManager.getItem(this.playerConnectionId);
  }

  public getId() { return <EntityId>super.getId(); }

  public setLocation(location: EntityId) { this.location = location; }
  public getLocation() { return this.location; }

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY()
  {
    ASSERT_FATAL(false,
      "Attempt to access SAVE_DIRECTORY of abstract GameEntity class"
      + " (" + this.getErrorIdString() + ")");

    return "";
  }

  // ---------------- Public methods --------------------

  // Dynamically creates a new instance of requested class (param.prototype)
  // and inserts it to specified idList (param.container).
  public createEntity<T>
  (
    param:
    {
      name: string,
      prototype: string,
      container: IdList
    }
  )
  : EntityId
  {
    // Dynamic creation of a new instance.
    let newEntity = SaveableObject.createInstance
    (
      {
        className: param.prototype,
        typeCast: GameEntity
      }
    );

    newEntity.name = param.name;

    let newEntityId = param.container.addEntityUnderNewId(newEntity);

    return newEntityId;
  }

  public generatePrompt(): string
  {
    /// TODO: Generovat nejaky smysluplny prompt.
    return "&gDummy_ingame_prompt >";
  }

  public atachPlayerConnection(connectionId: Id)
  {
    ASSERT(this.playerConnectionId !== null,
      "Attempt to attach player connection to '" + this.getErrorIdString()
      + "' which already has a connection attached to it. If you want"
      + " to change which connection is attached to this entity, use"
      + " detachPlayerConnection() first and then attach a new one.");

    this.playerConnectionId = connectionId;
  }

  public detachPlayerConnection()
  {
    // TODO
    this.playerConnectionId = null;
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

  // Entity adds itself to approptiate manager
  // (so it can be searched by name, etc.)
  public addToManager() { }

  protected getSaveDirectory(): string
  {
    if (this.isNameUnique)
      return this.SAVE_DIRECTORY + "unique/";
    else
      return this.SAVE_DIRECTORY;
  }

  protected getSaveFileName(): string
  {
    if (this.isNameUnique)
      return this.name + ".json";
    else
      return this.getIdStringValue() + ".json";
  }

  // Returns something like "Character 'Zuzka' (id: d-imt2xk99)".
  // (indended for use in error messages)
  public getErrorIdString()
  {
    return this.className + " '" + this.name + "'"
      + " (id: " + this.getId().getStringId() + ")";
  }

  // -------------- Private class data ----------------

  // null if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  private playerConnectionId: Id = null;
  // Flag saying that playerConnectionId is not to be saved to JSON.
  private static playerConnectionId = { isSaved: false };

  // Id of prototype entity. If it's null, this entity is a prototype.
  protected prototypeId: EntityId = null;

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.playerConnection)
      this.playerConnection.sendAsBlock("&gHuh?!?");
  }

  // Creates a formatted string describing entity contents.
  protected printContents(): string
  {
    ASSERT(false, "GameEntity::printContents() is not supposed to be"
      + "called, it needs to be overriden");

    return "";
  }

  // This is called when a new prototype is created.
  // (all ancestors that use prototyping should override this function)
  protected initializePrototypeData()
  {
  }

  // -------------- Protected class data ---------------

  // Id of an entity this entity is contained in.
  // (Rooms are contained in Areas, characters may be in rooms or object,
  // objects may be in room or object, etc.)
  protected location: EntityId = null;

  // ---------------- Command handlers ------------------

  protected doLook(argument: string)
  {
    if (this.playerConnection)
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
    if (this.playerConnection)
    {
      this.playerConnection
        .sendAsBlock("&gYou have to type quit--no less, to quit!");
    }
  }

  protected doQuit(argument: string)
  {
    if (this.playerConnection)
    {
      this.announcePlayerLeavingGame();
      this.playerConnection.enterLobby();
      this.playerConnection
        .sendAsBlock("\n&gGoodbye, friend.. Come back soon!");
      this.playerConnection.detachFromGameEntity();
    }
  }

  // ---------------- Command handler processors ------------------

  /// TEST:
  public description: String;

  // Sends a text describing room contents to the player connection.
  protected showContainerContents()
  {
    if (!ASSERT(this.playerConnection !== null,
        "Attempt to show room contents when there is no player connection" +
         + "attached"))
      return;

    if (!ASSERT(this.location !== null,
        "Attempt to show contents of container of entity"
        + "'" + this.name + "' which isn't contained in anything"))
      return;
    
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



    let output =
      this.location.getEntity({ typeCast: GameEntity }).printContents();

    if (output !== "")
      this.playerConnection.sendAsBlock(output);
  }
}