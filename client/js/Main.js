/*
  Part of BrutusNEXT

  Initializes module loader (requirejs),
  defines 'jquery' module alias,
  launches BrutusNextClient.
*/

'use strict';

// Variable is actually declared in require.js,
// we just let typescript know that it exists.
var requirejs;

requirejs.config
(
  {
    paths:
    {
      // Alias so that you can use 'import $ = require('jquery');'.
      'jquery': '../js/jquery/jquery.slim',
      // Alias so that you can use 'import d3 = require('d3');'.
      'd3': '../js/d3/d3.min',
    }
  }
);

// Launch the client.
require(['../js/build/BrutusNextClient']);