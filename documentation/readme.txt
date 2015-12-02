
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