/*
  Part of BrutusNEXT

  Color codes used for all kind of messages.
*/

class MessageColors
{
  // Colors for each MessagePart.Type.
  private static colors =
  {
    // ==================  Single-part Messages ==================

    // -------------------- Communication ------------------------
    
    TELL:                  { base: '&g', quotes: '&w', speech: '&C' },
    GOSSIP:                { base: '&m', quotes: '&w', speech: '&y' },
    GOSSIPEMOTE:           { base: '&m',               speech: '&c' },
    SAY:                   { base: '&w', quotes: '&w', speech: '&c' },
    QUEST:                 { base: '&g', quotes: '&w', speech: '&c' },
    WIZNET:                { base: '&C', colon : '&w', speech: '&c' },
    SHOUT:                 { base: '&G', quotes: '&w', speech: '&y' },
    EMOTE:                 { base: '&g'                             },
    INFO:                  { base: '&W', info  : '&R', speech: '&w' },

    // --------------------- Syslog messages ---------------------

    RUNTIME_ERROR:         { base: '&w' },
    FATAL_RUNTIME_ERROR:   { base: '&g' },
    SYSTEM_INFO:           { base: '&g' },
    SYSTEM_ERROR:          { base: '&g' },
    TELNET_SERVER:         { base: '&g' },
    SCRIPT_COMPILE_ERROR:  { base: '&g' },
    SCRIPT_RUNTIME_ERROR:  { base: '&g' },
    INVALID_ACCESS:        { base: '&g' },

    // --------------------- Prompt messages ---------------------

    /// PROMPT:            { base: '&w' },
    AUTH_PROMPT:           { base: '&w' },

    // ------------------------- Commands ------------------------

    SKILL:                 { base: '&g' },
    SPELL:                 { base: '&g' },
    COMMAND:               { base: '&g' },
    INSPECT:               { base: '&g' },

    // ==================  Multi-part Messages ===================

    // ---------------------- Room Contents ----------------------
    // (Shows when you use 'look' command in a room.)

    ROOM_NAME:             { base: '&g' },
    ROOM_DESCRIPTION:      { base: '&g' },
    ROOM_EXIT:             { base: '&g' },
    OBJECT_ON_THE_GROUND:  { base: '&g' },
    MOB_IN_THE_ROOM:       { base: '&g' },

    // --------------------- Container Contents ------------------
    // (Shows when you use 'examine container' or when you use 'look'
    //  when inside a container.)

    CONTAINER_NAME:        { base: '&g' },
    CONTAINER_DESCRIPTION: { base: '&g' },
    CONTAINER_EXIT:        { base: '&g' },
    OBJECT_IN_CONTAINER:   { base: '&g' },
    MOB_IN_A_CONTAINER:    { base: '&g' }
  }
}