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
import {Server} from '../../server/Server';
import {Connection} from '../../server/connection/Connection';
import {MessagePart} from '../../server/message/MessagePart';
import {GameEntity} from '../../game/GameEntity';

export class Message
{
  // -------------- Static class data -------------------

  // ---------------- Public class data -----------------

  public sender: GameEntity = null;
  public type: Message.Type = null;
  public target: Message.Target = null;
  public sendToSelf = true;

  // -------------- Private class data -----------------

  // Recipient should only be set when this.type is
  // Message.Type.SINGLE_RECIPIENT and thissendToSelf
  // is false.
  private recipient: GameEntity = null;

  private messageParts: Array<MessagePart> = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  public addMessagePart(text: string, msgPartType: MessagePart.Type)
  {
    let messagePart = new MessagePart(text, this.type, msgPartType);

    if (this.messageParts === null)
      this.messageParts = [];

    this.messageParts.push(messagePart);
  }

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

  private composeRawMessage(): string
  {
    let data = "";

    for (let messagePart of this.messageParts)
      data += messagePart.getText();

    return data;
  }

  private sendToEntity(target: GameEntity)
  {
    if (target === null || target.isValid() === false)
    {
      ERROR("Invalid message recipient. Message is not sent");
      return;
    }

    // Null connection means that no player is connected to this entity. 
    if (target.connection === null)
      target.addOfflineMessage(this);


    this.sendToConnection(target.connection);
  }

  private sendToConnection(connection: Connection)
  {
    if (connection.isValid() === false)
    {
      ERROR("Invalid message recipient. Message is not sent");
      return;
    }

    let data = this.composeRawMessage();
    
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
        connection.sendAsBlock(data);
        break;
    }
  }

  private sendToRoom()
  {
    // TODO
  }

  private sendToShout()
  {
    // TODO

    /// Pozn: Shouting distance (počet roomů) přečíst ze sendera.
  }

  private sendToGame()
  {
    this.sendToAllConnections({ onlyInGame: true });
  }

  private sendToAllConnections(param: { onlyInGame: boolean })
  {
    let connections = Server.connections.getEntities();
    let connection: Connection = null;

    for (connection of connections.values())
    {
      // Skip invalid connections.
      if (connection === null || !connection.isValid())
        break;

      // Skip connections that don't have an ingame entity attached
      // if we are only sending to ingame entities.
      if (param.onlyInGame === true && connection.ingameEntity === null)
        break;

      this.sendToConnection(connection);
    }
  }
}

// ------------------ Type declarations ----------------------

/*
  Pozn: Jedna možnost je používat Cathegory a pak nějaké subcathegory,
    druhá možnost je udělat enum co nejpodrobnější a nad ním postavit
    nějaké grupy (třeba metodou isCommunication, která prostě vyjmenuje
    všechny hodnoty enumu, které spadají do komunikace).
    - zkusím druhou možnost, uvidíme.
*/

// Module is exported so you can use Message.Type and Message.Target
// from outside this file. It must be declared after the class because
// Typescript says so...
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
    RUNTIME_ERROR,
    FATAL_RUNTIME_ERROR,
    SYSTEM_INFO,
    SYSTEM_ERROR,
    SCRIPT_COMPILE_ERROR,
    SCRIPT_RUNTIME_ERROR,
    INVALID_ACCESS,
    // --------------------- Prompt messages ---------------------
    /// Prompt se asi bude přilepovat automaticky.
    /// PROMPT,
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

  // Note: Whether sender should receive the message or not
  //   is indicated by sendToSelf flag.
  export enum Target
  {
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
}