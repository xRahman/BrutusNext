/*
  Part of BrutusNEXT

  Any text that is send to players.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Utils} from '../../shared/Utils';
import {Server} from '../../server/Server';
import {Connection} from '../../server/connection/Connection';
import {MessageColors} from '../../server/message/MessageColors';
import {TelnetSocketDescriptor}
  from '../../server/net/telnet/TelnetSocketDescriptor';
import {AdminLevel} from '../../server/AdminLevel';
import {GameEntity} from '../../game/GameEntity';

export class Message
{
  constructor(text: string, msgType: Message.Type)
  {
    this.type = msgType;

    this.text = text;
  }

  // -------------- Static class data -------------------

  // Newlines are normalized to this one before message is sent.
  static get NEW_LINE() { return '\r\n'; }

  //------------------ Public data ----------------------

  //------------------ Private data ---------------------

  // 'sender' can be null (for example for syslog messages, global infos, etc.) 
  private sender: GameEntity = null;
  private type: Message.Type = null;
  private text: string = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // Creates a new message and sends it directly to player connection.
  // This is used to send message to player is menu, entering password,
  // etc., who don't have ingame entity attached.
  public static sendToConnection
  (
    text: string,
    msgType: Message.Type,
    connection: Connection
  )
  {
    let message = new Message(text, msgType);

    message.sendToConnection(connection);
  }

  // Creates a new message and sends it to a single game entity.
  // 'sender' can be null (for example for command output).
  public static sendToGameEntity
  (
    text: string,
    msgType: Message.Type,
    target: GameEntity,
    sender: GameEntity = null
  )
  {
    let message = new Message(text, msgType);

    message.sendToGameEntity(target, sender);
  }

  // Creates a new message and sends it to all entities
  // in the same container (usually room) as sender.
  public static sendToSay
  (
    text: string,
    msgType: Message.Type,
    sender: GameEntity
  )
  {
    // Sender must be valid so we can find her location.
    if (sender === null || sender.isValid() === false)
    {
      ERROR("Invalid sender. Message is not sent");
      return;
    }

    let message = new Message(text, msgType);

    message.sendToSay(sender);
  }

  // Creates a new message and sends it to all entities
  // in shouting distance of sender.
  public static sendToShout
  (
    text: string,
    msgType: Message.Type,
    sender: GameEntity
  )
  {
    // Sender must be valid so we can find her location.
    if (sender === null || sender.isValid() === false)
    {
      ERROR("Invalid sender. Message is not sent");
      return;
    }

    let message = new Message(text, msgType);

    message.sendToShout(sender);
  }

  // Creates a new message and sends it to all player connections
  // that have a valid ingame entity. 'visibility' limits recipients
  // to certain admin level or higher.
  // (Used to send gossips, global infos, syslog, etc.).
  public static sendToAllIngameConnections
  (
    text: string,
    msgType: Message.Type,
    visibility: AdminLevel,
    sender: GameEntity = null)
  {
    let message = new Message(text, msgType);

    message.sendToAllIngameConnections(visibility, sender);
  }

  // Creates a new message and sends it even to players
  // in menu, entering password, etc.
  // (Used for messages like shutdown countdown.)
  public static sendToAllConnections
  (
    text: string,
    msgType: Message.Type,
    sender: GameEntity
  )
  {
    let message = new Message(text, msgType);

    message.sendToAllConnections(sender);
  }

  // ---------------- Public methods --------------------

  public sendToConnection(connection: Connection)
  {
    if (connection === null || connection.isValid() === false)
    {
      ERROR("Invalid target connection. Message is not sent");
      return;
    }

    connection.sendMessage(this);
  }

  public sendToGameEntity(target: GameEntity, sender: GameEntity = null)
  {
    if (target === null || target.isValid() === false)
    {
      ERROR("Invalid message recipient. Message is not sent");
      return;
    }

    this.sender = sender;

    // Null connection means that no player is connected to target entity. 
    if (target.connection === null)
    {
      target.addOfflineMessage(sender, this);
    }
    else
    {
      this.sendToConnection(target.connection);
    }
  }

  public sendToSay(sender: GameEntity = null)
  {
    // Sender must be valid so we can find her location.
    if (sender === null || sender.isValid() === false)
    {
      ERROR("Invalid sender. Message is not sent");
      return;
    }

    this.sender = sender;

    // TODO
  }

  public sendToShout(sender: GameEntity = null)
  {
    // Sender must be valid so we can find her location.
    if (sender === null || sender.isValid() === false)
    {
      ERROR("Invalid sender. Message is not sent");
      return;
    }

    this.sender = sender;

    // TODO

    /// Pozn: Shouting distance (počet roomů) přečíst ze sendera.
    /// (tady bude sender povinny)
  }

  // Sends message to all player connections that have a valid ingame entity.
  // 'visibility' limits recipients to certain admin level or higher.
  // (Used to send gossips, global infos, syslog, etc.).
  public sendToAllIngameConnections(visibility: AdminLevel, sender: GameEntity = null)
  {
    this.sender = sender;

    Server.sendToAllIngameConnections(this, visibility);
  }

  // Sends message even to players in menu, entering password, etc.
  // (Used for messages like shutdown countdown.)
  public sendToAllConnections(sender: GameEntity = null)
  {
    this.sender = sender;

    Server.sendToAllConnections(this);
  }

  /// Message.Type can now be used instead.
  /// (Or maybe not. It'll better leave this here.)
  /*
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
  */

  // Composes the full message text
  // (adds base color, adds prompt, adds a space to separate user input).
  public compose(): string
  {
    // Remove all white spaces (including tabs and newlines)
    // from the end of the string.
    let data = Utils.trimRight(this.text);

    // Add color code depending on Message.type to the beginning of the
    // string (only if there isn't already a color code there), replaces
    // all '&_' codes (meaning 'return to base color') with base color
    // color code.
    data = this.addBaseColor(data);
    
    // Changes all '\n', '\r\n' or '\n\r\' to sequence specified
    // in Message.NEW_LINE (which is '\r\n'). 
    data = this.normalizeNewlines(data);

    // Add ingame prompt if this type of message triggers it.
    if (this.triggersPrompt())
    {
      // Two newlines create an empty line between message body and prompt.
      data += Message.NEW_LINE
            + Message.NEW_LINE
      /// TODO: Ve skutečnosti asi spíš target.generatePrompt(),
            /// tj. target budu muset předávat jako parametr.
            + this.generatePrompt();
    }

    // Add space to the end of the message to separate it from user input.
    // (Only if it doesn't end with space already or with a newline - it
    //  might be part of generated prompt.) 
    return this.addSpace(data);
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
      case Message.Type.AUTH_INFO:
      case Message.Type.AUTH_ERROR:
      case Message.Type.LOGIN_INFO:
      case Message.Type.CONNECTION_INFO:
      case Message.Type.GAME_MENU:
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
      data = data.replace(/\r/gi, "").replace(/\n/gi, Message.NEW_LINE);
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

  private addBaseColor(str: string): string
  {
    // There is no point in formatting an empty string.
    if (str.length === 0)
      return str;

    let baseColor = MessageColors.getBaseColor(this.type);

    // Replace 'base color' dummy codes with actual color
    // code for base color ('base color' codes ('&_') needs
    // to be parsed and replaced here, because we may loose
    // information about base color if text starts with some
    // other color).
    str = str.replace(/&_/gi, baseColor)

    // Get up to two characters beginning at index 0.
    let firstTwoCharacters = str.substr(0, 2);

    // Add base color to the start of the string, but only if
    // it doesn't start with color code.
    if (TelnetSocketDescriptor.isColorCode(firstTwoCharacters))
      return baseColor + str;
    else
      return str;      
  }
}

// ------------------ Type declarations ----------------------

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

    // ------------------ Authentication messages ----------------

    // Authentication messages like "Enter your password:"
    AUTH_PROMPT,
    // Authentication messages like "You have reconnected to your character."
    AUTH_INFO,
    // Something went wrong while authenticating.
    AUTH_ERROR,
    // Screen show before entering menu (MOTD, last logind info).
    LOGIN_INFO,

    // -------------------- Connection messages ------------------
    
    CONNECTION_INFO,

    // ------------------------- Game menu -----------------------

    GAME_MENU,

    // ------------------------- Commands ------------------------

    // Skill messages
    SKILL,
    // Spell messages
    SPELL,
    // (Output from non-skill commands like 'who', 'promote', etc.).
    COMMAND
  }

  /*
  export enum Type
  {
    // ==================  Single-part Messages ==================

    COMMUNICATION,
    SYSLOG,
    PROMPT,
    COMMAND,

    // ==================  Multi-part Messages ===================

    ROOM_CONTENTS,
    CONTAINER_CONTENTS
  }
  */

  /// Tohle nakonec nepoužiju. Nechám si to tu jako příklad jak
  /// implementovat obecné atributy k enumu.
  /*
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
  */

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