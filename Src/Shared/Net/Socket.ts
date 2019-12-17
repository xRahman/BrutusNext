/*
  Part of BrutusNext

  Websocket wrapper
*/

import { REPORT } from "../../Shared/Log/REPORT";
import { Syslog } from "../../Shared/Log/Syslog";
import { WebSocketEvent } from "../../Shared/Net/WebSocketEvent";

// 3rd party modules.
// Use 'isomorphic-ws' to use the same code on both client and server.
import * as WebSocket from "isomorphic-ws";

type OpenEvent =
{
  target: WebSocket
};

type MessageEvent =
{
  data: WebSocket.Data,
  type: string,
  target: WebSocket
};

type ErrorEvent =
{
  error: Error,
  message: string,
  type: string,
  target: WebSocket
};

type CloseEvent =
{
  wasClean: boolean,
  code: number,
  reason: string,
  target: WebSocket
};

type OpenEventHandler = (event: OpenEvent) => void;
type MessageEventHandler = (event: MessageEvent) => void;
type ErrorEventHandler = (event: ErrorEvent) => void;
type CloseEventHandler = (event: CloseEvent) => void;

export abstract class Socket
{
  // This is used to determine if a socket error means that
  // we have been disconnected or that connection couldn't
  // even be established.
  private hasSocketBeenOpened = false;

  // We remember event listeners so we can remove them
  // when the socket closes.
  private readonly listeners =
  {
    onopen: "Not attached" as (OpenEventHandler | "Not attached"),
    onmessage: "Not attached" as (MessageEventHandler | "Not attached"),
    onerror: "Not attached" as (ErrorEventHandler | "Not attached"),
    onclose: "Not attached" as (CloseEventHandler | "Not attached")
  };

  constructor(private readonly webSocket: WebSocket)
  {
    // super();

    this.registerEventListeners();
  }

  // ---------------- Public methods --------------------

  public abstract getOrigin(): string;

  public isOpen(): boolean
  {
    // Note that testing 'readyState === WebSocket.CLOSED' isn't
    // the same as 'readyState !== WebSocket.OPEN'. There are also
    // 'WebSocket.CONNECTING' and 'WebSocket.CLOSING' ready states.
    return this.webSocket.readyState === WebSocket.OPEN;
  }

  // ! Throws exception on error.
  public close(reason?: string): void
  {
    // TODO: Tohle je tu asi taky zbytečně.
    if (this.isClosingOrClosed())
    {
      throw Error(`Failed to close socket to ${this.getOrigin()}`
        + ` because it is already closing or closed`);
    }

    // TODO: Proč se tady volá close? Však tohle by měla bejt
    //   informace o tom, že se socket zavírá, ne?
    this.webSocket.close(WebSocketEvent.NORMAL_CLOSE, reason);
  }

  // --------------- Protected methods ------------------

  // ! Throws exception on error.
  protected sendData(data: string): void
  {
    if (!this.isOpen())
    {
      throw Error(`Failed to send data to ${this.getOrigin()}`
        + ` because the connection is not open`);
    }

    try
    {
      this.webSocket.send(data);
    }
    catch (error)
    {
      throw Error(`Failed to send data to ${this.getOrigin()}.`
        + ` Reason: ${String(error.message)}`);
    }
  }

  protected abstract async processData(data: string): Promise<void>;

  protected logSocketClosingError(event: CloseEvent): void
  {
    let message = `Socket to ${this.getOrigin()} closed`;

    if (event.reason)
    {
      message += ` because of error: ${event.reason}`;
    }

    message += `. Code: ${event.code}.`;
    message += ` Description: "${WebSocketEvent.description(event.code)}"`;

    Syslog.log("[WEBSOCKET]", message);
  }

  protected isClosingOrClosed(): boolean
  {
    const isClosing = this.webSocket.readyState === WebSocket.CLOSING;
    const isClosed = this.webSocket.readyState === WebSocket.CLOSED;

    return isClosing || isClosed;
  }

  protected hasBeenOpened(): boolean
  {
    return this.hasSocketBeenOpened;
  }

  // ---------------- Private methods -------------------

  private registerEventListeners(): void
  {
    this.listeners.onopen = this.registerOpenEvent();
    this.listeners.onmessage = this.registerMessageEvent();
    this.listeners.onerror = this.registerErrorEvent();
    this.listeners.onclose = this.registerCloseEvent();
  }

  private registerOpenEvent(): OpenEventHandler
  {
    this.webSocket.onopen = (event) =>
    {
      this.onOpen(event);
    };

    return this.webSocket.onopen;
  }

  private registerMessageEvent(): MessageEventHandler
  {
    this.webSocket.onmessage = async (event) =>
    {
      await this.onMessage(event);
    };

    return this.webSocket.onmessage;
  }

  private registerErrorEvent(): ErrorEventHandler
  {
    this.webSocket.onerror = (event) =>
    {
      this.onError(event);
    };

    return this.webSocket.onerror;
  }

  private registerCloseEvent(): CloseEventHandler
  {
    this.webSocket.onclose = (event) =>
    {
      this.onClose(event);
    };

    return this.webSocket.onclose;
  }

  private removeEventListeners(): void
  {
    this.webSocket.onopen

    if (this.listeners.onopen !== "Not attached")
      this.webSocket.removeEventListener("open", this.listeners.onopen);

    if (this.listeners.onmessage !== "Not attached")
      this.webSocket.removeEventListener("message", this.listeners.onmessage);

    if (this.listeners.onerror !== "Not attached")
      this.webSocket.removeEventListener("error", this.listeners.onerror);

    if (this.listeners.onclose !== "Not attached")
      this.webSocket.removeEventListener("close", this.listeners.onclose);
  }

  // ---------------- Event handlers --------------------

  // TODO: Proč protected?
  private onOpen(event: OpenEvent): void
  {
    this.hasSocketBeenOpened = true;
  }

  private async onMessage(event: MessageEvent): Promise<void>
  {
    if (typeof event.data !== "string")
    {
      // Create the Error object so the stack trace is logged and
      // report it stright away beacuse we are the top level event
      // handler so there is noone else to catch this exception.
      REPORT
      (
        new Error(`Websocket to ${this.getOrigin()}`
          + ` received non-string data. Message`
          + ` will not be processed because`
          + ` we can only process string data`)
      );
      return;
    }

    try
    {
      await this.processData(event.data);
    }
    catch (error)
    {
      Syslog.reportUncaughtException(error);
    }
  }

  private onError(event: ErrorEvent): void
  {
    let message = "Socket error occured";

    if (event.message)
      message += `: ${event.message}`;

    message += `. Connection to ${this.getOrigin()} will close`;

    Syslog.log("[WEBSOCKET]", message);

    // We don't close the connection here, because when 'error'
    // event is fired, 'close' event is fired as well.
  }

  protected onClose(event: CloseEvent): void
  {
    this.removeEventListeners();
  }
}