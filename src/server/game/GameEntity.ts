/*
  Part of BrutusNEXT

  Server-side game entity.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {Attributes} from '../../shared/lib/class/Attributes';
import {Script} from '../../server/lib/prototype/Script';
import {ServerApp} from '../../server/lib/app/ServerApp';
import {Entities} from '../../shared/lib/entity/Entities';
import {Message} from '../../server/lib/message/Message';
import {MessageType} from '../../shared/lib/message/MessageType';
import {Connection} from '../../server/lib/connection/Connection';
import {Game} from '../../server/game/Game';
import {ContainerEntity} from '../../server/lib/entity/ContainerEntity';
import {GameEntityData} from '../../shared/game/GameEntityData';

export class GameEntity extends ContainerEntity
{
  // ----------------- Public data ----------------------

  public data: (GameEntityData | null) = null;
    protected static data: Attributes =
    {
      // Entity shared data are sent to the client
      // (that's why they exist).
      sentToClient: true
    }

  public aliases: Array<String> = [];

  public extraDescriptions = [];

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  // ---------------- Public methods --------------------

  public processCommand(command: string)
  {
    /// TODO
    /// nejspíš: CommandInterpretter.processCommand(command);
  }


  /// To be deleted.
  /*
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
  */

  // Send message to this entity.
  public receive
  (
    // Don't add starting and ending color code, they will be added automatically
    // according to msgType. You can use '&_' code as 'base color', that is the
    // color that will be automatically aded to the start of the message.
    //   Use '\n' to mark newlines (it will be automatically converted to '\r\n').
    text: string,
    msgType: MessageType,
    // 'sender' can be null if there is no appropriate sending entity
    // (for example when player is receiving output from using a command).
    sender: (GameEntity | null) = null
  )
  {
    let message = new Message(text, msgType);

    message.sendToGameEntity(this, sender);
  }

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

  public addOfflineMessage(sender: GameEntity, message: Message)
  {
    /// TODO
    /// (Přidávání offline zpráv do fronty, výpis offline zpráv
    ///  při loginu, případně později příkazem)
    /// - pozor, message může být libovolný output ze serveru včetně
    ///   hlášek do místnosti, promtu, atd. Pokud se má do bufferu
    ///   offline messagů dávat jen komunikace, je třeba filtrovat
    ///   přes message.isCommunication().
  }

  // ~ Overrides Entity.postSave()
  // When saving a a container entity, all contained
  //  entities are saved as well.
  public async postSave()
  {
    if (!this.data)
      return;

    await this.data.saveContents();
  }

  // If 'loadContents' is true, load all entities referenced in
  // this.contentns. This is used to prevent situation when you
  // e. g. load a conainer but it's contents is not available in
  // the world.
  public async postLoad(loadContents = true)
  {
    if (!this.data)
      return;

    if (loadContents)
      await this.data.loadContents();
  }

  // ----------------- Private data ---------------------

  // 'null' if no player is connected to this entity.
  public connection: (Connection | null) = null;
    private static connection: Attributes =
    {
      saved: false
    };

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    this.receive("Huh?!?", MessageType.COMMAND);
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
  ///protected location: (GameEntity | null) = null;

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
      MessageType.COMMAND
    );
  }

  protected doQuit(argument: string)
  {
    if (this.connection === null)
      // This is not an error - most game entities don't have
      // a player connection attached. 
      return;

    this.receive("Goodbye, friend.. Come back soon!", MessageType.COMMAND);
    this.announcePlayerLeavingGame();
    ///this.connection.enterMenu();
    this.connection.detachFromGameEntity();

    // Remove entity from memory and from all entity lists.
    Entities.release(this);
    ///ServerApp.entityManager.remove(this);
  }

  // ---------------- Event Handlers -------------------

  /// Not used yet.
  // // Triggers when an entity is instantiated.
  // protected onLoad()
  // {
  // }

  // --------------- Command handlers ------------------

  /// TEST:
  public description: String = "";

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

    /*
    let output = this.location.printContents();

    if (output !== "")
      this.receive(output, Message.Type.COMMAND);
    */
  }
}