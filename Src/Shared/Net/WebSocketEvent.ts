/*
  Part of BrutusNext

  WebSocket 'close' event code descriptions
*/

import { Syslog } from "../../Shared/Log/Syslog";

type SingleValue =
{
  type: "Single value",
  code: number,
  description: string
};

type RangeOfValues =
{
  type: "Range of values",
  from: number,
  to: number,
  description: string
};

const codeRanges: Array<SingleValue | RangeOfValues> =
[
  {
    from: 0,
    to: 999,
    type: "Range of values",
    description: "Reserved and not used."
  },
  {
    code: 1000,
    type: "Single value",
    description: "Normal closure; the connection successfully"
      + " completed whatever purpose for which it was created."
  },
  {
    // CLOSE_GOING_AWAY
    code: 1001,
    type: "Single value",
    description: "The endpoint is going away, either because of"
      + " a server failure or because the browser is navigating"
      + " away from the page that opened the connection."
  },
  {
    // CLOSE_PROTOCOL_ERROR
    code: 1002,
    type: "Single value",
    description: "The endpoint is terminating the connection due"
      + " to a protocol error."
  },
  {
    // CLOSE_UNSUPPORTED
    code: 1003,
    type: "Single value",
    description: "The connection is being terminated because"
      + " the endpoint received data of a type it cannot accept"
      + " (for example, a text-only endpoint received binary data)"
  },
  {
    code: 1004,
    type: "Single value",
    description: "Reserved. A meaning might be defined in the future."
  },
  {
    // CLOSE_NO_STATUS
    code: 1005,
    type: "Single value",
    description: "Reserved. Indicates that no status code was provided"
      + " even though one was expected."
  },
  {
    // CLOSE_ABNORMAL
    code: 1006,
    type: "Single value",
    description: "Reserved. Used to indicate that a connection was"
      + " closed abnormally (that is, with no close frame being sent)"
      + " when a status code is expected."
  },
  {
    // Unsupported Data
    code: 1007,
    type: "Single value",
    description: "The endpoint is terminating the connection because"
      + " a message was received that contained inconsistent data"
      + " (e.g., non-UTF-8 data within a text message)."
  },
  {
    // Policy Violation
    code: 1008,
    type: "Single value",
    description: "The endpoint is terminating the connection because"
      + " it received a message that violates its policy. This is"
      + " a generic status code, used when codes 1003 and 1009 are"
      + " not suitable."
  },
  {
    // CLOSE_TOO_LARGE
    code: 1009,
    type: "Single value",
    description: "The endpoint is terminating the connection because"
      + " a data frame was received that is too large."
  },
  {
    // Missing Extension
    code: 1010,
    type: "Single value",
    description: "The client is terminating the connection because it"
      + " expected the server to negotiate one or more extension, but"
      + " the server didn't."
  },
  {
    // Internal Error
    code: 1011,
    type: "Single value",
    description: "The server is terminating the connection because it"
      + " encountered an unexpected condition that prevented it from"
      + " fulfilling the request."
  },
  {
    // Service Restart
    code: 1012,
    type: "Single value",
    description: "The server is terminating the connection because it"
      + " is restarting."
  },
  {
    // Try Again Later
    code: 1013,
    type: "Single value",
    description: "The server is terminating the connection due to"
      + " a temporary condition, e.g. it is overloaded and is casting"
      + " off some of its clients."
  },
  {
    code: 1014,
    type: "Single value",
    description: "Reserved for future use by the WebSocket standard."
  },
  {
    // TLS Handshake
    code: 1015,
    type: "Single value",
    description: "Reserved. Indicates that the connection was closed"
      + " due to a failure to perform a TLS handshake (e.g., the server"
      + " certificate can't be verified)."
  },
  {
    from: 1016,
    to: 1999,
    type: "Range of values",
    description: "Reserved for future use by the WebSocket standard."
  },
  {
    from: 2000,
    to: 2999,
    type: "Range of values",
    description: "Reserved for use by WebSocket extensions."
  },
  {
    from: 3000,
    to: 3999,
    type: "Range of values",
    description: "Available for use by libraries and frameworks."
      + " May not be used by applications. Available for registration"
      + " at the IANA via first-come, first-serve."
  },
  {
    from: 4000,
    to: 4999,
    type: "Range of values",
    description: "Available for use by applications."
  }
];

export namespace WebSocketEvent
{
  export const CLOSED_BY_APPLICATION = 4000;
  export const USER_CLOSED_BROWSER_TAB = 4001;

  export const TAB_CLOSED = "Browser tab has been closed.";

  // export function isNormalClose(code: number): boolean
  // {
  //   return code === NORMAL_CLOSE;
  // }

  export function getDescription(code: number): string
  {
    for (const codeRange of codeRanges)
    {
      switch (codeRange.type)
      {
        case "Single value":
          if (codeRange.code === code)
            return codeRange.description;
          break;

        case "Range of values":
          if (code >= codeRange.from && code <= codeRange.to)
            return codeRange.description;
          break;

        default:
          throw Syslog.reportMissingCase(codeRange);
      }
    }

    return "Undefined event code";
  }
}