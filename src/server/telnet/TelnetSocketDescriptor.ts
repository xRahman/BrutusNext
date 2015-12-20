/*
  Part of BrutusNEXT

  Encapsulates a telnet socket.
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT';
import {ASSERT_FATAL} from '../../shared/ASSERT';
import {Mudlog} from '../../server/Mudlog';
import {Server} from '../../server/Server';
import {SocketDescriptor} from '../../server/SocketDescriptor';
import {PlayerConnection} from '../../server/PlayerConnection';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

const ANSI =
{
  '&n': '\u001b[0m',
  '&d': '\u001b[1m',      // bold
  '&i': '\u001b[3m',      // italic
  '&u': '\u001b[4m',      // underline
  '&l': '\u001b[5m',      // blink
  '&k': '\u001b[30m',     // black
  '&Ki': '\u001b[1;3;30m', // black, bold, italic
  '&K': '\u001b[1;30m',
  '&r': '\u001b[31m',
  '&Ri': '\u001b[1;3;31m', // red, bold, italic
  '&R': '\u001b[1;31m',
  '&g': '\u001b[32m',
  '&Gi': '\u001b[1;3;32m', // green, bold, italic
  '&G': '\u001b[1;32m',
  '&y': '\u001b[33m',
  '&Y': '\u001b[1;33m',
  '&b': '\u001b[34m',
  '&Bi': '\u001b[1;3;34m', // blue, bold, italic
  '&B': '\u001b[1;34m',
  '&m': '\u001b[35m',
  '&M': '\u001b[1;35m',
  '&c': '\u001b[36m',
  '&C': '\u001b[1;36m',
  '&w': '\u001b[37m',
  '&W': '\u001b[1;37m'
};

/*
/// Zatim nepouzito.
const ANSI256 = ['#000', '#B00', '#0B0', '#BB0', '#00B', '#B0B', '#0BB',
                '#BBB', '#555', '#F55', '#5F5', '#FF5', '#55F', '#F5F',
                '#5FF', '#FFF', '#000', '#005', '#008', '#00B', '#00D',
                '#00F', '#050', '#055', '#058', '#05B', '#05D', '#05F',
                '#080', '#085', '#088', '#08B', '#08D', '#08F', '#0B0',
                '#0B5', '#0B8', '#0BB', '#0BD', '#0BF', '#0D0', '#0D5',
                '#0D8', '#0DB', '#0DD', '#0DF', '#0F0', '#0F5', '#0F8',
                '#0FB', '#0FD', '#0FF', '#500', '#505', '#508', '#50B',
                '#50D', '#50F', '#550', '#555', '#558', '#55B', '#55D',
                '#55F', '#580', '#585', '#588', '#58B', '#58D', '#58F',
                '#5B0', '#5B5', '#5B8', '#5BB', '#5BD', '#5BF', '#5D0',
                '#5D5', '#5D8', '#5DB', '#5DD', '#5DF', '#5F0', '#5F5',
                '#5F8', '#5FB', '#5FD', '#5FF', '#800', '#805', '#808',
                '#80B', '#80D', '#80F', '#850', '#855', '#858', '#85B',
                '#85D', '#85F', '#880', '#885', '#888', '#88B', '#88D',
                '#88F', '#8B0', '#8B5', '#8B8', '#8BB', '#8BD', '#8BF',
                '#8D0', '#8D5', '#8D8', '#8DB', '#8DD', '#8DF', '#8F0',
                '#8F5', '#8F8', '#8FB', '#8FD', '#8FF', '#B00', '#B05',
                '#B08', '#B0B', '#B0D', '#B0F', '#B50', '#B55', '#B58',
                '#B5B', '#B5D', '#B5F', '#B80', '#B85', '#B88', '#B8B',
                '#B8D', '#B8F', '#BB0', '#BB5', '#BB8', '#BBB', '#BBD',
                '#BBF', '#BD0', '#BD5', '#BD8', '#BDB', '#BDD', '#BDF',
                '#BF0', '#BF5', '#BF8', '#BFB', '#BFD', '#BFF', '#D00',
                '#D05', '#D08', '#D0B', '#D0D', '#D0F', '#D50', '#D55',
                '#D58', '#D5B', '#D5D', '#D5F', '#D80', '#D85', '#D88',
                '#D8B', '#D8D', '#D8F', '#DB0', '#DB5', '#DB8', '#DBB',
                '#DBD', '#DBF', '#DD0', '#DD5', '#DD8', '#DDB', '#DDD',
                '#DDF', '#DF0', '#DF5', '#DF8', '#DFB', '#DFD', '#DFF',
                '#F00', '#F05', '#F08', '#F0B', '#F0D', '#F0F', '#F50',
                '#F55', '#F58', '#F5B', '#F5D', '#F5F', '#F80', '#F85',
                '#F88', '#F8B', '#F8D', '#F8F', '#FB0', '#FB5', '#FB8',
                '#FBB', '#FBD', '#FBF', '#FD0', '#FD5', '#FD8', '#FDB',
                '#FDD', '#FDF', '#FF0', '#FF5', '#FF8', '#FFB', '#FFD',
                '#FFF', 'rgb(8,8,8)', 'rgb(18,18,18)', 'rgb(28,28,28)',
                'rgb(38,38,38)', 'rgb(48,48,48)', 'rgb(58,58,58)',
                'rgb(68,68,68)', 'rgb(78,78,78)', 'rgb(88,88,88)',
                'rgb(98,98,98)', 'rgb(108,108,108)', 'rgb(118,118,118)',
                'rgb(128,128,128)', 'rgb(138,138,138)', 'rgb(148,148,148)',
                'rgb(158,158,158)', 'rgb(168,168,168)', 'rgb(178,178,178)',
                'rgb(188,188,188)', 'rgb(198,198,198)', 'rgb(208,208,208)',
                'rgb(218,218,218)', 'rgb(228,228,228)', 'rgb(238,238,238)'];
*/

export class TelnetSocketDescriptor extends SocketDescriptor
{
  constructor(socket: net.Socket)
  {
    super(socket);
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  // Sends a string to the user.
  public send(data: string)
  {
    // Convert MUD color codes to ANSI color codes.
    /// (note: this only works for telnet and classic MUD clients)
    data = this.ansify(data);

    this.mySocket.write(data);
  }

  // Sets socket transfer mode, registers event handlers, etc.
  public initSocket()
  {
    // Tell the socket to interpret data as raw binary stream.
    // (it's necessary for unicode characters to transmit correctly)
    this.mySocket.setEncoding('binary');

    // Check that event handler for 'data' event is not already registered.
    this.checkEventHandlerAbsence(
      TelnetSocketDescriptor.events.SOCKET_RECEIVED_DATA);

    // Register event handler for 'data' event.
    this.mySocket.on
    (
      TelnetSocketDescriptor.events.SOCKET_RECEIVED_DATA,
      (data) => { this.onSocketReceivedData(data); }
    );

    // Check that event handler for 'error' event is not already registered.
    this.checkEventHandlerAbsence(
      TelnetSocketDescriptor.events.SOCKET_ERROR);

    // Register event handler for 'error' event.
    this.mySocket.on
    (
      TelnetSocketDescriptor.events.SOCKET_ERROR,
      (error) => { this.onSocketError(error); }
    );

    // Check that event handler for 'close' event is not already registered.
    this.checkEventHandlerAbsence(
      TelnetSocketDescriptor.events.SOCKET_CLOSE);

    // Register event handler for 'close' event.
    this.mySocket.on
    (
      TelnetSocketDescriptor.events.SOCKET_CLOSE,
      () => { this.onSocketClose(); }
    );
  }

  // Closes the socket, ending the connection.
  public disconnect()
  {
    this.send("&wClosing the connection.");
    this.mySocket.end();
  }
 
  // -------------- Protected class data ----------------

  protected static events =
  {
    SOCKET_RECEIVED_DATA: 'data',
    SOCKET_ERROR: 'error',
    SOCKET_CLOSE: 'close'
  }

  // Buffer to accumulate incomplete parts of data stream.
  protected myinputBuffer = "";

  // Command lines waiting to be processed.
  protected myCommandsBuffer = null;

  // ---------------- Event handlers --------------------

  protected async onSocketReceivedData(data: string)
  {
    // Ensure that all newlines are in format CR;LF ('\r\n').
    data = this.normalizeCRLF(data);

    // Do not parse protocol data if user sent just an empty newline.
    // (This is often used by player to refresh prompt)
    if (data !== '\r\n')
    {
      // If nothing remains after parse, that means data container
      // only protocol-specific data so there is nothing else to do.
      if ((data = this.parseProtocolData(data)) == "")
        return;
    }

    /*
    // Discard data that doesn't end with a newline. That's probably
    // some protocol negotiation stuff we haven't been able to catch.
    if (!this.endsWithNewline(data))
      return;
    */
    // It seams that putty sometimes sends data not finished with newline,
    // so if we discard such data, player would not get response she expects
    // to get.
    //   For now I'll leave the check here in order to monitor the issue,
    // but I'll process the data anyways.
    this.endsWithNewline(data);

    // myCommandsBuffer stores commands that are awaiting processing and also
    // serves as a lock. If there is something in it, it means that previous
    // commands from this socket are already being processed and we need to
    // add our new commands to the buffer or we would process them out of
    // order in which we received them.
    if (this.myCommandsBuffer !== null)
    {
      // Just add lines to buffer.
      
      // This strange command appends an array to another array.
      this.myCommandsBuffer.push.apply(this.myCommandsBuffer,
        this.splitInputByNewlines(data));

      // Our new commands will be processed by 'thread' that issued the lock
      // (in the following for cycle).
      return;
    } else
    {
      // If input contains multiple lines, split them.
      this.myCommandsBuffer = this.splitInputByNewlines(data);
    }

    // Handle each line as a separate command. Also trim it (remove leading
    // and trailing white spaces) before processing.
    for (let i = 0; i < this.myCommandsBuffer.length; i++)
    {
      await this.playerConnection
        .processCommand(this.myCommandsBuffer[i].trim());
    }

    // All commands are processed, mark the buffer as empty.
    // (if will also hopefully flag allocated data for freeing from memory)
    this.myCommandsBuffer = null;
  }

  protected onSocketError(error)
  {
    let accountName = "";
    let player = "";

    if (this.playerConnection.accountId.notNull())
    {
      accountName =
        Server.accountManager
        .getAccount(this.playerConnection.accountId).accountName;
    }

    if (accountName)
      player = "Player " + accountName;
    else
      player = "Unknown player";

    // I don't really know what kind of errors can happen here.
    // For now let's just log the error and close the connection.
    Mudlog.log(
      player
      + " has encounterd a socket error, closing the connection: " + error,
      Mudlog.msgType.SYSTEM_ERROR,
      Mudlog.levels.IMMORTAL);

    // This will (hopefully) close the socket, which will generate 'close'
    // event, which will trigger closing of the connection.
    this.mySocket.end();
  }

  protected onSocketClose()
  {
    Server.playerConnectionManager
      .dropPlayerConnection(this.myPlayerConnectionId);
  }

  // -------------- Protected methods -------------------

  // Ensures that all newlines are in format CR;LF ('\r\n').
  protected normalizeCRLF(data: string)
  {
    if (data && data.length)
      data = data.replace(/(\r\n|\n\r)/gi, '\n').replace(/\n/gi, '\r\n');

    return data;
  }

  protected checkEventHandlerAbsence(event: string)
  {
    let registeredEvents =
      events.EventEmitter.listenerCount(this.mySocket, event);
    ASSERT_FATAL(registeredEvents === 0,
      "Event " + event + " is already registered on socket");
  }

  /// TODO: Tohle je tezke provizorum. Zatim to pouze odstrani ze streamu
  /// komunikacni kody, nic to podle nich nenastavuje. Asi by taky bylo fajn
  /// nedelat to rucne, ale najit na to nejaky modul.
  //
  // Processes any protocol-specific data and removes it from the data stream.
  protected parseProtocolData(data: string)
  {
    if (data === "") // Nothing to parse.
      return;

    data = this.myinputBuffer + data;

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
        this.myinputBuffer = data;

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
        this.myinputBuffer = data;

        return "";
      }
      else
        this.myinputBuffer = '';
    }

    /// JSON zatim nepotrebuju
    /*
       if ((data.indexOf('{') !== -1 || data.indexOf('}') !== -1))
       {
   
         let json;
   
         if ((json = data.match(/\{[\s\S]+\}/g)))
         {

          // Using 'in' operator on object with null value would crash the game.
          if (!ASSERT(json !== null, "Invalid json object"))
            return;

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
             this.myinputBuffer = data;
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

  protected endsWithNewline(data: string): boolean
  {
    let accountName = "";
    let player = "";

    if (this.playerConnection.accountId.notNull())
    {
      accountName = Server.accountManager
        .getAccount(this.playerConnection.accountId).accountName;
    }

    if (accountName)
      player = "Player " + accountName;
    else
      player = "Unknown player";

    // (slice(-2) creates a substring starting at two characters from the end)
    if (data.slice(-2) !== '\r\n')
    {
      Mudlog.log(
        player + " has sent data of unknown format not ending with newline: "
        + data,
        Mudlog.msgType.SYSTEM_INFO,
        Mudlog.levels.IMMORTAL);
      return false;
    }

    return true;
  }

  protected splitInputByNewlines(data: string): Array<string>
  {
    let lines: Array<string> = [];

    // (data.slice(0, -2) will create a substring not containing last two
    // characters, which are '\r\n' because that's what we checked for right
    // before)
    if (data.slice(0, -2).indexOf('\r\n') !== -1)
    {
      lines = data.split('\r\n');
    } else
    {
      lines.push(data);
    }

    return lines;
  }

  // Converts MUD color codes (e.g. "&gSomething &wcolorful&g)
  // to ANSI color codes.
  protected ansify(data: string): string
  {
    if (/(&[a-zA-Z])/.test(data))
    {
      for (let code in ANSI)
      {
        let regExp = new RegExp(code, 'g');
        data = data.replace(regExp, ANSI[code]);
      }
    }

    /*
    /// We don't use codes like '&0' right now 
    /// (whatever this is supposed to do)
    if (/&([0-9]+)/.test(data))
      data = data.replace(/&([0-9]+)/ig, '\u001b[38;5;$1m');
    */

    return data;
  }
}