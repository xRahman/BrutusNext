/*
  Part of BrutusNEXT

  Client application launcher
*/

/*
  Initializes module loader (requirejs), then launches BrutusNext client.
*/

'use strict';

// This variable is actualy declared in require.js,
// we just let typescript know that it exists.
var requirejs;

requirejs.config
(
  {
    paths:
    {
      'js-beautify': './js-beautify/beautify',
      'fastbitset': './fastbitset/FastBitSet',
      'fastpriorityqueue': './fastpriorityqueue/FastPriorityQueue',
      'isomorphic-ws': './isomorphic-ws/browser'
    }
  }
);

///console.log('Main.js');

// 3rd party modules are required here to prevent errors like:
//   "Uncaught Error: Module name "js-beautify" has not
//    been loaded yet for context: _"
require(['js-beautify']);
require(['fastbitset']);
require(['fastpriorityqueue']);
require(['isomorphic-ws']);

// Launch the client.
require(['./BrutusNext/Client/BrutusNextClient']);
