/* --- Part of BrutusNext --- */

/*
  Removes old build.
*/

'use strict';

const fs = require('fs-extra');

console.log('Removing old build...');

rmTree("./Client/js/Client");
rmTree("./Client/js/Shared");
rmTree("./Build/js/Server");
rmTree("./Build/js/Shared");

// Removes directory 'path' even if it's not empty.
function rmTree(path)
{
  fs.removeSync(path);
};