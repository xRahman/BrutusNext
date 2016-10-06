/*
  Part of BrutusNEXT

  Color codes used for all kind of messages.
*/

import {ERROR} from '../../shared/error/ERROR';
import {MessagePart} from '../../server/message/MessagePart';

export class MessageColors
{
  // Colors for each MessagePart.Type.
  private static colors =
  {
    // ==================  Single-part Messages ==================

    // -------------------- Communication ------------------------
    
    TELL:                  { BASE: '&g', QUOTES: '&w', SPEECH: '&C' },
    GOSSIP:                { BASE: '&m', QUOTES: '&w', SPEECH: '&y' },
    GOSSIPEMOTE:           { BASE: '&m',               SPEECH: '&c' },
    SAY:                   { BASE: '&w', QUOTES: '&w', SPEECH: '&c' },
    QUEST:                 { BASE: '&g', QUOTES: '&w', SPEECH: '&c' },
    WIZNET:                { BASE: '&C', COLON : '&w', SPEECH: '&c' },
    SHOUT:                 { BASE: '&G', QUOTES: '&w', SPEECH: '&y' },
    EMOTE:                 { BASE: '&g'                             },
    INFO:                  { BASE: '&W', INFO  : '&R', SPEECH: '&w' },

    // --------------------- Syslog messages ---------------------

    RUNTIME_ERROR:         { BASE: '&w' },
    FATAL_RUNTIME_ERROR:   { BASE: '&g' },
    SYSTEM_INFO:           { BASE: '&g' },
    SYSTEM_ERROR:          { BASE: '&g' },
    TELNET_SERVER:         { BASE: '&g' },
    SCRIPT_COMPILE_ERROR:  { BASE: '&g' },
    SCRIPT_RUNTIME_ERROR:  { BASE: '&g' },
    INVALID_ACCESS:        { BASE: '&g' },

    // --------------------- Prompt messages ---------------------

    /// PROMPT:            { BASE: '&w' },
    AUTH_PROMPT:           { BASE: '&w' },

    // ------------------------- Commands ------------------------

    SKILL:                 { BASE: '&g' },
    SPELL:                 { BASE: '&g' },
    COMMAND:               { BASE: '&g' },
    INSPECT:               { BASE: '&g' },

    // ==================  Multi-part Messages ===================

    // ---------------------- Room Contents ----------------------
    // (Shows when you use 'look' command in a room.)

    ROOM_NAME:             { BASE: '&g' },
    ROOM_DESCRIPTION:      { BASE: '&g' },
    ROOM_EXIT:             { BASE: '&g' },
    OBJECT_ON_THE_GROUND:  { BASE: '&g' },
    MOB_IN_THE_ROOM:       { BASE: '&g' },

    // --------------------- Container Contents ------------------
    // (Shows when you use 'examine container' or when you use 'look'
    //  when inside a container.)

    CONTAINER_NAME:        { BASE: '&g' },
    CONTAINER_DESCRIPTION: { BASE: '&g' },
    CONTAINER_EXIT:        { BASE: '&g' },
    OBJECT_IN_CONTAINER:   { BASE: '&g' },
    MOB_IN_A_CONTAINER:    { BASE: '&g' }
  }

  // Accesses MessageColors.colors table, prints error if there is no
  // such record.
  public static get
  (
    msgPartType: MessagePart.Type,
    colorType: MessageColors.ColorType
  )
  : string
  {
    const defaultColor = '&w';
    let colorRecord = MessageColors.colors[MessagePart[msgPartType]];

    if (colorRecord === undefined)
    {
      ERROR("Missing color record for messagePartType"
        + " '" + MessagePart[msgPartType] + "'" );
      return defaultColor;
    }

    let color = colorRecord[colorType];

    if (color === undefined)
    {
      ERROR("Unknown color type '" + colorType + "' for"
        + " messagePartType '" + MessagePart[msgPartType] + "'" );
      return defaultColor;
    }

    return color; 
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module MessageColors
{
  export enum ColorType
  {
    BASE,
    QUOTES,
    SPEECH,
    COLON,
    INFO
  }
}
