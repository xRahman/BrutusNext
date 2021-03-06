/*
          ____             _               _   _ _______   ________
         |  _ \           | |             | \ | |  ___\ \ / /_   __|
         | |_) |_ __ _   _| |_ _   _ ___  |  \| | |__  \ V /  | |
         |  _ <| '__| | | | __| | | / __| | . ` |  __|  > <   | |
         | |_) | |  | |_| | |_| |_| \__ \ | |\  | |___ / . \  | |
         |____/|_|   \__,_|\__|\__,_|___/ |_| \_|_____/_/ \_\ |_|

                        Server program entry point

  To run the server you need to compile it first using ./compile, then
  run it using ./server [options]
    (both 'compile' and 'server' scripts are in BrutusNext directory)

  Options:
    -p, --port ... Port to listen to telnet (default is 4443).
*/

'use strict';
import {ERROR} from '../shared/lib/error/ERROR';
import {ServerUtils} from '../server/lib/utils/ServerUtils';
import {ServerApp} from '../server/lib/app/ServerApp';
///import {TelnetServer} from '../server/lib/net/telnet/TelnetServer';
import {Syslog} from '../shared/lib/log/Syslog';
import {MessageType} from '../shared/lib/message/MessageType';
import {AdminLevel} from '../shared/lib/admin/AdminLevel';
///import {Script} from '../server/lib/prototype/Script';

// Include sourcemap support module. It uses .js.map files generated by
// typecript compiler to change stack traces to actually show TypeScript
// stack trace (instead of stack trace in generated JavaScript).
require('source-map-support').install();

///let parser = require('commander');

// Include package.json file (located in BrutusNext directory)
// (it contains version number and list of all required modules along with
// their required version).
// (In case you were wondering, we need to get all the way up
//  from '/build/server/js/server' because the require() is
//  done in runtime.)
let packageDotJson = require('../../../../package.json');

// This handler catches exceptions thrown from withing async (promisified)
// functions. A new exception is thrown, which will crash the mud and print
// the original stack trace. Without this, exceptions thrown from withing
// async function would lead to silent crashes.
process.on
(
  'unhandledRejection',
  (error: Error) =>
  {
    // if (error.name === Script.CANCELLED)
    // {
    //   // Running scripts are cancelled by rejecting the Promise, which
    //   // throws an exception. It is not an error to be reported though.

    //   /// This was used for debugging:
    //   console.log(error.message);
    // }
    // else
    // {
      ServerUtils.reportException(error);
      process.exit(1);

      /*
      throw err;
      */
    // }
  }
);

// This handler catches all uncaught exceptions.
// It can be used to explain what they could posibly
// mean and also syslog them so immortals know what
// happened and it is logged.
process.on
(
  'uncaughtException',
  (error: Error) =>
  {
    ServerUtils.reportException(error);
    process.exit(1);

    /*
    if (err.name === "TypeError")
    {
      /// TODO: Posílat to do syslogu, ne jen do konzole.
      console.log(err.name + " occured: " + err.message);
      typeErrorPossibleExplanation();

      if (err.message.search("object is not extensible") != -1)
      {
        typeErrorPossibleExplanation();
      }

      if (err.message.search("Cannot assign to read only property") != -1)
      {
        typeErrorPossibleExplanation();
      }

      throw err;
    }
    */

    throw error;
  }
)

// Parses commandline parameters.
// - Return object imported from 'commander' module.
// function parseCmdlineParams()
// {
//   parser.option
//   (
//     "-p, --port [portNumber]",
//     "Port to listen to telnet [default: " + TelnetServer.DEFAULT_PORT + "]",
//     TelnetServer.DEFAULT_PORT
//   );

//   parser.parse(process.argv);

//   return parser;
// }

// Program entry point.
// It's called main() to sound familiar to C programmers ;)
async function main()
{
  ///let cmdline = parseCmdlineParams();

  ///await ServerApp.run(cmdline.port);
  await ServerApp.run(packageDotJson.name, packageDotJson.version);
}

// Run the main() function.
// (it's not done automatically in JavaScript)
main();