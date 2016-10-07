/*
  Part of BrutusNEXT

  Base color codes of messages.
*/

import {ERROR} from '../../shared/error/ERROR';
import {Message} from '../../server/message/Message';

export class MessageColors
{
  // Base message colors for each Message.Type.
  private static baseColors =
  {
    // -------------------- Communication ------------------------
    
    TELL:                  '&g',
    GOSSIP:                '&m',
    GOSSIPEMOTE:           '&m',
    SAY:                   '&w',
    QUEST:                 '&g',
    WIZNET:                '&C',
    SHOUT:                 '&G',
    EMOTE:                 '&g',
    INFO:                  '&W',

    // --------------------- Syslog messages ---------------------

    RUNTIME_ERROR:         '&w',
    FATAL_RUNTIME_ERROR:   '&g',
    SYSTEM_INFO:           '&g',
    SYSTEM_ERROR:          '&g',
    TELNET_SERVER:         '&g',
    SCRIPT_COMPILE_ERROR:  '&g',
    SCRIPT_RUNTIME_ERROR:  '&g',
    INVALID_ACCESS:        '&g',

    // --------------------- Prompt messages ---------------------

    /// PROMPT:            '&w',
    AUTH_PROMPT:           '&w',

    // ------------------------- Commands ------------------------

    SKILL:                 '&g',
    SPELL:                 '&g',
    COMMAND:               '&g'
  }

  // Accesses MessageColors.colors table, prints error if there is no
  // such record.
  public static getBaseColor(msgType: Message.Type): string
  {
    let baseColor = MessageColors.baseColors[Message[msgType]];

    if (baseColor === undefined)
    {
      ERROR("Missing color for Message.Type"
        + " '" + Message[msgType] + "'" );
      // Default base color is '&w'.
      return '&w';
    }

    return baseColor; 
  }
}