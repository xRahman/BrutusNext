/*
  Part of BrutusNEXT

  This standalone script launches two external tsc processes
  to build both client and server. It is used to circumvent
  vs code limitation of just one build task at the same time.
*/

'use strict';

// We need to use async 'spawn' (instead of spawnSync)
// because we will run tsc process in watch mode so it
// will not end after compilation.
const spawn = require('child_process').spawn;

// Run 'Build Client' task.
const clientBuild = spawn
(
  'node',
  [
    "./node_modules/typescript/lib/tsc.js",
    "--watch",
    "--project", "./src/client"
  ],
  // Child process will use parent's stdios
  // (so they will be displayed in vs code).
  { stdio: 'inherit' }
);

// Run 'Build Server' task.
const serverBuild = spawn
(
  'node',
  [
    "./node_modules/typescript/lib/tsc.js",
    "--watch",
    "--project", "./src/server"
  ],
  // Child process will use parent's stdios
  // (so they will be displayed in vs code).
  { stdio: 'inherit' }
);