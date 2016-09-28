/*
  Part of BrutusNEXT

  An atomic part of a message.

  (For example a description of a room in a message sent when
   player looks into the room.)
*/

'use strict';

import {Message} from '../../server/message/Message';

export class MessagePart
{
  // -------------- Static class data -------------------

  // ---------------- Public class data -----------------

  public messageType: Message.Type = null;
  public messagePartType: MessagePart.Type = null;
  public text = null;

  // -------------- Private class data -----------------

  constructor
  (
    text: string,
    messageType: Message.Type,
    messagePartType: MessagePart.Type
  )
  {
    this.messageType = messageType;
    this.messagePartType = messagePartType;

    // Add colore according to message type
    this.text = this.format(text);
  }

  // --------------- Static accessors -------------------

  public getText(): string
  {
    return this.text;
  }

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private format(text: string): string
  {
    // TODO: Formatování textu podle typu.
    return text;
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
    // Contents of the room or other container.
    CONTENTS
  }
}