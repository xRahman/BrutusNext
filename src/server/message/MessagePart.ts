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
  public messagePartType: MessagePart.Type = null;
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

    let baseColor = "&w";

    // TODO: Nastavení baseColor textu podle typu.
    //
    // switch (this.type)
    // {
    // }

    return baseColor + text;
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