/*
  Part of BrutusNEXT

  Encapsulates a telnet socket.
*/

'use strict';

import {ERROR} from '../../../../shared/lib/error/ERROR';
import {Utils} from '../../../../shared/lib/utils/Utils';
import {Syslog} from '../../../../shared/lib/log/Syslog';
import {MessageType} from '../../../../shared/lib/message/MessageType';
import {Account} from '../../../../server/lib/account/Account';
import {AdminLevel} from '../../../../shared/lib/admin/AdminLevel';
import {ServerApp} from '../../../../server/lib/app/ServerApp';
import {ServerSocket} from '../../../../server/lib/net/ServerSocket';
import {Connection} from '../../../../server/lib/connection/Connection';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

// Note: There is also a '&_' code, which means 'return to base color'
// (base color depends on Message.Type, see MessageColors.ts).
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

export class ServerTelnetSocket extends ServerSocket
{
  constructor(socket: net.Socket, ip: string)
  {
    super(ip);

    this.rawSocket = socket;

    this.init();
  }

  // -------------- Static class data -------------------

  //------------------ Private data ---------------------

  private rawSocket: net.Socket = null;

  private static events =
  {
    SOCKET_RECEIVED_DATA: 'data',
    SOCKET_ERROR: 'error',
    SOCKET_CLOSE: 'close'
  }

  // Buffer to accumulate incomplete parts of data stream.
  private inputBuffer = "";

  // ---------------- Public methods --------------------

  // -> Returns remote ip adress read from 'socket'
  //    or 'null' if it doesn't exist on it.
  public static parseRemoteAddress(socket: net.Socket)
  {
    if (socket === null || socket === undefined)
    {
      ERROR('Attempt to read address from an invalid socket');
      return null;
    }

    if (socket.address === undefined)
    {
      ERROR("Missing address on telnet socket");

      return null;
    }

    return socket.remoteAddress;
  }

  public static isColorCode(code: string): boolean
  {    
    if (code in ANSI)
      return true;

    return false;
  }

  // Sends a string to the user.
  public sendMudMessage(data: string)
  {
    // Convert MUD color codes to ANSI color codes.
    // Note: this only works for telnet and classic MUD clients.
    data = this.ansify(data);

    this.rawSocket.write(data);
  }

  // Closes the socket, ending the connection.
  public close()
  {
    if (this.rawSocket)
      this.rawSocket.end();
  }

  // ---------------- Event handlers --------------------

  protected async onReceivedData(data: string)
  {
    // this.inputBuffer is used to store incomplete parts of commands.
    // If there is something in it, add new data to it and process it all
    // as a whole.
    data = this.inputBuffer + data;
    this.inputBuffer = "";

    // Make sure that all newlines are representedy by '\n'.
    data = Utils.normalizeCRLF(data);

    // Do not parse protocol data if user sent just an empty newline.
    // (This is often used by player to refresh prompt)
    if (data !== ServerSocket.NEW_LINE)
    {
      data = this.parseProtocolData(data);

      // If parseProtocolData() returned 'null', it means that data contained
      // only protocol-specific data so there is nothing else to do.
      if (data === null)
        return;
    }

    // Transfer the ending of data stream that is not finished by newline
    // to the input buffer and cut it off of the data.
    let input = this.cutOffUnifinishedCommand(data);

    // Check if there is something to process right now.
    if (input === null)
      return;

    await this.processInput(input);
  }

  protected onError(error)
  {
    let player = "";

    if (this.connection && this.connection.account)
    {
      let accountName = this.connection.account.getName();

      player = "Player " + accountName;
    }
    else
    {
      player = "Unknown player";
    }

    // Sending the syslog message to closed socket would result in
    // another error, which would result in stack overflow.
    if (!this.closed)
    {
      // I don't really know what kind of errors can happen here.
      // For now let's just log the error and close the connection.
      Syslog.log
      (
        player
        + " has encounterd a socket error, closing the connection. " + error,
        MessageType.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );
    }

    this.close();
  }

  protected onClose()
  {
    this.closed = true;

    if (this.connection !== null)
      this.connection.onSocketClose();
  }

  // -------------- Protected methods -------------------

  protected checkEventHandlerAbsence(event: string)
  {
    let registeredEvents =
      events.EventEmitter.listenerCount(this.rawSocket, event);

    if (registeredEvents !== 0)
      ERROR("Event " + event + " is already registered on socket");
  }

  /// TODO: Tohle je tezke provizorum. Zatim to pouze odstrani ze streamu
  /// komunikacni kody, nic to podle nich nenastavuje. Asi by taky bylo fajn
  /// nedelat to rucne, ale najit na to nejaky modul.
  ///
  // Processes any protocol-specific data and removes it from the data stream.
  // -> Returns null if there is nothing left after protocol-specific data
  //    is removed.
  protected parseProtocolData(data: string): string
  {
    if (data === "") // Nothing to parse.
      return null;

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
        this.inputBuffer = data;

        return null;
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
        this.inputBuffer = data;

        return null;
      }
      else
        this.inputBuffer = '';
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
             this.inputBuffer = data;
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

  // Transfers the ending of data stream that is not finished by newline
  // to the input buffer and cuts it off of the data.
  // -> Returns null if there are no data to be processed right now.
  protected cutOffUnifinishedCommand(data: string): string
  {
    // Telnet protocol doesn't ensure that packet ends with newline. It
    // means that we can only process part of the input up until the last
    // newline (if there is any). There rest (or everything, if there is no
    // newline in input at all) needs to be buffered until the rest of the
    // data arrives.
    let lastNewlineIndex = data.lastIndexOf(ServerSocket.NEW_LINE);

    if (lastNewlineIndex === -1)
    {
      // If there is no newline in input, just buffer the data.
      this.inputBuffer += data;

      return null;
    }

    // If there is a newline in input and there is something after
    // the last '\r\n', add the 'something' to input buffer.
    if (lastNewlineIndex !== data.length - 2)
    {
      // +2 to skip '\r\n'.
      this.inputBuffer += data.substring(lastNewlineIndex + 2);
    }

    // If the last newline of inputBuffer is located at it's very beginning,
    // it means that user has sent just a newline - by hitting enter without
    // typing anything.
    if (lastNewlineIndex === 0)
      // We must return empty string rather than '\r\n', becuase data will
      // later be split by newlines, so returning newline would result in
      // two "" commands instead of just one (string '\r\n' split by '\r\n'
      // results in ["", ""]).
      return "";

    // Otherwise we cut off the buffered part of data including the last
    // newline, so the last newline won't get processed as a separate command
    // (that would mess the things up).
    // (substr() extracts 'lastNewlineIndex' characters from 'data' beginning
    // at index '0')
    return data.substr(0, lastNewlineIndex);
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
        // '\u001b[0m' code turns off all attributes. Without it,
        // 'bold' attribute, which is used to output bright colors,
        // would stay on forever.
        /// TODO: Asi by se to dalo trochu optimalizovat. Stacilo by
        /// posilat reset jen kdyz jde tmava barva po jasne.
        data = data.replace(regExp, '\u001b[0m' + ANSI[code]);
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

  // --------------- Private methods --------------------

  // Sets socket transfer mode, registers event handlers, etc.
  private init()
  {
    if (this.rawSocket === null || this.rawSocket === undefined)
    {
      ERROR('Attempt to init invalid socket');
      return;
    }

    // Tell the socket to interpret data as raw binary stream.
    // (it's necessary for unicode characters to transmit correctly)
    this.rawSocket.setEncoding('binary');

    // Check that event handler for 'data' event is not already registered.
    this.checkEventHandlerAbsence
    (
      ServerTelnetSocket.events.SOCKET_RECEIVED_DATA
    );

    // Register event handler for 'data' event.
    this.rawSocket.on
    (
      ServerTelnetSocket.events.SOCKET_RECEIVED_DATA,
      (data) => { this.onReceivedData(data); }
    );

    // Check that event handler for 'error' event is not already registered.
    this.checkEventHandlerAbsence
    (
      ServerTelnetSocket.events.SOCKET_ERROR
    );

    // Register event handler for 'error' event.
    this.rawSocket.on
    (
      ServerTelnetSocket.events.SOCKET_ERROR,
      (error) => { this.onError(error); }
    );

    // Check that event handler for 'close' event is not already registered.
    this.checkEventHandlerAbsence
    (
      ServerTelnetSocket.events.SOCKET_CLOSE
    );

    // Register event handler for 'close' event.
    this.rawSocket.on
    (
      ServerTelnetSocket.events.SOCKET_CLOSE,
      () => { this.onClose(); }
    );
  }
}