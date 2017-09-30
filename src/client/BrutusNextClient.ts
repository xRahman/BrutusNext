/*
          ____             _               _   _ _______   ________
         |  _ \           | |             | \ | |  ___\ \ / /_   __|
         | |_) |_ __ _   _| |_ _   _ ___  |  \| | |__  \ V /  | |
         |  _ <| '__| | | | __| | | / __| | . ` |  __|  > <   | |
         | |_) | |  | |_| | |_| |_| \__ \ | |\  | |___ / . \  | |
         |____/|_|   \__,_|\__|\__,_|___/ |_| \_|_____/_/ \_\ |_|

                        Client program entry point

*/

'use strict';

import {ClientApp} from '../client/lib/app/ClientApp';

/// Tohle je asi zbytečný. Sice to funguje, ale udělá to jen to, že
/// chrome místo 'Uncaught (in promise) Error: [ERROR]: ...' vypíše
/// 'Uncaught Error: [ERROR]: ...'. To už je asi lepší nechat tam to
/// info, že error nastal v async funkci.
///
/// Also unlike in node.js, Chrome doesn't silently eat exceptions
/// occuring inside promises so we don't really need to re-throw
/// then on client.
///
// This handler catches exceptions thrown from withing async (promisified)
// functions.
// window.addEventListener
// (
//   'unhandledrejection',
//   (event: PromiseRejectionEvent) =>
//   {
//     if (event.reason.name === ClientApp.APP_ERROR)
//     {
//       event.preventDefault();
//       throw event.reason;
//     }
//   }
// );

// Program entry point.
// It's called main() to sound familiar to C programmers ;)
async function main()
{
  console.log('BrutusNext client is running!');

  // Create and run an instance of ClientApp.
  // (It will handle the creation of all html elements
  //  inside our application, handle events, etc.)
  ClientApp.run();
}

// Run the main() function.
// (it's not done automatically in JavaScript)
main();