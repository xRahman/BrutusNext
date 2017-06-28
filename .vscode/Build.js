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
const fs = require('fs');

console.log('Removing old build...');

rmTree("./build/client/js/client");
rmTree("./build/client/js/shared");
rmTree("./build/server/js/server");
rmTree("./build/server/js/shared");

console.log('Compiling typescript code...');

// Compile client code.
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

// Compile server code.
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


// Removes directory 'path' even if it's not empty.
function rmTree(path)
{
  if (fs.existsSync(path))
  {
    fs.readdirSync(path).forEach
    (
      function(file)
      {
        let currentPath = path + "/" + file;

        if (fs.statSync(currentPath).isDirectory())
        {
          // Recurse.
          rmTree(currentPath);
        }
        else
        {
          // Delete file.
          fs.unlinkSync(currentPath);
        }
      }
    );

    fs.rmdirSync(path);
  }
};