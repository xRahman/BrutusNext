/*
          ____             _               _   _ ________   _________
         |  _ \           | |             | \ | |  ____\ \ / /__   __|
         | |_) |_ __ _   _| |_ _   _ ___  |  \| | |__   \ V /   | |
         |  _ <| '__| | | | __| | | / __| | . ` |  __|   > <    | |
         | |_) | |  | |_| | |_| |_| \__ \ | |\  | |____ / . \   | |
         |____/|_|   \__,_|\__|\__,_|___/ |_| \_|______/_/ \_\  |_|

                        Server program entry point

  To run the server:
    node --use_strict ./src/BrutusServer [options]

  Options:
    -p, --port ... Port to listen to telnet (default is 4443).

  Note: server needs to be run in ES 5 strict mode. If you ommit --use_strict
  option, code won't compile.
*/

/*
// Include global functions.
GLOBAL.checkArguments = require('./shared/Utils').checkArguments;
// GLOBAL.mudlog = require('./shared/Utils').mudlog;
GLOBAL.ASSERT = require('./shared/Utils').assert;
*/

/*
// Include required class constructors.
let Server = require('./server/Server');

// Create a server as a global variable.
let server = new Server();
*/

/*
// Parse commandline parameters.
// - Return object imported from 'commander' module.
function parseCmdlineParams()
{
  let parser = require('commander');

  parser.option(
      '-p, --port [portNumber]',
      'Port to listen to telnet [default: ' + Server.DEFAULT_TELNET_PORT + ']',
      Server.DEFAULT_TELNET_PORT);
  parser.parse(process.argv);

  return parser;
}
*/

// Program entry point.
// It's called main() to sound familiar to C programmers ;)
function main()
{
/*
  // Include package.json
  // (it contains version number and list of all required modules along with
  // their required version)
  let packageDotJson = require('../package.json');

  // Log our name and version.
  // TODO: Predelat na syslog
  console.log(packageDotJson.name + " server v. " + packageDotJson.version);

  let cmdlineParser = parseCmdlineParams();

  // Run the server on parameter-specified port.
  server.run(cmdlineParser.port);

  ASSERT(true);
  */

  console.log("We are up and running!");
}

// Run the main() function.
// (it's not done automatically in JavaScript)
main();
