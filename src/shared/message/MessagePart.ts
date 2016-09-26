/*
  Part of BrutusNEXT

  An atomic part of a message.

  (For example a description of a room in a message sent when
   player looks into the room.)
*/

'use strict';

export class MessagePart
{
  // -------------- Static class data -------------------

  // ---------------- Public class data -----------------

  public type: MessagePart.Type = null;
  public formattedText = null;

  // -------------- Private class data -----------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  public format(text: string)
  {
    // TODO: Formatování textu podle typu.
    this.formattedText = text;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

}

// Module is exported so you can use MessagePart.Type from outside
// this file. It must be declared after the class because Typescript
// says it...
export module MessagePart
{
  export enum Type
  {
    // For example a line with the name of the room.
    TITLE,
    // Description of the room, object, mob, etc.
    DESCRIPTION,
    // List of exits.
    EXITS,
    // Contents of the room or other container.
    CONTENTS
  }
}