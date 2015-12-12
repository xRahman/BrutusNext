/*
  Part of BrutusNEXT

  Implements container for information associated to a socket.
*/

import {ASSERT} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {Mudlog} from '../server/Mudlog';
import {GameServer} from '../server/GameServer';
import {AuthProcessor} from '../server/AuthProcessor';
import {LobbyProcessor} from '../server/LobbyProcessor';
import {TelnetServer} from '../server/telnet/TelnetServer';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js

export class SocketDescriptor
{
  constructor(protected mySocket: net.Socket) { }

  // ----------------- Public data ----------------------

  public get socket() { return this.mySocket; }

  public set id(value: Id) { this.myId = value; }
  public get id() { return this.myId; }

  public set accountId(value: Id) { this.myAccountId = value; }

  // ---------------- Public methods --------------------

  public startLoginProcess()
  {
    ASSERT(this.myStage === SocketDescriptor.stage.INITIAL,
      "Starting login process from wrong stage");

    this.myStage = SocketDescriptor.stage.AUTHENTICATION;

    this.myAuthProcessor.startLoginProcess();
  }

  public enterLobby()
  {
    ASSERT(this.myStage === SocketDescriptor.stage.AUTHENTICATION
      || this.myStage === SocketDescriptor.stage.IN_GAME,
      "Entering lobby from wrong stage");

    this.myStage = SocketDescriptor.stage.LOBBY;

    this.myLobbyProcessor.enterMenu();
  }

  public quitGame()
  {
    this.myStage = SocketDescriptor.stage.QUITTED_GAME;
    // Close the socket. Event 'close' will be generated on the socket,
    // which will lead to the player being logged out.
    this.mySocket.end();
  }

  public socketReceivedData(data: string)
  {
    /// DEBUG
    /// console.log("SocketDescriptor.socketReceivedData()");

    data = this.normalizeCRLF(data);

    // Do not parse protocol data if user sent just an empty newline.
    if (data !== "" && data !== '\r\n')
    {
      if ((data = this.parseProtocolData(data)) == "")
        return;
    }

    /// DEBUG
    /// console.log("Data after protocol parse: " + data);

    // Discard data that doesn't contain a newline. That's probably
    // some protocol negotiation stuff we haven't been able to catch.
    // (slice(-2) creates a substring starting at two characters from the end)
    if (data.slice(-2) !== '\r\n')
    {
      Mudlog.log(
        "Received (and discarded) data of unknown format not ending with"
        + " newline (comming from socket descriptor '"
        + this.myId + "'): " + data,
        Mudlog.msgType.SYSTEM_INFO,
        Mudlog.levels.IMMORTAL);
      return;
    }

    // Array to contain each line of input as a separate string
    let lines: Array<string> = [];

    // If input contains multiple lines, split them.
    // (data.slice(0, -2) will create a sumbstring not containing last two
    // characters, which are '\r\n' because that's what we checked for right
    // before)
    if (data.slice(0, -2).indexOf('\r\n') !== -1)
    {
      lines = data.split('\r\n');
    } else
    {
      lines.push(data);
    }

    // Handle each line as a separate command. Also trim it (remove leading
    // and trailing white spaces) before processing.
    for (let i = 0; i < lines.length; i++)
      this.processCommand(lines[i].trim());
  }

  public socketClose()
  {
    let accountManager = GameServer.getInstance().accountManager;

    if (this.myStage === SocketDescriptor.stage.IN_GAME)
    {
      /// TODO
      // Player was in game and his link has just died.
    }
    else
    {
      // Player was not in game, log him off.
      // (but only if an account is already associated to this descriptor.
      // It might not be, for example if player closed his connection
      // before entering password.)
      if (this.myAccountId)
      {
        accountManager.logOut(this.myAccountId);
      }
      else
      {
        let address = this.mySocket.remoteAddress;

        if (this.myAuthProcessor.accountName)
        {
          Mudlog.log(
            "Player " + this.myAuthProcessor.accountName
            + " closed connection before logging in",
            Mudlog.msgType.SYSTEM_INFO,
            Mudlog.levels.IMMORTAL);
        }
        else
        {
          Mudlog.log(
            "Unknown player closed connection before logging in",
            Mudlog.msgType.SYSTEM_INFO,
            Mudlog.levels.IMMORTAL);
        }
      }
    }
  }

  public socketError()
  {
    let accountManager = GameServer.getInstance().accountManager;
    let accountName = accountManager.getAccount(this.myAccountId).accountName;

    Mudlog.log(
      "Player " + accountName + " has encountered a socket error",
      Mudlog.msgType.SYSTEM_ERROR,
      Mudlog.levels.IMMORTAL);

    // (Netusim, co vsechno muze socket erorr znamenat, pripadne co je s nim
    // potreba udelat).
  }

  // Sends a string to the user.
  public send(data: string)
  {
    // Convert MUD color codes to ANSI color codes.
    /// (note: this only works for telnet and classic MUD clients)
    data = TelnetServer.ansify(data);

    this.mySocket.write(data);
  }

  public isInGame()
  {
    return this.myStage === SocketDescriptor.stage.IN_GAME;
  }

  // -------------- Protected class data ----------------

  // Empty string means that we do not yet know what account does this
  // descriptor match to.
  protected myAccountId: Id = null;

  // Unique stringId of this descriptor.
  protected myId: Id = null;

  // Buffer to accumulate incomplete parts of data stream.
  protected myBuffer = "";

  protected myAuthProcessor = new AuthProcessor(this);
  protected myLobbyProcessor = new LobbyProcessor(this);

  protected static stage =
  {
    INITIAL: 0, // Initial stage.
    AUTHENTICATION: 1,
    LOBBY: 2,
    IN_GAME: 3,
    QUITTED_GAME: 4
  }

  protected myStage = SocketDescriptor.stage.INITIAL;

  // -------------- Protected methods -------------------

  // Parses and executes a single-line command.
  protected processCommand(command: string)
  {
    switch (this.myStage)
    {
      case SocketDescriptor.stage.INITIAL:
        ASSERT(false, "SocketDescriptor has not yet been initialized by"
          + "startLoginProcess(), it is not supposed to process any"
          + " commands yet");
        break;
      case SocketDescriptor.stage.AUTHENTICATION:
        ASSERT(this.myAccountId === null,
          "Attempt to start authentication on descriptor that already has"
          + " an online account associated to it");

        this.myAuthProcessor.processCommand(command);
        break;
      case SocketDescriptor.stage.LOBBY:
        ASSERT(this.myAccountId !== null,
          "Attempt to process lobby command on descriptor that doesn't have"
          + " an online account associated to it");

        this.myLobbyProcessor.processCommand(command);
        break;
      case SocketDescriptor.stage.IN_GAME:
        ASSERT(this.myAccountId !== null,
          "Attempt to process ingame command on descriptor that doesn't have"
          + " an online account associated to it");

        GameServer.getInstance().accountManager.
          getAccount(this.myAccountId).processCommand(command);
        break;
      case SocketDescriptor.stage.QUITTED_GAME:
        ASSERT(false, "Player has quitted the game, SocketDescriptor"
          + " is not supposed to process any more commands");
        break;
      default:
        ASSERT(false, "Unknown stage");
        break;
    }
  }

  // Ensures that all newlines are in format CR;LF ('\r\n');
  protected normalizeCRLF(data: string)
  {
    if (data && data.length)
      data = data.replace(/(\r\n|\n\r)/gi, '\n').replace(/\n/gi, '\r\n');

    return data;
  }

  /// TODO: Tohle je tezke provizorum. Zatim to pouze odstrani ze streamu
  /// komunikacni kody, nic to podle nich nenastavuje. Asi by taky bylo fajn
  /// nedelat to rucne, ale najit na to nejaky modul.
  //
  // Processes any protocol-specific data and removes it from the data stream.
  protected parseProtocolData(data: string)
  {
    data = this.myBuffer + data;

    if (data.indexOf('\xff\xfb\xc9') !== -1)
    {
      // IAC WILL GMCP
      data = data.replace('\xff\xfb\xc9', '');

      /// GMCP asi chci, ale ten event se nikde nezpracovava :\
      ///user.emit('will.gmcp', this);
    }
 
    if (data.indexOf('\xff\xfd\xc9') !== -1)
    {
      // IAC DO GMCP
      data = data.replace('\xff\xfd\xc9', '');

      /// GMCP asi chci, ale ten event se nikde nezpracovava :\
      ///user.emit('do.gmcp', this);
    }

    if (data.indexOf('\xff\xfd\x5b') !== -1)
    { // IAC DO MXP
      ///log('got IAC DO MXP');
      data = data.replace('\xff\xfd\x5b', '');
      /// MXP ani nevim, co je...
      ///user.emit('do.mxp', this);
    }

    if (data.indexOf('\xff\xfc') !== -1)
    {
      // IAC WON'T *
      data = data.replace(/\xff\xfc./g, '');
    }

    if (data.indexOf('\xff\xfa\xc9') !== -1)
    {
      if (data.indexOf('\xff\xf0') === -1)
      {
        /// Ok, tohle snad jakz takz chapu: Nedosel cely GMCP packet, takze si
        /// data odlozime do bufferu, dokud nedojde zbytek.
        ///log('incomplete GMCP package', this);
        this.myBuffer = data;
        return "";
      }

      let j = data.match(/\xff\xfa\xc9([^]+?)\xff\xf0/gm);

      if (j && j.length)
      {
        for (let i = 0; i < j.length; i++)
        {
          /// Zas naprosto netusim, co tohle znamena a jak se ma zpracovat
          //// event 'gmcp'
          ///log('GMCP: ' + j[i].slice(3, -2), this);
          ///user.emit('gmcp', this, j[i].slice(3, -2));
          data = data.replace(j[i], '');
        }
      }

      if (data.indexOf('\xff\xfa\xc9') !== -1)
      {
        this.myBuffer = data;
        return "";
      }
      else
        this.myBuffer = '';
    }

 /// JSON zatim nepotrebuju
 /*
    if ((data.indexOf('{') !== -1 || data.indexOf('}') !== -1))
    {

      let json;

      if ((json = data.match(/\{[\s\S]+\}/g)))
      {
				
        //log('possible json in user input');
        for (let i in json)
        {
          if (this.receiveJSON(json[i]));
          data = data.replace(json[i], '');
        }
      }

      if (data && data.length)
      { 
        /// to do: put a limit on how long we wait for a complete json object,
        /// and process pending input another way
        if ((data.indexOf('{') !== -1 || data.indexOf('}') !== -1))
        {
          this.myBuffer = data;
          return "";
        }
      }
    }
  */

    // Nechapu, proc to nedela nic jineho, nez ze to ze streamu odmaze
    // prislusny kod...
    if (data.indexOf('��*') !== -1)
    {
      // IAC WILL CHARSET
      ///log('IAC WILL CHARSET - negotiating UTF8');
      data = data.replace('��*', '');
      //this.send(my().PROTOCOL.WILL_UTF8);
    }

    if (data.search(/[^\x00-\x7f]/) !== -1)
    {
      /*
      log('unsupported char range: ' + data.split('').map(function(i)
      {
        let n = i.charCodeAt(0);
        return my().PROTOCOL[n] || i;
      }).join(', '), this);
      */

      /// Like wtf?
      data = data.replace(/\xff\xfa[^]+?\xff\xf0/gm, '');
      data = data.replace(/\xff../g, '');
    }

    return data.trim().length ? data : "";
  }
}