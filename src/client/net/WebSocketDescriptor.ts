/*
  Part of BrutusNEXT

  Encapsulates a web socket.
*/

'use strict';

class WebSocketDescriptor
{
  /*
  constructor(socket: net.Socket)
  {
    this.initSocket();
  }
  */
  
  // -------------- Static class data -------------------

  /*
  // Newlines are normalized to this sequence both before
  // sending (in Message.compose()) and after receiving
  // (in TelnetSocketDescriptor.onSocketReceivedData()).
  static get NEW_LINE() { return '\r\n'; }
  */

  //------------------ Private data ---------------------

  /*
  private static events =
  {
    SOCKET_RECEIVED_DATA: 'data',
    SOCKET_ERROR: 'error',
    SOCKET_CLOSE: 'close'
  }
  */

  /*
  // Buffer to accumulate incomplete parts of data stream.
  private inputBuffer = "";

  // Command lines waiting to be processed.
  private commandsBuffer = [];
  */

  private socket: WebSocket = null;

  // ---------------- Public methods --------------------

  /*
  public static isColorCode(code: string): boolean
  {    
    if (code in ANSI)
      return true;

    return false;
  }
  */

  /*
  // Sends a string to the user.
  public send(data: string)
  {
    /// Base color code (&_) is now replaced with it's respective
    /// color code in Message.compose(), because we would loose
    /// the knowledge of what was the base color if string starts
    /// with other color than base color (or we would have to make it
    /// start with two color codes, which wouldn't be nice).
    /// // Replaces color codes notifying return to message base color with
    /// // message base color code.
    /// // (Message base color is determined by the leading color code of the message).
    /// data = this.expandBaseColor(data);

    // Convert MUD color codes to ANSI color codes.
    // Note: this only works for telnet and classic MUD clients.
    data = this.ansify(data);

    this.socket.write(data);
  }
  */

   // Sends a string to the user.
  public send(data: string)
  {
    this.socket.send(data);
  }

  public connect()
  {
    // Open a web socket;
    this.socket = new WebSocket('ws://localhost:4442');
    //this.initSocket();

    if (this.socket === null)
    {
      alert('Failed to open websocket. Either server is down'
        + ' or there is a problem with your internet connection.');
      /// TODO: Vracet false a vubec to nejak korektne zpracovat
      return;
    }

    this.socket.onopen = (event) => { this.onSocketOpen(event); };
    this.socket.onmessage = (event) => { this.onReceivedMessage(event); };
    this.socket.onclose = (event) => { this.onSocketClose(event); };
  }

  // ---------------- Private methods -------------------

  /*
  // Sets socket transfer mode, registers event handlers, etc.
  private initSocket()
  {
    if (this.socket === null)
    {
      alert('Failed to open websocket. Either server is down'
        + ' or there is a problem with your internet connection.');
      /// TODO: Vracet false a vubec to nejak korektne zpracovat
      /// - ze se nepovedlo otevrit socket by asi slo zjistit uz driv.
      return;
    }

    // Register event handlers
    // (lambda functions are used in order to pass correct 'this').
    this.socket.onopen = (event) => { this.onSocketOpen(event); };
    this.socket.onmessage = (event) => { this.onReceivedMessage(event); };
    this.socket.onclose = (event) => { this.onSocketClose(event); };
  }
  */

  /*
  // Closes the socket, ending the connection.
  public closeSocket()
  {
    this.socket.end();
  }
  */

  // ---------------- Event handlers --------------------

  private onSocketOpen(event: Event)
  {
    console.log('Socket opened');
  }

  private onReceivedMessage(event: MessageEvent)
  {
    console.log('Received message: ' + event.data);
  }

  private onSocketClose(event: CloseEvent)
  {
    console.log('Socket closed');
  }

  /*
  protected async onSocketReceivedData(data: string)
  {
    // this.inputBuffer is used to store incomplete parts of commands.
    // If there is something in it, add new data to it and process it all
    // as a whole.
    data = this.inputBuffer + data;
    this.inputBuffer = "";

    // Make sure that all newlines are representedy by '\r\n'.
    data = Utils.normalizeCRLF(data);

    // Do not parse protocol data if user sent just an empty newline.
    // (This is often used by player to refresh prompt)
    if (data !== TelnetSocketDescriptor.NEW_LINE)
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

  protected onSocketError(error)
  {
    let player = "";

    if (this.connection.account !== null)
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
    if (!this.socketClosed)
    {
      // I don't really know what kind of errors can happen here.
      // For now let's just log the error and close the connection.
      Syslog.log
      (
        player
        + " has encounterd a socket error, closing the connection. " + error,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );
    }

    this.closeSocket();
  }

  protected onSocketClose()
  {
    this.socketClosed = true;

    if (this.connection !== null)
      this.connection.onSocketClose();
  }
  */

  // -------------- Protected methods -------------------

  /*
  protected checkEventHandlerAbsence(event: string)
  {
    let registeredEvents =
      events.EventEmitter.listenerCount(this.socket, event);

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
    let lastNewlineIndex = data.lastIndexOf(TelnetSocketDescriptor.NEW_LINE);

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

  protected async processInput(input: string)
  {
    // Split input by newlines.
    let lines = input.split(TelnetSocketDescriptor.NEW_LINE);

    // And push each line as a separate command to commandsBuffer[] to be
    // processed (.push.apply() appends an array to another array).
    this.commandsBuffer.push.apply(this.commandsBuffer, lines);

    // Handle each line as a separate command.
    for (let command of this.commandsBuffer)
    {
      // Trim the command (remove leading and trailing white
      // spaces, including newlines) before processing.
      await this.connection.processCommand(command.trim());
    }

    // All commands are processed, mark the buffer as empty.
    // (if will also hopefully flag allocated data for freeing from memory)
    this.commandsBuffer = [];
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

    return data;
  }
  */

  /// Base color code (&_) is now replaced with it's respective
  /// color code in Message.
  /*
  // Replaces color codes notifying return to message base color with
  // message base color code.
  // (Message base color is determined by the leading color code of the message).
  protected expandBaseColor(data: string): string
  {
    // Extract 2 characters starting at index '0'. 
    let baseColor = data.substr(0, 2);

    if (TelnetSocketDescriptor.isColorCode(baseColor) === false)
    {
      ERROR("Message '" + data + "' doesn't start with color code"
        + " so it is not possible to determine message base color."
        + " Leading color code is supposed to be added in"
        + " MessagePart.format()");
      
      // Use '&w' as base color.
      baseColor = '&w';
      data = baseColor + data;

      data = baseColor + data;
    }
    
    // '&_' stands for 'return to base color'.
    let regExp = new RegExp('&_', 'g');

    // Replace all '&_' sequences with baseColor.
    return data.replace(regExp, baseColor);
  }
  */
}

export = WebSocketDescriptor;