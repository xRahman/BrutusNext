/*
  Part of BrutusNext

  Socket-related types and utility functions
*/

// 3rd party modules.
// Use 'isomorphic-ws' to use the same code on both client and server.
import * as WebSocket from "isomorphic-ws";

export namespace SocketUtils
{
  export type OpenEvent =
  {
    target: WebSocket
  };

  export type MessageEvent =
  {
    data: WebSocket.Data,
    type: string,
    target: WebSocket
  };

  export type ErrorEvent =
  {
    error: Error,
    message: string,
    type: string,
    target: WebSocket
  };

  export type CloseEvent =
  {
    wasClean: boolean,
    code: number,
    reason: string,
    target: WebSocket
  };

  export function urlAndIp(url: string, ip: string): string
  {
    return `[${url} (${ip})]`;
  }
}