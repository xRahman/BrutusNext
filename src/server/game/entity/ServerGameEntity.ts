/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
import {Script} from '../../../server/lib/prototype/Script';
import {ServerApp} from '../../../server/lib/ServerApp';
import {Message} from '../../../server/lib/message/Message';
import {Connection} from '../../../server/lib/connection/Connection';
import {Game} from '../../../server/game/Game';
import {ContainerEntity} from '../../../shared/lib/entity/ContainerEntity';
import {SharedGameEntity} from '../../../shared/game/entity/SharedGameEntity';
//import {EntityList} from '../../../shared/lib/entity/EntityList'

export class ServerGameEntity extends SharedGameEntity
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

  //------------------ Public data ----------------------

  /// Tohle je v NamedEntity
  /*
  public name = "Unnamed Entity";
  public isNameUnique = false;
  */
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

  /// Moved to /shared/lib/entity/ContainerEntity
  ///public setLocation(location: ContainerEntity) { this.location = location; }
  ///public getLocation() { return this.location; }

  // -------------- Protected accessors -----------------


  // ---------------- Public methods --------------------

    // -> Returns 'null' if directory cannot be composed.
  public static getPrototypeSaveDirectory()
  {
    // Note:
    //   Because we are in a static method, 'this' is actualy the class
    // constructor and it's properties are static properties of the
    // class.

    // General idea:
    //   We are going to recursively call the same method on our ancestor.
    // To do that we have to traverse the prototype chain.

    // In Javascript, the prototype of a class prototype is it's ancestor.
    // (trust me, it's not worth the brain know to try to understand it ;-))
    let ancestor = Object.getPrototypeOf(this.prototype);

    // In Javascript, constructor of the class is the class.
    let AncestorClass = ancestor.constructor;

    let ancestorClassName = AncestorClass['className'];

    if (ancestorClassName === undefined)
    {
      ERROR("Unable to compose prototype save directory because"
        + " property 'className' doesn't exist on ancestor");
      return null;
    }

    // This ends the recursion.
    //   When we traverse the prototype chain up to 'GameEntity' class,
    // the recursion is finished. 'GameEntity' is not appended to the
    // class to save unnecessary step in resulting directory structure.
    if (ancestorClassName === 'GameEntity')
      return "";

    // We are not at 'GameEntity' yet, so we need to call the same method
    // on our ancestor.

    let ancestorMethod = AncestorClass['getPrototypeSaveDirectory'];

    if (ancestorMethod === undefined)
    {
      ERROR("Unable to compose prototype save directory"
        + " of class '" + ancestorClassName + "' because static"
        + " method 'getPrototypeSaveDirectory()' doesn't"
        + " exist on it's ancestor");
      return null;
    }

    // Call getAncestorSubDirectory() static method of AncestorClass.
    // (AncestorClass is passed as 'this')
    let ancestorDirectory = ancestorMethod.call(AncestorClass);
    
    // And finally we jast concatenate the strings. The result
    // will be something like: '/Room/SystemRoom/'
    return ancestorDirectory + ancestorClassName + '/';
  }

  // Send message to this entity.
  public receive
  (
    // Don't add starting and ending color code, they will be added automatically
    // according to msgType. You can use '&_' code as 'base color', that is the
    // color that will be automatically aded to the start of the message.
    //   Use '\n' to mark newlines (it will be automatically converted to '\r\n').
    text: string,
    msgType: Message.Type,
    // 'sender' can be null if there is no appropriate sending entity
    // (for example when player is receiving output from using a command).
    sender: ServerGameEntity = null
  )
  {
    let message = new Message(text, msgType);

    message.sendToGameEntity(this, sender);
  }

  /// sendMessage() je intuitivnější název, navíc stačí jedna metoda
  /// (nenapadá mě případ, kdy by bylo potřeba sendToSelf() a když by
  /// se přece nějakej našel, stačí dát receiving entitu do parametru
  /// 'sender').
  /*
  // Make this entity to send a message to itself.
  // ('text' is automatically colored according to given 'msgType').
  public sendToSelf(text: string, messageType: Message.Type)
  {
    this.receiveMessage(this, text, messageType);
  }
  */

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

  /*
  protected getSaveDirectory(): string
  {
    let SAVE_DIRECTORY = super.getSaveDirectory();

    if (this.isNameUnique)
      return SAVE_DIRECTORY + "unique/";
    else
      return SAVE_DIRECTORY;
  }
  */

  /*
  protected getSaveFileName(): string
  {
    if (this.isNameUnique)
      return this.name + ".json";
    else
      return this.getIdStringValue() + ".json";
  }
  */

  public addOfflineMessage(sender: ServerGameEntity, message: Message)
  {
    /// TODO
    /// (Přidávání offline zpráv do fronty, výpis offline zpráv
    ///  při loginu, případně později příkazem)
    /// - pozor, message může být libovolný output ze serveru včetně
    ///   hlášek do místnosti, promtu, atd. Pokud se má do bufferu
    ///   offline messagů dávat jen komunikace, je třeba filtrovat
    ///   přes message.isCommunication().
  }

  //------------------ Private data ---------------------

  // null if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  public connection: Connection = null;
  // Flag saying that connectionId is not to be saved to JSON.
  private static playerConnectionId = { isSaved: false };

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    this.receive("Huh?!?", Message.Type.COMMAND);
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

  /// Moved to /shared/lib/entity/ContainerEntity
  // Entity this entity is contained in.
  // (Rooms are contained in Areas, characters may be in rooms or object,
  // objects may be in room or object, etc.)
  ///protected location = null;

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
    this.receive
    (
      "You have to type quit--no less, to quit!",
      Message.Type.COMMAND
    );
  }

  protected doQuit(argument: string)
  {
    if (this.connection === null)
      // This is not an error - most game entities don't have
      // a player connection attached. 
      return;
    
    if (!this.connection.isValid())
    {
      ERROR("Invalid connection on entity " + this.getErrorIdString());
      return;
    }

    this.receive("Goodbye, friend.. Come back soon!", Message.Type.COMMAND);
    this.announcePlayerLeavingGame();
    this.connection.enterMenu();
    this.connection.detachFromGameEntity();

    // Remove entity from memory and from all entity lists.
    ServerApp.entityManager.remove(this);
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
        + " '" + this.getErrorIdString() + "' which isn't placed"
        + " in any container");
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
      this.receive(output, Message.Type.COMMAND);
  }
}