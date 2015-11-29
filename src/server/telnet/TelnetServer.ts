﻿/*
  Part of BrutusNEXT

  Implements container for connected player and thei accounts.
*/

import {Mudlog} from '../../server/Mudlog';
import {Server} from '../../server/Server';
import {ASSERT_FATAL} from '../../shared/ASSERT';


/*
// TODO: Prepsat telnet.js do TypeScriptu.

// To be able to require() JavaScript modules from TypeScript, we need
// to declare function require():
declare function require(name: string): any;
let telnet = require('../../../3rdparty/telnet.js');
*/

export class TelnetServer
{
  public start()
  {
  }

  constructor(public port: number) { }

  protected init(restart_server)
  {

    /*
    util.log("START - Loading entities");
    players = new PlayerManager([]);
    restart_server =
    typeof restart_server === 'undefined' ? true : restart_server;

    Commands.configure({
      rooms: rooms,
      players: players,
      items: items,
      npcs: npcs,
      locale: commander.locale
    });

    Events.configure({
      players: players,
      items: items,
      locale: commander.locale,
      npcs: npcs,
      rooms: rooms
    });
    */

    // Nakonec spis pojedu podle Havocu, takze tohle asi zrusit
    if (restart_server)
    {
      Mudlog.log(
        "Starting telnet server...",
        Mudlog.msgType.SYSTEM_INFO,
        Mudlog.levels.IMMORTAL);

      /*
      // Effectively the 'main' game loop but not really because it's a REPL
      this.myServer = new telnet.Server(connectionListener(socket));

      // Start the telnet server
      this.myServer.listen(this.port).on('error', errorHandler(err));
      */
      

      /*
      // save every 10 minutes
      util.log("Setting autosave to " + commander.save + " minutes.");
      clearInterval(saveint);
      saveint = setInterval(save, commander.save * 60000);

      // respawn every 20 minutes, probably a better way to do this
      util.log("Setting respawn to " + commander.respawn + " minutes.");
      clearInterval(respawnint);
      respawnint = setInterval(load, commander.respawn * 60000);

      Plugins.init(true, {
        players: players,
        items: items,
        locale: commander.locale,
        npcs: npcs,
        rooms: rooms,
        server: server
      });
      */
    }

    /*
    load(function(success)
    {
      if (success)
      {
        util.log(util.format("Server started on port: %d %s",
          commander.port, '...'));
        server.emit('startup');
      } else
      {
        process.exit(1);
      }
    });
    */
  }

  protected myServer; // No type because it's exported from 3rd party file.
}

// ---------------------- private module stuff -------------------------------



















/*
  // built-ins
var net = require('net'),
  util = require('util'),
  express = require('express'),
  commander = require('commander'),

  // local
  Commands = require('./src/commands').Commands,
  Rooms    = require('./src/rooms').Rooms,
  Npcs     = require('./src/npcs').Npcs,
  Items    = require('./src/items').Items,
  Data     = require('./src/data').Data,
  Events   = require('./src/events').Events,
  Plugins  = require('./src/plugins'),
  PlayerManager = require('./src/player_manager').PlayerManager,

  // third party
  Localize  = require('localize'),
  argv = require('optimist').argv,
  telnet = require('./src/3rdparty/telnet.js');

// These aren't really globals, they're only "global" to this file,
// we'll pass them around via construction as needed

  //storage of main game entities
  var players,
      rooms = new Rooms(),
      items = new Items(),
      npcs  = new Npcs(),
      server,

      // Stuff for the server executable
      l10n,
      respawnint,
      saveint;

// cmdline options
commander
  .version('0.0.1') // tofix: yank from package.json
//  .option('-s, --save [time]',
//    'Number of minutes between auto-save ticks [10]', 10)
//  .option('-r, --respawn [time]',
//    'Number of minutes between respawn tickets [20]', 20)
  .option('-p, --port [portNumber]', 'Port to host telnet server [23]', 23)
//  .option('-l, --locale [lang]', 'Default locale for the server', 'en')
  .option('-v, --verbose', 'Verbose console logging.')
  .parse(process.argv);

// Do the dirty work
var init = function (restart_server)
{
  util.log("START - Loading entities");
  players = new PlayerManager([]);
  restart_server =
    typeof restart_server === 'undefined' ? true : restart_server;

  Commands.configure({
    rooms: rooms,
    players: players,
    items: items,
    npcs: npcs,
    locale: commander.locale
  });

  Events.configure({
    players: players,
    items: items,
    locale:  commander.locale,
    npcs: npcs,
    rooms: rooms
  });

  if (restart_server) {
    util.log("START - Starting server");

    // Effectively the 'main' game loop but not really because it's a REPL
    server = new telnet.Server(function (socket) {
      socket.on('interrupt', function () {
        socket.write("\n*interrupt*\n");
      });

      // Register all of the events
      for (var event in Events.events) {
        socket.on(event, Events.events[event]);
      }

      socket.write("Connecting...\n");
      util.log("User connected...");
      // @see: src/events.js - Events.events.login
      socket.emit('login', socket);
    });

    // start the server
    server.listen(commander.port).on('error', function(err) {
      if (err.code === 'EADDRINUSE') {
        util.log("Cannot start server on port " + commander.port + ",
          address is already in use.");
        util.log("Do you have a MUD server already running?");
      } else if (err.code === 'EACCES') {
        util.log("Cannot start server on port " + commander.port
          + ": permission denied.");
        util.log("Are you trying to start it on a priviledged port without"
          + "being root?");
      } else {
        util.log("Failed to start MUD server:");
        util.log(err);
      }
      process.exit(1);
    });

    // save every 10 minutes
    util.log("Setting autosave to " + commander.save + " minutes.");
    clearInterval(saveint);
    saveint = setInterval(save, commander.save * 60000);

    // respawn every 20 minutes, probably a better way to do this
    util.log("Setting respawn to " + commander.respawn + " minutes.");
    clearInterval(respawnint);
    respawnint = setInterval(load, commander.respawn * 60000);

    Plugins.init(true, {
      players: players,
      items:   items,
      locale:  commander.locale,
      npcs:    npcs,
      rooms:   rooms,
      server:  server
    });

  }

  load(function (success) {
    if (success) {
      util.log(util.format("Server started on port: %d %s",
        commander.port, '...' ));
      server.emit('startup');
    } else {
      process.exit(1);
    }
  });
};

// START IT UP!
init();

// Save all connected players
function save()
{
  util.log("Saving...");
  players.each(function (p) {
    p.save();
  });
  util.log("Done");
}

// Load rooms, items, npcs. Register items and npcs to their base locations.
// Configure the event and command modules after load. Doubles as a "respawn"
function load(callback)
{
  util.log("Loading rooms...");
  rooms.load(commander.verbose, function () {
    util.log("Done.");
    util.log("Loading items...");
    items.load(commander.verbose, function () {
      util.log("Done.");

      util.log("Adding items to rooms...");
      items.each(function (item) {
        if (item.getRoom()) {
          var room = rooms.getAt(item.getRoom());
          if (!room.hasItem(item.getUuid())) {
            room.addItem(item.getUuid());
          }
        }
      });
      util.log("Done.");

      util.log("Loading npcs...");
      npcs.load(commander.verbose, function () {
        util.log("Done.");

        util.log("Adding npcs to rooms...");
        npcs.each(function (npc) {
          if (npc.getRoom()) {
            var room =rooms.getAt(npc.getRoom());
            if (!room.hasNpc(npc.getUuid())) {
              room.addNpc(npc.getUuid());
            }
          }
        });
        util.log("Done.");
        if (callback) {
          callback(true);
        }
      });
    });
  });
}

// Not game stuff, this is for the server executable
process.stdin.setEncoding('utf8');
l10n = new Localize(require('js-yaml')
  .load(require('fs')
  .readFileSync(__dirname + '/l10n/server.yml')
  .toString('utf8')), undefined, 'zz');

// Commands that the server executable itself accepts
var server_commands = {
  // Hotboot, AKA do everything involved with a restart but keep players
  // connected
  hotboot : function (args)
  {
    args = args ? args.split(' ') : [];
    var warn = args[0] && args[0] === 'warn';
    var time = args[0] ? parseInt(args[warn ? 1 : 0], 10) : 0;

    if (time && time < 20) {
      console.log("Gotta give the players a bit longer than that, might as"
        + " well do it instantly...");
      return;
    }
    time = time ? time * 1000 : 0;

    if (warn) {
      warn = function (interval) {
        players.broadcastL10n(l10n, 'HOTBOOT_WARN', interval);
        players.each(function(p) {p.prompt();});
      };
      warn(time / 1000 + " seconds");
      setTimeout(
          function ()
          {
            warn(Math.floor((time / 4) / 1000) + " seconds");
          },
          time - Math.floor(time / 4)
      );
    }

    util.log("HOTBOOTING SERVER" + (time ? " IN " + (time / 1000)
      + " SECONDS " : ''));
    setTimeout(function () {
      util.log("HOTBOOTING...");
      save();
      init(false);
    }, time);
  },

  // Hard restart: saves and disconnects all connected players.
  restart: function (args)
  {
    args = args ? args.split(' ') : [];
    var warn = args[0] && args[0] === 'warn';
    var time = args[0] ? parseInt(args[warn ? 1 : 0], 10) : 0;

    if (time && time < 20) {
      console.log("Gotta give the players a bit longer than that, might as"
        + "well do it instantly...");
      return;
    }
    time = time ? time * 1000 : 0;

    if (warn) {
      warn = function (interval) {
        players.broadcastL10n(l10n, 'RESTART_WARN', interval);
        players.each(function(p) {p.prompt();});
      };
      warn(time / 1000 + " seconds");
      setTimeout(
          function ()
          {
            warn(Math.floor((time / 4) / 1000) + " seconds");
          },
          time - Math.floor(time / 4));
    }

    util.log("RESTARTING SERVER"
      + (time ? " IN " + (time / 1000) + " SECONDS " : ''));
    setTimeout(function () {
      util.log("RESTARTING...");
      save();
      server.emit('shutdown');
      server.close();
      players.each(function (p) { p.getSocket().end(); });
      init(true);
    }, time);
  }
};
//
//process.on('SIGINT', function ()
//{
//  util.log("Shutting down - not so gracefully...");
//  process.exit(0);
//});
//
process.stdin.resume();
process.stdin.on('data', function (data)
{
  data = data.trim();
  var command = data.split(' ')[0];

  if (!(command in server_commands)) {
    console.log("That's not a real command...");
    return;
  }

  server_commands[command](data.split(' ').slice(1).join(' '));
});
// vim: set syn=javascript :
*/


/*
// Nakonec spis pojedu podle Havocu, takze tohle asi zrusit

function interruptHandler(socket)
{
  // netusim proc. TODO: Zjistit
  socket.write("\n*interrupt*\n");
}

function connectionListener(socket)
{
  socket.on('interrupt', interruptHandler(socket));

  // TODO
  // Register all of the events
//  for (var event in Events.events)
//  {
//    socket.on(event, Events.events[event]);
//  }

  socket.write("Connecting...\n");
  Mudlog.log(
    "User connected...",
    Mudlog.msgType.SYSTEM_INFO,
    Mudlog.levels.IMMORTAL);

  // @see: src/events.js - Events.events.login
  socket.emit('login', socket);
}

function errorHandler(err)
{
  let port = Server.getInstance().telnetServer.port;

  if (err.code === 'EADDRINUSE')
  {
    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + port + ", address is already in use.\n"
      + "Do you have a MUD server already running?");
  } else if (err.code === 'EACCES')
  {
    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + port + ", permission denied.\n"
      + "Are you trying to start it on a priviledged port without"
      + " being root?");
  }
  ASSERT_FATAL(false, "Failed to start telnet server:" + err);
}
*/