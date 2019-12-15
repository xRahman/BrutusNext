/*  Part of Kosmud  */

import { ClassFactory } from "../../Shared/Class/ClassFactory";
import { WebSocketEvent } from "../../Shared/Net/WebSocketEvent";
import { Types } from "../../Shared/Utils/Types";
import { Player } from "../../Client/Game/Player";
import { Packet } from "../../Shared/Protocol/Packet";
import { SystemMessage } from "../../Shared/Protocol/SystemMessage";
import { ZoneUpdate } from "../../Client/Protocol/ZoneUpdate";
import { EnterFlightResponse } from
  "../../Client/Protocol/EnterFlightResponse";
import { KeyboardInput } from "../../Shared/Protocol/KeyboardInput";
import { MouseInput } from "../../Shared/Protocol/MouseInput";
import { SetWaypoint } from "../../Shared/Protocol/SetWaypoint";
import { LoginRequest } from "../../Shared/Protocol/LoginRequest";
import { LoginResponse } from "../../Client/Protocol/LoginResponse";
import * as Shared from "../../Shared/Net/Connection";

/// TEST
import { EnterFlightRequest } from "../../Shared/Protocol/EnterFlightRequest";

// 3rd party modules.
// Use 'isomorphic-ws' to use the same code on both client and server.
import * as WebSocket from "isomorphic-ws";

// Register prototypes of packet classes.
ClassFactory.registerClassPrototype(SystemMessage);
ClassFactory.registerClassPrototype(ZoneUpdate);
ClassFactory.registerClassPrototype(EnterFlightResponse);
ClassFactory.registerClassPrototype(LoginRequest);
ClassFactory.registerClassPrototype(LoginResponse);
ClassFactory.registerClassPrototype(KeyboardInput);
ClassFactory.registerClassPrototype(MouseInput);
ClassFactory.registerClassPrototype(SetWaypoint);

export class Connection extends Shared.Connection<Player>
{
  private static connection: Connection | "Not connected" = "Not connected";

  constructor(address: string)
  {
    super(new WebSocket(address));
  }

  // ------------- Public static methods ----------------

  // ! Throws exception on error.
  public static connect()
  {
    if (this.isOpen())
      throw Error("Already connected");

    if (!this.browserSupportsWebSockets())
      throw Error("Your browser doesn't support websockets.");

    this.registerBeforeUnloadEvent();

    // There is no point in error handling here, because opening
    // a socket is asynchronnous. If an error occurs, 'error' event
    // is fired and onSocketError() is executed.
    //   For the same reason we can't send anything to the socket until
    // it's actually open - see this.onOpen().
    //   We don't need to specify port because websocket server runs
    // inside https server so it automaticaly uses htts port.
    this.connection = new Connection(`wss://${window.location.hostname}`);
  }

  public static isOpen()
  {
    if (this.connection ===  "Not connected")
      return false;

    return this.connection.isOpen();
  }

  /// TODO: reconnect should probably be static because it will
  ///   be necessary to create new connection instance.
  // // Attempts to reconnect.
  // public static reConnect()
  // {
  //   ///console.log('reConnect(). Status: ' + this.socket.readyState);

  //   if (this.isOpen())
  //     // There is no point in reconnecting an open socket.
  //     /// TODO: Tohle by asi měl bejt error (exception).
  //     return;

  //   if (this.isConnecting())
  //   /// TODO: Tohle by asi měl bejt error (exception).
  //     // There is no point if the socket is already trying to connect.
  //     return;

  //   if (this.isClosing())
  //     // If the socket is still closing, old event handlers are not yet
  //     // detached so we shouldn't create a new socket yet.
  //     /// TODO: Asi by to chtelo dát message playerovi a ideálně
  //     /// pustit auto-reconnect, pokud ještě neběží.
  //     return;

  //   this.clientMessage
  //   (
  //     'Attempting to reconnect...'
  //   );

  //   /// TODO: Hmm, tohle teď dělá Connection.connect().
  //   /// Možná by se reconnect taky měl řešit taky tam.
  //   this.connect();
  // }

  // ! Throws exception on error.
  // Make sure that you check isOpen() before you call send().
  // (You will get an exception if you try to send data to closed
  //  connection but it's better to handle it beforehand.)
  public static send(packet: Packet)
  {
    if (this.connection === "Not connected")
    {
      throw Error("Connection doesn't exist yet. Packet is not sent");
    }

    this.connection.send(packet);
  }

  // ! Throws exception on error.
  public static isLoggedIn()
  {
    // ! Throws exception on error.
    return this.getConnection().isLoggedIn();
  }

  // ! Throws exception on error.
  public static getPlayer()
  {
    // ! Throws exception on error.
    return this.getConnection().getPlayer();
  }

  // ! Throws exception on error.
  public static setPlayer(player: Player)
  {
    // ! Throws exception on error.
    this.getConnection().setPlayer(player);
  }

  // ------------- Private static methods ---------------

  private static browserSupportsWebSockets(): boolean
  {
    // tslint:disable-next-line:
    return typeof WebSocket !== "undefined";
  }

  private static registerBeforeUnloadEvent()
  {
    window.onbeforeunload = (event: BeforeUnloadEvent) =>
    {
      this.onBeforeUnload(event);
    };
  }

  private static onBeforeUnload(event: BeforeUnloadEvent)
  {
    if (this.connection === "Not connected")
      return;

    if (this.connection.isClosingOrClosed())
      return;

    // Close the connection to prevent browser from closing it
    // abnormally with event code 1006.
    //   For some strange reson this doesn't always work in Chrome.
    // If we call socket.close(1000, "Tab closed"), onClose() event
    // handler on respective server socket will receive the reason
    // but sometimes code will be 1006 instead of 1000. To circumvent
    // this, we send WebSocketEvent.REASON_CLOSE when socket is closed
    // from onBeforeUnload() and we check for it in ServerSocket.onClose().
    this.connection.close(WebSocketEvent.TAB_CLOSED);
  }

  // ! Throws exception on error.
  private static getConnection()
  {
    if (this.connection === "Not connected")
    {
      throw Error(`Connection is not open yet`);
    }

    return this.connection;
  }

  // ---------------- Public methods --------------------

  // ! Throws exception on error.
  // ~ Overrides Shared.Connection.getPlayer.
  public getPlayer(): Player
  {
    return super.getPlayer().dynamicCast(Player);
  }

  // ~ Overrides Socket.getOrigin().
  public getOrigin() { return "the server"; }

  // ~ Overrides Shared.Connection.getPlayerInfo().
  public getPlayerInfo()
  {
    return "the player";
  }

  // Disabled for now
  // // Sends system message to the connection.
  // public sendSystemMessage(message: string, type: Syslog.Type)
  // {
  //   if (this.isOpen())
  //   {
  //     let packet = new SystemMessage(message, type);

  //     this.send(packet);
  //   }
  // }

  // ---------------- Event handlers --------------------

  // ~ Overrides Client.Socket.onOpen().
  protected onOpen(event: Types.OpenEvent)
  {
    super.onOpen(event);

    /// TODO: Výhledově by tu nemělo bejt hned sendEnterFlightRequest(),
    ///   ale začátek login procesu (ať už přes username nebo přes nějakej
    ///   klíč uloženej v browseru).
    /// Test
    // sendEnterFlightRequest();
    /// Login request se nejspíš bude posílat pozdějš
    /// (až player zadá login a heslo do formu), ale zatím to nechám tady.
    sendLoginRequest();
  }

  // ~ Overrides Socket.onClose().
  protected onClose(event: Types.CloseEvent)
  {
    super.onClose(event);

    if (!WebSocketEvent.isNormalClose(event.code))
    {
      this.logSocketClosingError(event);
      reportAbnormalDisconnect(this.wasConnected);
    }
    else
    {
      reportNormalDisconnect();
    }

    /// TODO: Auto reconnect.
  }

  // --------------- Protected methods ------------------

  // ! Throws exception on error.
  // ~ Overrides PacketHandler.send()
  protected send(packet: Packet)
  {
    // ! Throws exception on error.
    this.sendData
    (
      // ! Throws exception on error.
      packet.serialize("Send to server")
    );
  }
}

// ----------------- Auxiliary Functions ---------------------

function isDeviceOnline()
{
  return navigator.onLine;
}

function reportNormalDisconnect()
{
  /// Nothing for now, alerts are not fun when testing changes.
  // alert('Server has closed the connection.');
}

function reportAbnormalDisconnect(wasConnected: boolean)
{
  if (!wasConnected)
  {
    reportConnectionFailure();
  }
  else
  {
    reportLostConnection();
  }
}

function reportLostConnection()
{
  // Test if device is online.
  if (isDeviceOnline())
  {
    alert("You have been disconnected from the server.");
  }
  else
  {
    alert("You have been disconnected. Your device reports"
      + " offline status, please check your internet connection.");
  }
}

function reportConnectionFailure()
{
  // Test is user device is online.
  if (navigator.onLine)
  {
    alert("Failed to open websocket connection."
      + " Server is down or unreachable.");
  }
  else
  {
    alert("Failed to open websocket connection. Your device reports"
      + " offline status. Please check your internet connection.");
  }
}

function sendEnterFlightRequest()
{
  Connection.send(ClassFactory.newInstance(EnterFlightRequest));
}

function sendLoginRequest()
{
  Connection.send(ClassFactory.newInstance(LoginRequest));
}