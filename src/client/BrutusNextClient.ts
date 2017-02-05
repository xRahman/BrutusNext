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

import {Client} from '../client/lib/Client';

// Program entry point.
// It's called main() to sound familiar to C programmers ;)
function main()
{
  console.log('BrutusNext client is running!');

  // Create an instance of class Client.
  //   It will handle the creation of all html elements inside
  // our application, handle events, etc.
  Client.create();
}

// Run the main() function.
// (it's not done automatically in JavaScript)
main();