/*
  Part of BrutusNEXT

  Any message that is send to players.
*/

/*
  A message can consist of multiple MessageParts. For example
  if you look into the room, a single message will be created
  but it will consist of room name, room description, list of
  exits, etc.
*/

/*
  Message remembers everything, including parts that will be
  gagged or otherwise filtered. It means that you can retrieve
  original, ungagged (or differently gagged) messages from the
  history.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Utils} from '../../shared/Utils';
import {Server} from '../../server/Server';
import {Connection} from '../../server/connection/Connection';
import {MessagePart} from '../../server/message/MessagePart';
import {AdminLevel} from '../../server/AdminLevel';
import {GameEntity} from '../../game/GameEntity';

export class Message
{
  // Use 'text' parameter for single-part messages. Ommit it and call
  // message.addMessagePart() for multi-part messages.
  constructor(msgType: Message.Type, text: string = null)
  {
    this.type = msgType;

    if (text !== null)
    {
      this.addMessagePart(text, MessagePart.Type.SAME_AS_MESSAGE);
    }
  }

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  ///public target: Message.Target = null;
  ///public sendToSelf = true;

  //------------------ Private data ---------------------

  /*
  // Recipient should only be set when this.type is
  // Message.Type.SINGLE_RECIPIENT and this.sendToSelf
  // is false.
  private recipient: GameEntity = null;
  */

  // 'sender' can be null (for example for syslog messages, global infos, etc.) 
  private sender: GameEntity = null;
  private type: Message.Type = null;
  private messageParts: Array<MessagePart> = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // Puts message parts together, adds prompt if necessary,
  // adds a space if neccessary (to separate user input).
  public compose(): string
  {
    let data = "";

    // Put all message parts together.
    for (let messagePart of this.messageParts)
      data += messagePart.getText();
 
    if (this.triggersPrompt())
    {
      /// TODO: Přidat prázný řádek (nebo newlinu v brief módu) mezi
      /// message a prompt.

      data += this.generatePrompt();
    } 

    /// Zatím mě nenapadá případ, kdy by za poslaným messagem nemohl přijít
    /// user input, takže tenhle comment je asi zbytečnej.
    /*
    // Pokud je message prompt, případně pokud za ním prompt následuje,
    // tak za něj přilepit mezeru, pokud tam ještě není.
    // - aby byl user input oddělenej od outputu (na terminálech, kde se píše
    //   přímo do textu).
    */

    data = this.normalizeNewlines(data);

    // Add space to the end of the message to separate it from user input.
    // (Only if it doesn't end with space already or with a newline.) 
    return this.addSpace(data);
  }

  public addMessagePart(text: string, msgPartType: MessagePart.Type)
  {
    let messagePart = new MessagePart(text, this.type, msgPartType);

    if (this.messageParts === null)
      this.messageParts = [];

    this.messageParts.push(messagePart);
  }

  /*
  // Use this if the message should only be sent to one target.
  public setRecipient(recipient: GameEntity)
  {
    if (recipient === null || recipient.isValid() === false)
    {
      ERROR("Invalid message recipient");
      return;
    }

    if (this.sender === null)
    {
      ERROR("Invalid sender. Set message.sender before you call"
        + " setRecipient()");
      return;
    }

    this.target = Message.Target.SINGLE_RECIPIENT;

    // 'equals()' compares entities by their string ids.
    if (recipient.equals(this.sender))
      this.sendToSelf = true;
    else
      this.sendToSelf = false;

    this.recipient = recipient;
  }
  */

  /*
  // Sends the message to all of it's recipients.
  public send()
  {
    if (this.sender === null || !this.sender.isValid())
    {
      ERROR("Invalid sender. Set message.sender before you call"
        + " gatherRecipients()");
      return;
    }

    switch (this.target)
    {
      case Message.Target.SINGLE_RECIPIENT:
        this.sendToEntity(this.recipient);
        break;

      case Message.Target.ALL_IN_ROOM:
        this.sendToRoom();
        break;

      case Message.Target.ALL_IN_SHOUTING_DISTANCE:
        this.sendToShout();
        break;

      case Message.Target.ALL_IN_GAME:
        this.sendToGame();
        break;

      case Message.Target.ALL_ACTIVE_CONNECTIONS:
        this.sendToAllConnections({ onlyInGame: false });
        break;

      default:
        ERROR("Unknown message target");
        break;
    }
  }
  */

  // Sends the message directly to player connection. This is used
  // to send message to player is menu, entering password, etc.,
  // who don't have ingame entity attached.
  public sendToConnection(connection: Connection)
  {
    if (connection === null || connection.isValid() === false)
    {
      ERROR("Invalid target connection. Message is not sent");
      return;
    }

    connection.sendMessage(this);
    
    /*
    switch (this.type)
    {
      // /// Posílání samothéno promptu skrz message asi nebude k ničemu potřeba,
      // /// uvidíme.
      // case Message.Type.PROMPT:
      //   // Send data to the connection without adding any newlines.
      //   // (It means that player will type right next to this output.)
      //   connection.sendAsPrompt(data);
      //   break;
      
      default:
        // Send data as block, followed by prompt.
        // (It means that a newline or an empty line will be added to data,
        //  followed by player's prompt.)
        connection.sendMessage(this);
        break;
    }
    */
  }

  // Send the message to a single game entity.
  // 'sender' can be null (for example for command output).
  public sendToGameEntity(sender: GameEntity, target: GameEntity)
  {
    if (target === null || target.isValid() === false)
    {
      ERROR("Invalid message recipient. Message is not sent");
      return;
    }

    this.sender = sender;

    // Null connection means that no player is connected to this entity. 
    if (target.connection === null)
    {
      target.addOfflineMessage(sender, this);
    }
    else
    {
      this.sendToConnection(target.connection);
    }
  }

  public sendToRoom(sender: GameEntity)
  {
    this.sender = sender;

    // TODO
  }

  public sendToShout(sender: GameEntity)
  {
    this.sender = sender;

    // TODO

    /// Pozn: Shouting distance (počet roomů) přečíst ze sendera.
  }

  // Sends message to all player connections that have a valid ingame entity.
  // 'visibility' limits recipients to certain admin level or higher.
  // (Used to send gossips, global infos, syslog, etc.).
  public sendToAllIngameConnections(sender: GameEntity, visibility: AdminLevel)
  {
    this.sender = sender;

    let connections = Server.connections.getEntities();
    let connection: Connection = null;

    for (connection of connections.values())
    {
      // Skip invalid connections.
      if (connection === null || !connection.isValid())
        break;

      // Skip connections that don't have an ingame entity attached.
      if (connection.ingameEntity === null)
        break;

      // Skip connections with invalid ingame entity.
      if (connection.ingameEntity.isValid() === false)
        break;

      // Skip game entities which don't have sufficient admin level
      // to see this message.
      if (Server.getAdminLevel(connection.ingameEntity) < visibility)
        break;

      this.sendToConnection(connection);
    }
  }

  // Sends message even to players in menu, entering password, etc.
  // (Used for messages like shutdown countdown.)
  public sendToAllConnections
  (
    sender: GameEntity,
    visibility: AdminLevel
  )
  {
    this.sender = sender;

    let connections = Server.connections.getEntities();
    let connection: Connection = null;

    for (connection of connections.values())
    {
      // Skip invalid connections.
      if (connection === null || !connection.isValid())
        break;

      this.sendToConnection(connection);
    }
  }

  public isCommunication(): boolean
  {
    if (this.type === null)
    {
      ERROR("Uninitialized message type");
      return false;
    }

    switch (this.type)
    {
      case Message.Type.TELL:
      case Message.Type.GOSSIP:
      case Message.Type.GOSSIPEMOTE:
      case Message.Type.SAY:
      case Message.Type.QUEST:
      case Message.Type.WIZNET:
      case Message.Type.SHOUT:
      case Message.Type.EMOTE:
      case Message.Type.INFO:
        return true;
    }

    return false;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private generatePrompt(): string
  {
    let prompt = "&g>";

    /// TODO: Generovat prompt.

    return prompt;
  }

  private triggersPrompt(): boolean
  {
    switch (this.type)
    {
      case Message.Type.AUTH_PROMPT:
        return false;

      default:
        return true;
    }
  }

  // Make sure that all newlines are representedy by '\r\n'.
  private normalizeNewlines(data: string): string
  {
    if (data && data.length > 0)
    {
      // First remove all '\r' characters, then replace all '\n'
      // characters with '\r\n'.
      data = data.replace(/\r/gi, "").replace(/\n/gi, '\r\n');
    }

    return data;
  }

  // Adds a ' ' character to the end of the string if it doesn't
  // already end with space or newline.
  private addSpace(data: string): string
  {
    let lastCharacter = data[data.length - 1];
    let lastTwoCharacters = data.substr(data.length - 2, 2);

    let endsWithSpace = lastCharacter === ' ';
    let endsWithNewline = lastCharacter === '\n'
                       || lastTwoCharacters === '\r\n'
                       || lastTwoCharacters === '\n\r';  
    
    if (endsWithSpace || endsWithNewline)
      return data;

    return data + " ";
  }
}

// ------------------ Type declarations ----------------------

/*
  Pozn: Jedna možnost je používat Cathegory a pak nějaké Subcathegory,
    druhá možnost je udělat enum co nejpodrobnější a nad ním postavit
    nějaké grupy (třeba metodou isCommunication, která prostě vyjmenuje
    všechny hodnoty enumu, které spadají do komunikace).
    - zkusím druhou možnost, uvidíme.
*/

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module Message
{
  export enum Type
  {
    // -------------------- Communication ------------------------
    TELL,
    GOSSIP,
    GOSSIPEMOTE,
    SAY,
    QUEST,
    WIZNET,
    SHOUT,
    EMOTE,
    INFO,
    // --------------------- Syslog messages ---------------------
    // Sent when ERROR() triggered somewhere in code.
    RUNTIME_ERROR,
    // Sent when FATAL_ERROR() triggers somewhere in code.
    FATAL_RUNTIME_ERROR,
    // System reports that something is ok (game is successfuly loaded, etc.).
    SYSTEM_INFO,
    // System reports that something didn't go as expected
    // (socket errors, file read errors, etc.)
    SYSTEM_ERROR,
    // Messages from telnet server.
    TELNET_SERVER,
    // Sent when ingame script fails to compile (for example due to syntax errors).
    SCRIPT_COMPILE_ERROR,
    // Sent when ingame script encounters runtime error.
    SCRIPT_RUNTIME_ERROR,
    // Send when someone tries to access invalid entity reference
    // or invalid value variable.
    INVALID_ACCESS,
    // --------------------- Prompt messages ---------------------
    /// Prompt se asi bude přilepovat automaticky.
    /// PROMPT,
    // Authentication messages like "Enter your password:"
    AUTH_PROMPT,
    // ------------------------- Commands ------------------------
    // Skill messages
    SKILL,
    // Spell messages
    SPELL,
    // (Output from non-skill commands like 'who', 'promote', etc.).
    COMMAND,
    // Output from 'look', 'examine', etc.
    INSPECT 
  }

  // Extends enum with value attributes and getAttributes() method.
  export namespace Type
  {
    let attributes =
    {
      TELL:                 { color: { base: '&g', quotes: '&w', speech: '&C' } },
      GOSSIP:               { color: { base: '&m', quotes: '&w', speech: '&y' } },
      GOSSIPEMOTE:          { color: { base: '&m',               speech: '&c' } },
      SAY:                  { color: { base: '&w', quotes: '&w', speech: '&c' } },
      QUEST:                { color: { base: '&g', quotes: '&w', speech: '&c' } },
      WIZNET:               { color: { base: '&C',  colon: '&w', speech: '&c' } },
      SHOUT:                { color: { base: '&G', quotes: '&w', speech: '&y' } },
      EMOTE:                { color: { base: '&g' } },
      INFO:                 { color: { base: '&W',   info: '&R', speech: '&w' } },
      // --------------------- Syslog messages ---------------------
      RUNTIME_ERROR:        { color: { base: '&w' } },
      FATAL_RUNTIME_ERROR:  { color: { base: '&g' } },
      SYSTEM_INFO:          { color: { base: '&g' } },
      SYSTEM_ERROR:         { color: { base: '&g' } },
      TELNET_SERVER:        { color: { base: '&g' } },
      SCRIPT_COMPILE_ERROR: { color: { base: '&g' } },
      SCRIPT_RUNTIME_ERROR: { color: { base: '&g' } },
      INVALID_ACCESS:       { color: { base: '&g' } },
      // --------------------- Prompt messages ---------------------
      /// PROMPT:           { color: { base: '&w' } },
      AUTH_PROMPT:          { color: { base: '&w' } },
      // ------------------------- Commands ------------------------
      SKILL:                { color: { base: '&g' } },
      SPELL:                { color: { base: '&g' } },
      COMMAND:              { color: { base: '&g' } },
      INSPECT:              { color: { base: '&g' } }
    }
    
    // -> Returns null if enum value isn't found.
    export function getAttributes(value: Type)
    {
      // Full name of the enum (used in error message if value isn't found
      // in attributes).
      let enumName = 'Part.Type';

      // "Dereferenced" enmum value (it's string representation).
      let stringValue = Message.Type[value];

      return Utils.getEnumAttributes(attributes, enumName, stringValue);
    }
  }

  /*
  // Note: Whether sender should receive the message or not
  //   is indicated by sendToSelf flag.
  export enum Target
  {
    // This is used to send messages to player in menu, entering password, etc.
    // (They don't have a game entity attached yet.)
    CONNECTION,
    SINGLE_RECIPIENT,
    ALL_IN_ROOM,
    ALL_IN_SHOUTING_DISTANCE,
    // Send the message to all game entities that have
    // a player connection attached.
    ALL_IN_GAME,
    // Send the message even to players in menu,
    // in OLC, entering their password, etc.
    ALL_ACTIVE_CONNECTIONS
  }
  */
}