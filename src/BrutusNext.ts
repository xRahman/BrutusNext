/*
          ____             _               _   _ ________   _________
         |  _ \           | |             | \ | |  ____\ \ / /__   __|
         | |_) |_ __ _   _| |_ _   _ ___  |  \| | |__   \ V /   | |
         |  _ <| '__| | | | __| | | / __| | . ` |  __|   > <    | |
         | |_) | |  | |_| | |_| |_| \__ \ | |\  | |____ / . \   | |
         |____/|_|   \__,_|\__|\__,_|___/ |_| \_|______/_/ \_\  |_|

                        Server program entry point

  To run the server you need to compile it first using ./compile, then
  run it using ./server [options]
    (both 'compile' and 'server' scripts are in BrutusNext directory)

  Options:
    -p, --port ... Port to listen to telnet (default is 4443).
*/

'use strict';

import {Mudlog} from './server/Mudlog';
import {Server} from './server/Server';

// Include sourcemap support module. It uses .js.map files generated by
// typecript compiler to change stack traces to actually show TypeScript
// stack trace (instead of stack trace in generated JavaScript).
require('source-map-support').install();

let parser = require('commander');

// Include package.json file (located in BrutusNext directory)
// (it contains version number and list of all required modules along with
// their required version)
let packageDotJson = require('../package.json');

// Oznami, ze Promise sezrala exception a nic nerekla a crashne mud.
process.on('unhandledRejection', err => { throw err; });
/*
process.on
(
  'unhandledRejection',
  function(reason, p)
  {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here

    // There is no point in throwing another exception from here, stack trace
    // would not show anything useful.
    process.exit(1);
  }
);
*/

// Parses commandline parameters.
// - Return object imported from 'commander' module.
function parseCmdlineParams()
{
  parser.option(
      "-p, --port [portNumber]",
      "Port to listen to telnet [default: " + Server.DEFAULT_TELNET_PORT + "]",
      Server.DEFAULT_TELNET_PORT);

  parser.parse(process.argv);

  return parser;
}

// Program entry point.
// It's called main() to sound familiar to C programmers ;)
function main()
{
  // Log our name and version.
  Mudlog.log(
    packageDotJson.name + " server v. " + packageDotJson.version,
    Mudlog.msgType.SYSTEM_INFO,
    Mudlog.levels.IMMORTAL);

  let cmdlineParser = parseCmdlineParams();

  // Create an instance of server.
  // (server is a singleton so we use static method to do it)
  Server.create();
  // Run the server at specified telnet port.
  Server.getInstance().run(cmdlineParser.port);
}

// Run the main() function.
// (it's not done automatically in JavaScript)
main();
