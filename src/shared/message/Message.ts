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

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {GameEntity} from '../../game/GameEntity';
import {MessagePart} from '../../shared/message/MessagePart';

export class Message
{
  // -------------- Static class data -------------------

  // ---------------- Public class data -----------------

  public type: Message.Type = null;
  public target: Message.Target = null;
  public sendToSelf = true;

  // -------------- Private class data -----------------

  private sender: GameEntity = null;

  // Recipient should only be set when this.type is
  // Message.Type.SINGLE_RECIPIENT and thissendToSelf
  // is false.
  private recipient: GameEntity = null;

  private messageParts: Array<MessagePart> = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  public addMessagePart(text: string, type: MessagePart.Type)
  {
    let messagePart = new MessagePart();

    messagePart.type = type;
    messagePart.format(text);

    if (this.messageParts === null)
      this.messageParts = [];

    this.messageParts.push(messagePart);
  }

  // Set's message recipient. Use this if the message should only
  // be sent to one target.
  private setRecipient(recipient: GameEntity)
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

    // 'equals()' compares entities by their string ids.
    if (this.sendToSelf === true && !recipient.equals(this.sender))
    {
      ERROR("Attempt to set message recipient when"
        + " 'sendToSelf' set to true. Recipient is not"
        + " set, message will be sent to sender");
      // Just to be sure.
      this.recipient = null;
      return;
    }

    this.recipient = recipient;
  }

  /*
  public gatherRecipients()
  {
    if (this.sender === null)
    {
      ERROR("Invalid sender. Set message.sender before you call"
        + " gatherRecipients()");
      return;
    }

    switch (this.target)
    {
      case Message.Target.SINGLE_RECIPIENT:
        this.gatherSingleRecipient();
        break;

      case Message.Target.ALL_IN_ROOM:
        this.gatherRoomRecipients();
        break;

      case Message.Target.ALL_IN_SHOUTING_DISTANCE:
        this.gatherShoutRecipients();
        break;

      case Message.Target.EVERYONE_IN_GAME:
        this.gatherAllInGameRecipients();
        break;

      case Message.Target.ALL_ACTIVE_CONNECTIONS:
        this.gatherAllConnections();
        break;

      default:
        ERROR("Unknown message target");
        break;
    }
  }
  */

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
        /// TODO: Přesunout tenhle test dovnitř metody, která se tu bude
        /// volat.
        if (this.recipient === null)
        {
          ERROR("Message recipient has not been inicialized."
            + " Use message.setRecipient() before message.send()."
            + " Message is not sent");
          return;
        }
        //this.gatherSingleRecipient();
        break;

      case Message.Target.ALL_IN_ROOM:
        //this.gatherRoomRecipients();
        break;

      case Message.Target.ALL_IN_SHOUTING_DISTANCE:
        //this.gatherShoutRecipients();
        break;

      case Message.Target.EVERYONE_IN_GAME:
        //this.gatherAllInGameRecipients();
        break;

      case Message.Target.ALL_ACTIVE_CONNECTIONS:
        //this.gatherAllConnections();
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
        return true;
    }

    return false;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------


  private gatherSingleRecipient()
  {
    if (this.sender === null)
    {
      ERROR("Invalid sender. Set message.sender before you call"
        + " gatherRecipients()");
      return;
    }

    // Empty the list of recipients so there are no
    // leftovers.
    this.recipients = [];

    if (this.sendToSelf === true)
    {
      this.recipients.push(this.sender);
      return;
    }

    ERROR("Attempt to gather single recipient for message"
      + " that is not sent to self. Don't call gatherRecipients()"
      + " if there is just one of them, use setRecipient() instead"); 
  }

  private gatherRoomRecipients()
  {
    /// TODO
  }

  private gatherShoutRecipients()
  {
    /// TODO
  }

  private gatherAllInGameRecipients()
  {
    // We need to ask the Server, because we need to iterate
    // over all active connections.
    this.recipients = Server.getGlobalMessageRecipients();
  }
}

/*
  Pozn: Jedna možnost je používat Cathegory a pak nějaké subcathegory,
    druhá možnost je udělat enum co nejpodrobnější a nad ním postavit
    nějaké grupy (třeba metodou isCommunication, která prostě vyjmenuje
    všechny hodnoty enumu, které spadají do komunikace).
    - zkusím druhou možnost, uvidíme.
*/

// Module is exported so you can use Message.Type and Message.Target
// from outside this file. It must be declared after the class because
// Typescript says it...
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
    // --------------------- System messages ---------------------
    SYSLOG,
    ERROR,
    SYSTEM_INFO,
    // --------------------- Prompt messages ---------------------
    PROMPT,
    // ------------------------- Commands ------------------------
    // Skill messages
    SKILL,
    // Spell messages
    SPELL,
    // (Output from non-skill commands like 'who', 'promote', etc.).
    GENERIC_COMMAND,
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
    EVERYONE_IN_GAME,
    // This sends the message even to players in menu,
    // in OLC, entering their password, etc.
    ALL_ACTIVE_CONNECTIONS
  }
}