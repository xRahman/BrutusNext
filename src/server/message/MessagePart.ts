/*
  Part of BrutusNEXT

  An atomic part of a message.

  (For example a description of a room in a message sent when
   player looks into the room.)
*/
/*
'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Utils} from '../../shared/Utils';
import {Message} from '../../server/message/Message';
import {MessageColors} from '../../server/message/MessageColors';

export class MessagePart
{
  constructor
  (
    text: string,
    /// messageType: Message.Type,
    /// messagePartType: MessagePart.Type
    type: MessagePart.Type
  )
  {
    /// this.messageType = messageType;
    /// this.messagePartType = messagePartType;
    this.type = type;

    // Add base color according to message (or message part) type.
    this.text = this.addBaseColor(text);
  }

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  /// public messageType: Message.Type = null;
  public type: MessagePart.Type = null;
  public text = null;

  //------------------ Private data ---------------------


  // --------------- Static accessors -------------------

  public getText(): string
  {
    return this.text;
  }

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private addBaseColor(text: string): string
  {
    // There is no point in formatting an empty string.
    if (text.length === 0)
      return text;

    // Don't add base color if text already starts with color code.
    if (text[0] === '&' && text.length >= 2)
      return text;

    ///let baseColor = this.getColorByMessagePartType();
    let baseColor = MessageColors.get(this.type, MessageColors.ColorType.BASE);

    return baseColor + text;
  }

  
  private getColorByMessageType(): string
  {
    // Access attributes for enum value 'this.messageType';
    let attributes = Message.Type.getAttributes(this.messageType); 

    if
    (
      attributes === null
      || attributes.color === undefined
      || attributes.color.base === undefined
    )
    {
      return '&w';
    }

    return attributes.color.base;

    let color = '&w';

    switch (this.messageType)
    {
      // -------------------- Communication ------------------------
      case Message.Type.TELL:
        color = '&';
        break;

      case Message.Type.GOSSIP:
        color = '&';
        break;
      
      case Message.Type.GOSSIPEMOTE:
        color = '&';
        break;

      case Message.Type.SAY:
        color = '&';
        break;

      case Message.Type.QUEST:
        color = '&';
        break;

      case Message.Type.WIZNET:
        color = '&';
        break;

      case Message.Type.SHOUT:
        color = '&';
        break;

      case Message.Type.EMOTE:
        color = '&';
        break;

      case Message.Type.INFO:
        color = '&';
        break;

      // --------------------- Syslog messages ---------------------
      // Sent when ERROR() triggered somewhere in code.
      case Message.Type.RUNTIME_ERROR:
        color = '&';
        break;

      // Sent when FATAL_ERROR() triggers somewhere in code.
      case Message.Type.FATAL_RUNTIME_ERROR:
        color = '&';
        break;

      // System reports that something is ok (game is successfuly loaded, etc.).
      case Message.Type.SYSTEM_INFO:
        color = '&';
        break;

      // System reports that something didn't go as expected
      // (socket errors, file read errors, etc.)
      case Message.Type.SYSTEM_ERROR:
        color = '&';
        break;

      // Messages from telnet server.
      case Message.Type.TELNET_SERVER:
        color = '&';
        break;

      // Sent when ingame script fails to compile (for example due to syntax errors).
      case Message.Type.SCRIPT_COMPILE_ERROR:
        color = '&';
        break;

      // Sent when ingame script encounters runtime error.
      case Message.Type.SCRIPT_RUNTIME_ERROR:
        color = '&';
        break;

      // Send when someone tries to access invalid entity reference
      // or invalid value variable.
      case Message.Type.INVALID_ACCESS:
        color = '&';
        break;

      // --------------------- Prompt messages ---------------------
      /// Prompt se asi bude přilepovat automaticky.
      /// PROMPT,
      // Authentication messages like "Enter your password:"
      case Message.Type.AUTH_PROMPT:
        color = '&';
        break;

      // ------------------------- Commands ------------------------
      // Skill messages
      case Message.Type.SKILL:
        color = '&';
        break;

      // Spell messages
      case Message.Type.SPELL:
        color = '&';
        break;

      // (Output from non-skill commands like 'who', 'promote', etc.).
      case Message.Type.COMMAND:
        color = '&';
        break;

      // Output from 'look', 'examine', etc.
      case Message.Type.INSPECT:
        color = '&';
        break;

      default:
        ERROR();
        break;
    }
  }
  

  
  private getColorByMessagePartType(): string
  {
    /// return MessageColors.get(this.type, MessageColors.ColorType.BASE);
    if (this.messagePartType === MessagePart.Type.SAME_AS_MESSAGE)
      return this.getColorByMessageType();

    // Access attributes for enum value 'this.messagePartType';
    let attributes = MessagePart.Type.getAttributes(this.messagePartType); 

    if
    (
         attributes === null
      || attributes.color === undefined
      || attributes.color.base === undefined
    )
    {
      return '&w';
    }

    return attributes.color.base;



    let color = '&w';

    switch (this.messagePartType)
    {
      case MessagePart.Type.SAME_AS_MESSAGE:
        return this.getColorByMessageType();

      case MessagePart.Type.TITLE:
        color = '&R';
        break;

      case MessagePart.Type.DESCRIPTION:
        color = '&w';
        break;
      
      case MessagePart.Type.EXIT:
        color = '&y';
        break;
      
      case MessagePart.Type.OBJECT_ON_THE_GROUND:
        color = '&g';
        break;

      case MessagePart.Type.OBJECT_IN_CONTAINER:
        color = '&g';
        break;

      case MessagePart.Type.MOB_IN_THE_ROOM:
        color = '&y';
        break;

      case MessagePart.Type.MOB_IN_A_CONTAINER:
        color = '&y';
        break;
      
      default:
        ERROR("Unknown messagePartType");
        break;
    }

    return color;
  }
  
}

// ------------------ Type declarations ----------------------


// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module MessagePart
{
  export enum Type
  {
    // ==================  Single-part Messages ==================

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
    INSPECT,

    // ==================  Multi-part Messages ===================

    // ---------------------- Room Contents ----------------------
    // (Shows when you use 'look' command in a room.)

    ROOM_NAME,
    ROOM_DESCRIPTION,
    ROOM_EXIT_DESCRIPTION,
    OBJECT_ON_THE_GROUND,
    MOB_IN_THE_ROOM,

    // --------------------- Container Contents ------------------
    // (Shows when you use 'examine container' or when you use 'look'
    //  when inside a container.)

    CONTAINER_NAME,
    CONTAINER_DESCRIPTION,
    CONTAINER_EXIT,
    OBJECT_IN_CONTAINER,
    MOB_IN_A_CONTAINER
  }
}
*/