/*
  Part of BrutusNEXT

  Provides description for websocket close events.
*/

export module WebSocketEvent
{
  export const TAB_CLOSED = "Browser tab has been closed.";

  export function description(code: number)
  {
    if (code >= 0 && code <= 999)
    {
      return "Reserved and not used.";
    }

    if (code === 1000)  // CLOSE_NORMAL;
    {
      return "Normal closure; the connection successfully"
          + " completed whatever purpose for which it was"
          + " created.";
    }

    if (code === 1001)  // CLOSE_GOING_AWAY
    {
      return "The endpoint is going away, either because of"
          + " a server failure or because the browser is"
          + " navigating away from the page that opened the"
          + " connection.";
    }

    if (code === 1002)  // CLOSE_PROTOCOL_ERROR
    {
      return "The endpoint is terminating the connection due"
          + " to a protocol error.";
    }

    if (code === 1003)  // CLOSE_UNSUPPORTED
    {
      return "The connection is being terminated because the"
          + " endpoint received data of a type it cannot accept"
          + " (for example, a text-only endpoint received binary"
          + " data)";
    }

    if (code === 1004)
    {
      return "Reserved. A meaning might be defined in the future."
    }

    if (code === 1005)  // CLOSE_NO_STATUS
    {
      return "Reserved. Indicates that no status code was provided"
          + " even though one was expected."
    }

    if (code === 1006)  // CLOSE_ABNORMAL
    {
      return "Reserved. Used to indicate that a connection was"
          + " closed abnormally (that is, with no close frame"
          + " being sent) when a status code is expected.";
    }

    if (code === 1007)  // Unsupported Data
    {
      return "The endpoint is terminating the connection because"
          + " a message was received that contained inconsistent"
          + " data (e.g., non-UTF-8 data within a text message)."
    }

    if (code === 1008)  // Policy Violation
    {
      return "The endpoint is terminating the connection because"
          + " it received a message that violates its policy. This"
          + " is a generic status code, used when codes 1003 and"
          + " 1009 are not suitable.";
    }

    if (code === 1009)  // CLOSE_TOO_LARGE
    {
      return "The endpoint is terminating the connection because"
          + " a data frame was received that is too large."
    }

    if (code === 1010)  // Missing Extension
    {
      return "The client is terminating the connection because it"
          + " expected the server to negotiate one or more extension,"
          + " but the server didn't.";
    }

    if (code === 1011)  // Internal Error
    {
      return "The server is terminating the connection because it"
          + " encountered an unexpected condition that prevented"
          + " it from fulfilling the request."
    }

    if (code === 1012)  // Service Restart
    {
      return "The server is terminating the connection because it"
          + " is restarting.";
    }

    if (code === 1013)  // Try Again Later
    {
      return "The server is terminating the connection due to a"
          + " temporary condition, e.g. it is overloaded and is"
          + " casting off some of its clients.";
    }

    if (code === 1014)
    {
      return "Reserved for future use by the WebSocket standard.";
    }

    if (code === 1015)  // TLS Handshake
    {
      return "Reserved. Indicates that the connection was closed"
         + " due to a failure to perform a TLS handshake (e.g.,"
         + " the server certificate can't be verified).";
    }

    if (code >= 1016 && code <= 1999)
    {
      return "Reserved for future use by the WebSocket standard.";
    }

    if (code >= 2000 && code <= 2999)
    {
      return "Reserved for use by WebSocket extensions.";
    }

    if (code >= 3000 && code <= 3999)
    {
      return "Available for use by libraries and frameworks."
          + " May not be used by applications. Available for"
          + " registration at the IANA via first-come, first-serve."
    }
    
    if (code >= 4000 && code <= 4999)
    {
      return "Available for use by applications."
    }

    return "Undefined event code.";
  }
}