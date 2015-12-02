/*
  Part of BrutusNEXT

  Implements container for connected player and their accounts.
*/

import {Mudlog} from '../../server/Mudlog';
///import {Server} from '../../server/Server';
import {ASSERT_FATAL} from '../../shared/ASSERT';

/*
// To be able to require() JavaScript modules from TypeScript, we need
// to declare function require():
declare function require(name: string): any;

// Built-in node.js modules
let net = require('net');

// 3rd party modules
///var websocketServer = require('websocket').server;
*/

export class TelnetServer
{
  public start()
  {
  }

  constructor(public port: number) { }

  protected myServer; // No type because it's exported from JavaScript module.
}

// ---------------------- private module stuff -------------------------------

/*
  Mudlog.log(
    "User connected...",
    Mudlog.msgType.SYSTEM_INFO,
    Mudlog.levels.IMMORTAL);

    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + port + ", address is already in use.\n"
      + "Do you have a MUD server already running?");

    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + port + ", permission denied.\n"
      + "Are you trying to start it on a priviledged port without"
      + " being root?");
*/