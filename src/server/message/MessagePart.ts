/*
  Part of BrutusNEXT

  An atomic part of a message.

  (For example a description of a room in a message sent when
   player looks into the room.)
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Utils} from '../../shared/Utils';
import {Message} from '../../server/message/Message';

/*
export module MessagePart
{
  export class Type
  {
    // This is used when message only has one part or if all
    // parts are "of the same type".
    SAME_AS_MESSAGE;
    // For example a line with the name of the room.
    TITLE,
    // Description of the room, object, mob, etc.
    DESCRIPTION,
    // List of exits.
    EXIT,
    // Object name when listed on the ground.
    OBJECT_ON_THE_GROUND,
    // Object name when listed in a container or inventory.
    OBJECT_IN_CONTAINER,
    // Mob when listed in room contents.
    MOB_IN_THE_ROOM,
    // Mob when lister in container or inventory contents.
    MOB_IN_A_CONTAINER
  }
}
*/

export class MessagePart
{
  constructor
  (
    text: string,
    messageType: Message.Type,
    messagePartType: MessagePart.Type
  )
  {
    this.messageType = messageType;
    this.messagePartType = messagePartType;

    // Add base color according to message (or message part) type.
    this.text = this.addBaseColor(text);
  }

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  public messageType: Message.Type = null;
  public messagePartType: MessagePart.Type = MessagePart.Type.SAME_AS_MESSAGE;
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
    // There is no point in formatting empty string.
    if (text.length === 0)
      return text;

    // If text already starts with a color code, don't 
    if (text[0] === '&' && text.length >= 2)
      return text;

    let baseColor = this.getColorByMessagePartType();

    
    // TODO: Nastavení baseColor textu podle typu.
    //
    // switch (this.type)
    // {
    // }

    return baseColor + text;
  }

  private getColorByMessageType(): string
  {
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
    if (this.messagePartType === MessagePart.Type.SAME_AS_MESSAGE)
      return this.getColorByMessageType();

    // Access attributes for enum value 'this.messagePartType';
    let attributes = MessagePart.Type.getAttributes(this.messagePartType); 

    if (attributes === null || attributes.color === undefined)
      return '&w';

    return attributes.color;

    /*
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
    */
  }
}

// ------------------ Type declarations ----------------------


// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module MessagePart
{
  export enum Type
  {
    // This is used when message only has one part or if all
    // parts are "of the same type".
    SAME_AS_MESSAGE,
    // For example a line with the name of the room.
    TITLE,
    // Description of the room, object, mob, etc.
    DESCRIPTION,
    // List of exits.
    EXIT,
    // Object name when listed on the ground.
    OBJECT_ON_THE_GROUND,
    // Object name when listed in a container or inventory.
    OBJECT_IN_CONTAINER,
    // Mob when listed in room contents.
    MOB_IN_THE_ROOM,
    // Mob when lister in container or inventory contents.
    MOB_IN_A_CONTAINER
  }

  // Extends enum with value attributes and getAttributes() method.
  export namespace Type
  {
    let attributes =
    {
      SAME_AS_MESSAGE:      { color: '&w' },
      TITLE:                { color: '&R' },
      DESCRIPTION:          { color: '&w' },
      EXIT:                 { color: '&y' },
      OBJECT_ON_THE_GROUND: { color: '&g' },
      OBJECT_IN_CONTAINER:  { color: '&g' },
      MOB_IN_THE_ROOM:      { color: '&y' },
      MOB_IN_A_CONTAINER:   { color: '&y' }
    }
    
    // -> Returns null if enum value isn't found.
    export function getAttributes(value: Type)
    {
      // Full name of the enum (used in error message if value isn't found
      // in attributes).
      let enumName = 'MessagePart.Type';

      // "Dereferenced" enmum value (it's string representation).
      let stringValue = MessagePart.Type[value];

      return Utils.getEnumAttributes(attributes, enumName, stringValue);
    }
  }
}