/* --- Part of BrutusNext --- */

/*
  Removes old build.
*/

'use strict';

const fs = require('fs-extra');

console.log('Removing old build...');

rmTree("./Client/js/BrutusNext");
rmTree("./Server/js/BrutusNext");

// Removes directory 'path' even if it's not empty.
function rmTree(path)
{
  fs.removeSync(path);
};