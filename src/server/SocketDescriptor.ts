﻿/*
  Part of BrutusNEXT

  Implements container for information associated to a socket.
*/

import {ASSERT} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {GameServer} from '../server/GameServer';
import {AuthProcessor} from '../server/AuthProcessor';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js

/*
enum UserState { AUTHENTICATION, LOBBY, ONLINE };
*/

export class SocketDescriptor
{
  constructor
    (
    protected mySocket: net.Socket,
    protected myId
    )
  { }

  // ----------------- Public data ----------------------

  public get socket() { return this.mySocket; }

  // ---------------- Public methods --------------------

  public startLoginProcess()
  {
    this.myAuthProcessor.startLoginProcess();
  }

  public socketReceivedData(data: string)
  {
    console.log("SocketDescriptor.socketReceivedData()");

    data = this.normalizeCRLF(data);

    // Do not parse protocol data if user sent just an empty newline.
    if (data !== "" && data !== '\r\n')
    {
      if ((data = this.parseProtocolData(data)) == "")
        return;
    }

    console.log("Data after protocol parse: " + data);

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
    /// TODO
    console.log("SocketDescriptor.socketClose()");
  }

  public socketError()
  {
    /// TODO: Poslat nejake info hraci, ze se stalo neco zleho.
    /// (zatim naprosto netusim, pri jake prilezitosti muze socket error
    /// nastat)
  }

  // Sends a string to the user.
  public send(data: string)
  {
    this.mySocket.write(data);
  }

  // -------------- Protected class data ----------------

  // Empty string means that we do not yet know what account does this
  // descriptor match to.
  protected myAccountId = "";

  // Buffer to accumulate incomplete parts of data stream.
  protected myBuffer = "";

  protected myAuthProcessor = new AuthProcessor(this);

  /*
  protected myUserState: UserState = UserState.AUTHENTICATION;
  */

  // -------------- Protected methods -------------------

  // Parses and executes a single-line command.
  protected processCommand(command: string)
  {
    if (this.myAccountId === "")
    {
      this.myAuthProcessor.processCommand(command);
    } else
    {
      GameServer.getInstance().accountManager.
        getAccount(this.myAccountId).processCommand(command);
    }

    /*
    switch (this.myUserState)
    {
      case UserState.AUTHENTICATION:
        ///this.myAuthenticationProcessor.processCommand();
        break;

      case UserState.LOBBY:
        ///this.myLobbyProcessor.processCommand();
        break;

      case UserState.ONLINE:
        ///this.myCharacter.processCommand();
        break;

      default:
        ASSERT(false, "Unknown user state");
        break;
    }
    */
  }

  // Ensures that all newlines are in format CR;LF ('\r\n');
  protected normalizeCRLF(data: string)
  {
    if (data && data.length)
      data = data.replace(/(\r\n|\n\r)/gi, '\n').replace(/\n/gi, '\r\n');

    return data;
  }

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