
Jak zdedit classu z node.js EventEmitteru
-------------------------------------------

/// <reference path="../typings/node/node.d.ts" />
import * as events from "events";

class foo extends events.EventEmitter
{
  constructor()
  {
    super();
  }

  someFunc()
  {
    this.emit('doorbell');
  }
}

Tutorial k even emmiterum:
---------------------------

http://www.hacksparrow.com/node-js-eventemitter-tutorial.html


Tutorial k websocket serveru v TypeScriptu pod node.js
---------------------------------------------------------
http://www.codeproject.com/Articles/871622/Writing-a-chat-server-using-Node-js-TypeScript-and

Totez v JavaScriptu:
https://nodejs.org/api/net.html