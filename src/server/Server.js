/*
  Part of BrutusNEXT

  Implements game server.

  Server is a singleton, you can access the instance by Server.getInstance().

  Usage:
    import {Server} from './server/Server';
    Server.create();   // Creates an instance.
    Server.getInstance().run(port); // Specify telnet port number to listen on.

  Server creates and runs it's own game when you .run() it.
*/
var ASSERT_1 = require('../shared/ASSERT');
var ASSERT_2 = require('../shared/ASSERT');
var Mudlog_1 = require('../server/Mudlog');
var Game_1 = require('../game/Game');
var Server = (function () {
    function Server() {
    }
    Object.defineProperty(Server, "DEFAULT_TELNET_PORT", {
        // -------------- static members -------------
        get: function () { return 4443; },
        enumerable: true,
        configurable: true
    });
    Server.getInstance = function () {
        ASSERT_2.ASSERT_FATAL(Server.myInstance !== null && Server.myInstance !== undefined, "Instance of server doesn't exist yet");
        return Server.myInstance;
    };
    // Creates an instance of a server. Server is a singleton, so it must
    // not already exist.
    Server.create = function () {
        if (!ASSERT_1.ASSERT(Server.myInstance === undefined, "Server already exists, not creating it"))
            return;
        Server.myInstance = new Server();
    };
    Object.defineProperty(Server.prototype, "game", {
        // -------------- public members -------------
        get: function () { return this.myGame; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Server.prototype, "players", {
        get: function () { return this.myPlayers; },
        enumerable: true,
        configurable: true
    });
    // Starts the server. This is not a static method so it needs
    // to be called on Server.getInstance(). That's also why it doesn't
    // need to check if instance exists.
    Server.prototype.run = function (telnetPort) {
        this.myTelnetPort = telnetPort;
        // Create the game.
        if (!ASSERT_1.ASSERT(this.myGame === undefined, "Game already exists"))
            return;
        this.myGame = new Game_1.Game();
        // Load the game.
        this.myGame.load();
        Mudlog_1.Mudlog.log("We are up and running at port: " + telnetPort, Mudlog_1.Mudlog.msgType.SYSTEM, Mudlog_1.Mudlog.levels.IMMORTAL);
    };
    Server.prototype.init = function (restart_server) {
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
        if (restart_server) {
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
    };
    return Server;
})();
exports.Server = Server;
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
//# sourceMappingURL=Server.js.map