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

import {ClientApp} from '../client/lib/ClientApp';

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